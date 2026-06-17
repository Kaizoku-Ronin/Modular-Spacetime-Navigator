// ============================================================
// shipRenderer.ts — draw a ShipMesh into the flight canvas
// ------------------------------------------------------------
// Additive module. Does NOT touch flightRenderer / RS / the
// existing scene. Reuses the project's own relativistic optics
// (aberrateLocal / dopplerLocal) so a ship is boosted into the
// observer's frame exactly like every other object: each VERTEX
// is aberrated, so the hull deforms correctly at high beta, and
// each face is Doppler-tinted. This is the mesh analogue of
// solarRenderer.projectWorld — same conventions, same AU scale.
//
// Customization + boost (this revision):
//   pose.accent  -> wings/fin color   (per-player)
//   pose.hull    -> hull color        (per-player; hullDark derived)
//   pose.boost   -> 0..1 engine drive: scales exhaust glow AND draws
//                   an additive thruster plume behind each nozzle.
//   If pose.boost is omitted it defaults to boostFromBeta(cam.beta),
//   so the player's OWN ship lights up with speed for free.
//
// Multiplayer note: a remote ship arrives as rest-frame
// (posAU, fwd, beta). Pass its own beta through pose.boost =
// boostFromBeta(remoteBeta); the observer's boost is applied on
// render. Never transmit aberration/Doppler.
// ============================================================

import { dot, len, sub, cross, norm } from '../lib/math3d';
import { aberrateLocal, dopplerLocal, type FlightState } from './flightRenderer';
import { MATERIAL_ORDER, MATERIALS, type ShipMesh } from '../lib/shipMesh';

const AU = 100; // identical to flightRenderer / solarRenderer

export interface ShipPose {
  posAU: number[];   // position in AU (same convention as planet.pos)
  fwd: number[];     // unit heading (rest frame)
  up?: number[];     // unit up; defaults to world up, re-orthonormalized
  scale?: number;    // world-unit size multiplier (default 1 -> ~4.6 wu long)
  accent?: [number, number, number]; // per-player color for the `accent` slot
  hull?: [number, number, number];   // per-player hull color (hullDark derived)
  boost?: number;    // 0..1 engine drive; default = boostFromBeta(cam.beta)
}

export interface ShipCamera {
  cam: number[];
  right: number[];
  up: number[];
  fwd: number[];
  beta: number;
  gamma: number;
  CX: number;
  CY: number;
  FOC: number;
}

// One-liner adapter from the live FlightState.
export function shipCameraFromFlight(s: FlightState): ShipCamera {
  const gamma = 1 / Math.sqrt(1 - s.beta * s.beta);
  return {
    cam: s.cam, right: s.right, up: s.up, fwd: s.fwd,
    beta: s.beta, gamma, CX: s.CX, CY: s.CY, FOC: s.FOC,
  };
}

/**
 * Engine drive (0..1) as a function of the ship's own speed beta.
 * Small idle floor so the nozzles always read as "live", then an
 * eased ramp so the afterburner visibly kicks in near light speed.
 */
export function boostFromBeta(beta: number): number {
  const b = beta < 0 ? 0 : beta > 1 ? 1 : beta;
  return Math.min(1, 0.08 + Math.pow(b, 0.8) * 0.95);
}

// Orthonormal ship basis from heading + desired up (handles the
// degenerate case where fwd is parallel to up).
function shipBasis(fwd: number[], up?: number[]) {
  const f = norm(fwd);
  let u = up ? norm(up) : [0, 1, 0];
  let r = cross(f, u);
  if (len(r) < 1e-6) { u = [0, 0, 1]; r = cross(f, u); }
  r = norm(r);
  u = cross(r, f);
  return { r, u, f };
}

const KEY_LIGHT = norm([0.5, 0.85, 0.35]); // default key (sun-ish), world space

// Doppler color-temperature shift. D>1 (approach) -> cooler+brighter,
// D<1 (recede) -> warmer+dimmer. Subtle so the ship stays recognizable.
function doppler(rgb: number[], Df: number): number[] {
  const k = Math.max(-1, Math.min(1, (Df - 1) * 1.3));
  const cool = [0.78, 0.96, 1.25];
  const warm = [1.18, 1.0, 0.78];
  const t = k >= 0 ? cool : warm;
  const a = k >= 0 ? k : -k;
  const bri = 1 + 0.35 * k;
  return [rgb[0] * (1 + (t[0] - 1) * a) * bri,
          rgb[1] * (1 + (t[1] - 1) * a) * bri,
          rgb[2] * (1 + (t[2] - 1) * a) * bri];
}

const clamp255 = (x: number) => (x < 0 ? 0 : x > 255 ? 255 : x) | 0;
const rgbStr = (c: number[]) => `rgb(${clamp255(c[0])},${clamp255(c[1])},${clamp255(c[2])})`;
// blend an rgb toward white by t in [0,1]
const whiten = (c: number[], t: number) =>
  [c[0] + (255 - c[0]) * t, c[1] + (255 - c[1]) * t, c[2] + (255 - c[2]) * t];

interface PV { x: number; y: number; z: number; ok: boolean }

/**
 * Render one ship. Call after the main flight scene each frame.
 * `edge`: thin dark facet stroke for the low-poly read (default true).
 * Returns the mean screen-depth (world units) so callers can z-sort
 * multiple ships against each other if desired.
 */
export function renderShip(
  ctx: CanvasRenderingContext2D,
  mesh: ShipMesh,
  pose: ShipPose,
  cam: ShipCamera,
  lightDir: number[] = KEY_LIGHT,
  edge = true
): number {
  const { r: br, u: bu, f: bf } = shipBasis(pose.fwd, pose.up);
  const scale = pose.scale ?? 1;
  const boost = pose.boost ?? boostFromBeta(cam.beta);
  const o = [pose.posAU[0] * AU, pose.posAU[1] * AU, pose.posAU[2] * AU];
  const { beta, gamma } = cam;

  // local -> world (world units)
  const world = mesh.verts.map((v) => [
    o[0] + scale * (v[0] * br[0] + v[1] * bu[0] + v[2] * bf[0]),
    o[1] + scale * (v[0] * br[1] + v[1] * bu[1] + v[2] * bf[1]),
    o[2] + scale * (v[0] * br[2] + v[1] * bu[2] + v[2] * bf[2]),
  ]);

  // project a world point with observer aberration (mirrors projectWorld)
  const project = (p: number[]): PV => {
    const rel = sub(p, cam.cam);
    const dist = len(rel) || 1e-6;
    const zTrue = dot(rel, cam.fwd);
    let dir = [rel[0] / dist, rel[1] / dist, rel[2] / dist];
    if (beta > 1e-4) dir = aberrateLocal(dir, cam.fwd, beta);
    const zc = dot(dir, cam.fwd);
    return {
      x: cam.CX + (cam.FOC * dot(dir, cam.right)) / zc,
      y: cam.CY - (cam.FOC * dot(dir, cam.up)) / zc,
      z: zTrue,
      ok: zTrue > 0.2 && zc > 0.001,
    };
  };
  const P: PV[] = world.map(project);

  // assemble shaded triangles (fan-triangulate -> per-tri normal faceting)
  interface Tri { z: number; a: PV; b: PV; c: PV; col: number[] }
  const tris: Tri[] = [];
  const nozzles: number[][] = []; // world centroids of exhaust faces
  let zsum = 0, zn = 0;
  for (const f of mesh.faces) {
    const name = MATERIAL_ORDER[f.m];
    const mat = MATERIALS[name];

    // ---- per-player base color ----
    let base = mat.rgb as number[];
    if (name === 'accent' && pose.accent) base = pose.accent;
    else if (name === 'hull' && pose.hull) base = pose.hull;
    else if (name === 'hullDark' && pose.hull)
      base = [pose.hull[0] * 0.55, pose.hull[1] * 0.55, pose.hull[2] * 0.62];

    // ---- collect exhaust nozzle anchors (once per face) ----
    if (name === 'exhaust') {
      let cx = 0, cy = 0, cz = 0;
      for (const vi of f.v) { cx += world[vi][0]; cy += world[vi][1]; cz += world[vi][2]; }
      const n = f.v.length;
      nozzles.push([cx / n, cy / n, cz / n]);
    }

    for (let k = 1; k < f.v.length - 1; k++) {
      const ia = f.v[0], ib = f.v[k], ic = f.v[k + 1];
      const pa = P[ia], pb = P[ib], pc = P[ic];
      if (!pa.ok || !pb.ok || !pc.ok) continue;
      const area = (pb.x - pa.x) * (pc.y - pa.y) - (pc.x - pa.x) * (pb.y - pa.y);
      if (!f.two && area <= 0) continue; // back-face cull (2D winding)
      const A = world[ia], B = world[ib], C = world[ic];
      let n = cross(sub(B, A), sub(C, A));
      const nl = len(n);
      if (nl < 1e-9) continue;
      n = [n[0] / nl, n[1] / nl, n[2] / nl];

      let shade: number;
      if (mat.emissive) {
        // exhaust brightness rides the engine drive; canopy stays steady
        shade = name === 'exhaust' ? 0.4 + 1.25 * boost : 1;
      } else {
        let dl = dot(n, lightDir);
        if (f.two) dl = Math.abs(dl);
        shade = 0.3 + 0.7 * Math.max(0, dl);
      }
      let col = [base[0] * shade, base[1] * shade, base[2] * shade];
      // white-hot core as the exhaust spools up
      if (name === 'exhaust') col = whiten(col, 0.5 * boost);

      if (beta > 1e-4) {
        const cen = norm(sub(
          [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3, (A[2] + B[2] + C[2]) / 3],
          cam.cam
        ));
        col = doppler(col, dopplerLocal(cen, cam.fwd, beta, gamma));
      }
      const zmean = (pa.z + pb.z + pc.z) / 3;
      zsum += zmean; zn++;
      tris.push({ z: zmean, a: pa, b: pb, c: pc, col });
    }
  }

  // painter's algorithm: far -> near
  tris.sort((x, y) => y.z - x.z);
  for (const t of tris) {
    ctx.beginPath();
    ctx.moveTo(t.a.x, t.a.y);
    ctx.lineTo(t.b.x, t.b.y);
    ctx.lineTo(t.c.x, t.c.y);
    ctx.closePath();
    ctx.fillStyle = rgbStr(t.col);
    ctx.fill();
    if (edge) {
      ctx.strokeStyle = 'rgba(0,0,0,0.30)';
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }
  }

  // ---- thruster plumes (additive bloom behind each nozzle) ----
  if (boost > 0.02 && nozzles.length) {
    const core = whiten([255, 150, 70], 0.45 * boost); // hot orange -> white
    const plumeWorld = scale * (0.6 + 4.0 * boost);     // length grows with drive
    const prev = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = 'lighter';
    for (const c of nozzles) {
      const s0 = project(c);
      if (!s0.ok) continue;
      const tail = [c[0] - bf[0] * plumeWorld, c[1] - bf[1] * plumeWorld, c[2] - bf[2] * plumeWorld];
      const s1 = project(tail);
      const dx = s1.x - s0.x, dy = s1.y - s0.y;
      const plen = Math.hypot(dx, dy) || 1;
      // core sized to the nozzle's projected scale (not the streak length),
      // so the twin flames stay distinct and only grow with engine drive
      const r = Math.min(46, Math.max(2.5, (cam.FOC * 0.17 * scale) / Math.max(s0.z, 0.5) * (1.0 + 1.7 * boost)));

      // core glow
      const g = ctx.createRadialGradient(s0.x, s0.y, 0, s0.x, s0.y, r);
      g.addColorStop(0, `rgba(${clamp255(core[0])},${clamp255(core[1])},${clamp255(core[2])},${0.35 + 0.5 * boost})`);
      g.addColorStop(0.5, `rgba(255,140,60,${0.18 + 0.3 * boost})`);
      g.addColorStop(1, 'rgba(255,120,40,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(s0.x, s0.y, r, 0, Math.PI * 2);
      ctx.fill();

      // tapered streak from nozzle to tail (perpendicular gives width)
      if (s1.ok || plen > 4) {
        const px = -dy / plen, py = dx / plen; // unit perpendicular (screen)
        const w0 = r * 0.62, w1 = r * 0.14;
        const lg = ctx.createLinearGradient(s0.x, s0.y, s1.x, s1.y);
        lg.addColorStop(0, `rgba(${clamp255(core[0])},${clamp255(core[1])},${clamp255(core[2])},${0.5 + 0.4 * boost})`);
        lg.addColorStop(0.4, `rgba(255,150,70,${0.22 + 0.25 * boost})`);
        lg.addColorStop(1, 'rgba(255,110,40,0)');
        ctx.fillStyle = lg;
        ctx.beginPath();
        ctx.moveTo(s0.x + px * w0, s0.y + py * w0);
        ctx.lineTo(s0.x - px * w0, s0.y - py * w0);
        ctx.lineTo(s1.x - px * w1, s1.y - py * w1);
        ctx.lineTo(s1.x + px * w1, s1.y + py * w1);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.globalCompositeOperation = prev;
  }

  return zn ? zsum / zn : Infinity;
}
