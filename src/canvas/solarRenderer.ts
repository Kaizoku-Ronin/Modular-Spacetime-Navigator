// ============================================================
// Solar System Renderer — Sun + planets + orbits
// Replaces the black hole / accretion disk when in Sol system.
// Integrates into the flight renderer pipeline.
// ============================================================

import { dot, len, norm, cross } from '../lib/math3d';
import { tempToRGB } from '../data/solarSystem';
import type { FlightState } from './flightRenderer';
import { aberrateLocal } from './flightRenderer';
import type { Planet } from '../data/solarSystem';
import { traversalSpeed } from '../lib/physics';

const AU = 100; // world units per AU (matches flightRenderer)

// ---- solar system state ----
export interface SolarState {
  planets: Planet[];
  initialized: boolean;
  lastSunScreen: { x: number; y: number } | null;
  sway: number[];
  focusBody?: string | null; // last hypojumped body, for the compass
  epochJD?: number; // Julian Date captured on Sol entry; live positions advance from here
}

export function createSolarState(): SolarState {
  return {
    planets: [],
    initialized: false,
    lastSunScreen: null,
    sway: [0, 0, 0],
    focusBody: null,
    epochJD: undefined,
  };
}

// ---- position projection helpers ----
function worldToCam(p: number[], cam: number[]): number[] {
  return [p[0] * AU - cam[0], p[1] * AU - cam[1], p[2] * AU - cam[2]];
}

function projectWorld(
  p: number[],
  cam: number[],
  CX: number, CY: number, FOC: number,
  right: number[], up: number[], fwd: number[],
  beta: number
) {
  const rel = worldToCam(p, cam);
  const dist = len(rel);
  if (dist < 1e-6) return null;
  const zTrue = dot(rel, fwd);     // true depth, used for apparent size
  if (zTrue <= 0.5) return null;   // physically behind/at the camera
  let dir = [rel[0] / dist, rel[1] / dist, rel[2] / dist];
  if (beta > 1e-4) dir = aberrateLocal(dir, fwd, beta); // relativistic aberration
  const zc = dot(dir, fwd);
  if (zc <= 0.001) return null;
  const xc = dot(dir, right);
  const yc = dot(dir, up);
  return {
    x: CX + (FOC * xc) / zc,
    y: CY - (FOC * yc) / zc,
    z: zTrue, // depth for sorting + size
    dist,
  };
}

// ---- sun rendering ----
function drawSun(
  ctx: CanvasRenderingContext2D,
  s: FlightState,
  solar: SolarState,
  eye: number[]
) {
  const sunPos = [0, 0, 0];
  const pr = projectWorld(sunPos, eye, s.CX, s.CY, s.FOC, s.right, s.up, s.fwd, s.beta);
  if (!pr) { solar.lastSunScreen = null; return; }
  solar.lastSunScreen = { x: pr.x, y: pr.y };

  const [r, g, b] = tempToRGB(5778);
  const rad = Math.max(5, s.FOC * ((696000 / 149597870.7) * AU) / pr.z); // true-scale sun radius

  // Outer bloom
  const bloom = ctx.createRadialGradient(pr.x, pr.y, 0, pr.x, pr.y, rad * 14);
  bloom.addColorStop(0, `rgba(${r},${g},${b},0.55)`);
  bloom.addColorStop(0.12, `rgba(${r},${g},${b},0.28)`);
  bloom.addColorStop(0.4, `rgba(${r},${Math.max(0, g - 30)},${Math.max(0, b - 70)},0.07)`);
  bloom.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = bloom;
  ctx.beginPath();
  ctx.arc(pr.x, pr.y, rad * 14, 0, Math.PI * 2);
  ctx.fill();

  // Inner glow
  const glow = ctx.createRadialGradient(pr.x, pr.y, rad * 0.5, pr.x, pr.y, rad * 3.2);
  glow.addColorStop(0, `rgba(${r},${g},${b},0.95)`);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(pr.x, pr.y, rad * 3.2, 0, Math.PI * 2);
  ctx.fill();

  // Solar disc
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.beginPath();
  ctx.arc(pr.x, pr.y, rad, 0, Math.PI * 2);
  ctx.fill();

  // Bright core
  ctx.fillStyle = '#fffdf7';
  ctx.beginPath();
  ctx.arc(pr.x, pr.y, rad * 0.62, 0, Math.PI * 2);
  ctx.fill();
}

// ---- 3D planet sphere: software-rasterized, sun-lit, procedurally surfaced ----
// Rendered into a small offscreen buffer (cost bounded by SPHERE_CAP) then blitted
// scaled, so it keeps the chunky look and the same huge-up-close/small-far law as
// the old disc. Lighting uses the true Sun-at-origin direction, so the terminator
// and phases (e.g. crescent Venus) come out physically correct.
const SPHERE_CAP = 84;
let _sphCanvas: HTMLCanvasElement | null = null;
let _sphCtx: CanvasRenderingContext2D | null = null;

// sidereal rotation periods (hours); drives visible spin of surface features
const ROT_HRS: Record<string, number> = {
  Mercury: 1407.5, Venus: 5832.5, Earth: 23.93, Mars: 24.62,
  Jupiter: 9.93, Saturn: 10.66, Uranus: 17.24, Neptune: 16.11,
  Ceres: 9.07, Pluto: 153.3, Haumea: 3.92, Makemake: 22.5, Eris: 25.9, Sedna: 10.3,
};

function hexRGB(h: string): [number, number, number] {
  const n = h.replace('#', '');
  return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
}

// cheap layered-sine pseudo-noise in ~[-1,1]
function snoise(a: number, b: number): number {
  return Math.sin(a * 1.7 + b * 0.9) * 0.5
       + Math.sin(a * 3.3 - b * 2.1 + 1.7) * 0.3
       + Math.sin(a * 6.1 + b * 4.7 + 4.2) * 0.2;
}

// per-body surface albedo (0..1 rgb) at a latitude/longitude in radians
function surfaceAlbedo(
  name: string, kind: string, base: [number, number, number], lat: number, lon: number
): [number, number, number] {
  let r = base[0] / 255, g = base[1] / 255, b = base[2] / 255;
  const alat = Math.abs(lat);
  let f = 1;
  switch (name) {
    case 'Jupiter': {
      f = 0.82 + 0.30 * Math.sin(lat * 7.0) * Math.cos(lat * 2.0) + 0.05 * snoise(lat * 9, lon * 2);
      const dl = ((lon + 2.0) % (2 * Math.PI)) - Math.PI;
      const spot = Math.exp(-(((lat + 0.38) * 6) ** 2) - ((dl * 1.6) ** 2));
      r += spot * 0.35; g -= spot * 0.12; b -= spot * 0.18;
      break;
    }
    case 'Saturn': f = 0.86 + 0.20 * Math.sin(lat * 6.0) + 0.04 * snoise(lat * 7, lon); break;
    case 'Uranus': f = 0.94 + 0.06 * Math.sin(lat * 4.0); break;
    case 'Neptune': f = 0.90 + 0.10 * Math.sin(lat * 5.0) + 0.05 * snoise(lat * 5, lon * 1.5); break;
    case 'Mars':
      f = 0.9 + 0.18 * snoise(lat * 4 + 1, lon * 4);
      if (alat > 1.16) { r = 0.92; g = 0.92; b = 0.95; f = 1; }
      break;
    case 'Earth': {
      const land = snoise(lat * 3.1, lon * 3.3) + 0.35 * snoise(lat * 7, lon * 6);
      if (alat > 1.30) { r = 0.90; g = 0.93; b = 0.97; }
      else if (land > 0.18) { r = 0.20; g = 0.42; b = 0.18; }
      else { r = 0.12; g = 0.28; b = 0.55; }
      f = 1 + 0.08 * snoise(lat * 11, lon * 9);
      break;
    }
    case 'Venus': f = 0.95 + 0.07 * snoise(lat * 3, lon * 3); break;
    case 'Mercury': f = 0.85 + 0.22 * snoise(lat * 6, lon * 6); break;
    default: f = 0.9 + 0.16 * snoise(lat * 5, lon * 5 + (kind === 'dwarf' ? 2 : 0));
  }
  return [Math.max(0, r * f), Math.max(0, g * f), Math.max(0, b * f)];
}

function drawPlanetSphere(
  ctx: CanvasRenderingContext2D,
  s: FlightState,
  planet: Planet,
  sx: number, sy: number, rad: number
) {
  if (rad <= 2.4) {
    const [r, g, b] = hexRGB(planet.col);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.beginPath();
    ctx.arc(sx, sy, Math.max(1, rad), 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  const B = Math.max(10, Math.min(SPHERE_CAP, Math.round(rad * 2)));
  if (!_sphCanvas) {
    _sphCanvas = document.createElement('canvas');
    _sphCanvas.width = SPHERE_CAP; _sphCanvas.height = SPHERE_CAP;
    _sphCtx = _sphCanvas.getContext('2d');
  }
  if (!_sphCtx) return;
  const img = _sphCtx.createImageData(B, B);
  const data = img.data;
  const rB = B / 2;

  const rx = s.right, upv = s.up, fz = s.fwd;
  // light direction: from the planet toward the Sun at the origin (world frame)
  const P = [planet.pos[0] * AU, planet.pos[1] * AU, planet.pos[2] * AU];
  const Pl = Math.hypot(P[0], P[1], P[2]) || 1;
  const Lw = [-P[0] / Pl, -P[1] / Pl, -P[2] / Pl];

  // spin frame: pole + two equatorial axes; longitude advances with the clock
  const pole = planet.pole && planet.pole.length === 3 ? planet.pole : [0, 0, 1];
  let e1 = cross(pole, [0, 0, 1]);
  if (len(e1) < 1e-3) e1 = cross(pole, [0, 1, 0]);
  e1 = norm(e1);
  const e2 = norm(cross(pole, e1));
  const spinH = ROT_HRS[planet.name] ?? 24;
  const spin = (s.coordT / 3600 / spinH) * 2 * Math.PI;

  const base = hexRGB(planet.col);
  const ambient = 0.07;

  for (let j = 0; j < B; j++) {
    const vy = (j + 0.5 - rB) / rB;
    for (let i = 0; i < B; i++) {
      const vx = (i + 0.5 - rB) / rB;
      const d2 = vx * vx + vy * vy;
      const o = (j * B + i) * 4;
      if (d2 > 1) { data[o + 3] = 0; continue; }
      const vz = Math.sqrt(1 - d2); // toward camera
      // world-space surface normal (screen up = -vy, toward-camera = -fwd)
      const nwx = rx[0] * vx + upv[0] * (-vy) + (-fz[0]) * vz;
      const nwy = rx[1] * vx + upv[1] * (-vy) + (-fz[1]) * vz;
      const nwz = rx[2] * vx + upv[2] * (-vy) + (-fz[2]) * vz;
      const lam = Math.max(0, nwx * Lw[0] + nwy * Lw[1] + nwz * Lw[2]);
      const shade = ambient + (1 - ambient) * lam;
      const sinLat = Math.max(-1, Math.min(1, nwx * pole[0] + nwy * pole[1] + nwz * pole[2]));
      const lat = Math.asin(sinLat);
      const lon = Math.atan2(
        nwx * e2[0] + nwy * e2[1] + nwz * e2[2],
        nwx * e1[0] + nwy * e1[1] + nwz * e1[2],
      ) + spin;
      const alb = surfaceAlbedo(planet.name, planet.kind, base, lat, lon);
      const limb = 0.55 + 0.45 * vz; // gentle limb darkening
      data[o]     = Math.min(255, alb[0] * 255 * shade * limb);
      data[o + 1] = Math.min(255, alb[1] * 255 * shade * limb);
      data[o + 2] = Math.min(255, alb[2] * 255 * shade * limb);
      data[o + 3] = 255;
    }
  }

  _sphCtx.putImageData(img, 0, 0);
  const prevSmooth = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(_sphCanvas, 0, 0, B, B, sx - rad, sy - rad, rad * 2, rad * 2);
  ctx.imageSmoothingEnabled = prevSmooth;
}

// ---- orbit lines ----
function drawOrbit(
  ctx: CanvasRenderingContext2D,
  path: number[][],
  cam: number[],
  CX: number, CY: number, FOC: number,
  right: number[], up: number[], fwd: number[],
  isSelected: boolean,
  beta: number
) {
  const fade = Math.max(0, 1 - beta * 1.4); // orbits declutter as you approach light speed
  if (fade <= 0.02) return;
  ctx.strokeStyle = isSelected
    ? `rgba(70,224,210,${(0.45 * fade).toFixed(3)})`
    : `rgba(120,150,170,${(0.13 * fade).toFixed(3)})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  let started = false;
  for (const p of path) {
    const pr = projectWorld(p, cam, CX, CY, FOC, right, up, fwd, beta);
    if (!pr) { started = false; continue; }
    if (!started) {
      ctx.moveTo(pr.x, pr.y);
      started = true;
    } else {
      ctx.lineTo(pr.x, pr.y);
    }
  }
  ctx.stroke();
}

// ---- ring rendering (Saturn, Uranus) ----
function drawRings(
  ctx: CanvasRenderingContext2D,
  sx: number, sy: number, rad: number
) {
  if (rad <= 3) return;
  ctx.strokeStyle = 'rgba(220,200,150,0.5)';
  ctx.lineWidth = Math.max(1, rad * 0.1);
  ctx.beginPath();
  ctx.ellipse(sx, sy, rad * 2.0, rad * 0.65, 0.5, 0, Math.PI * 2);
  ctx.stroke();
}

// ---- label ----
function drawLabel(
  ctx: CanvasRenderingContext2D,
  text: string, x: number, y: number,
  col: string, strong: boolean
) {
  ctx.font = (strong ? '600 ' : '') + '11px ui-monospace,monospace';
  ctx.fillStyle = strong ? '#46e0d2' : col;
  ctx.textAlign = 'center';
  ctx.fillText(text, x, y);
  ctx.textAlign = 'left';
}

// ---- debris streaks (adapted from HTML demo) ----
const DEBRIS_L = 70 * 6371 / 149597870.7 * AU; // in world units
const DEBRIS_N = 44;

interface DebrisParticle {
  off: number[];
}

let debrisPool: DebrisParticle[] | null = null;

function getDebris(): DebrisParticle[] {
  if (!debrisPool) {
    debrisPool = [];
    for (let i = 0; i < DEBRIS_N; i++) {
      debrisPool.push({
        off: [
          (Math.random() - 0.5) * DEBRIS_L,
          (Math.random() - 0.5) * DEBRIS_L,
          (Math.random() - 0.5) * DEBRIS_L,
        ],
      });
    }
  }
  return debrisPool;
}

function drawDebrisStreaks(
  ctx: CanvasRenderingContext2D,
  s: FlightState,
  dt: number
) {
  const speed = traversalSpeed(s.beta, s.timeScale); // world units/sec (= beta*c*compression)
  const streakT = 0.05;
  const streak = Math.min(DEBRIS_L * 0.5, Math.abs(speed) * streakT);
  const sgn = Math.sign(speed) || 1;
  const debris = getDebris();

  ctx.lineWidth = 1;
  for (const dp of debris) {
    // Move debris opposite to flight direction
    dp.off[0] -= s.fwd[0] * speed * dt;
    dp.off[1] -= s.fwd[1] * speed * dt;
    dp.off[2] -= s.fwd[2] * speed * dt;

    // Respawn if too far
    if (
      Math.abs(dp.off[0]) > DEBRIS_L ||
      Math.abs(dp.off[1]) > DEBRIS_L ||
      Math.abs(dp.off[2]) > DEBRIS_L ||
      dot(dp.off, s.fwd) < -DEBRIS_L * 0.5
    ) {
      dp.off = [
        (Math.random() - 0.5) * DEBRIS_L,
        (Math.random() - 0.5) * DEBRIS_L,
        (Math.random() - 0.5) * DEBRIS_L,
      ];
      const a = DEBRIS_L * 0.5 * sgn;
      dp.off[0] += s.fwd[0] * a;
      dp.off[1] += s.fwd[1] * a;
      dp.off[2] += s.fwd[2] * a;
    }

    const w = [
      s.cam[0] + dp.off[0],
      s.cam[1] + dp.off[1],
      s.cam[2] + dp.off[2],
    ];

    // Project debris (already in world coords, need to convert to cam-relative)
    const rel = [w[0] - s.cam[0], w[1] - s.cam[1], w[2] - s.cam[2]];
    const z = dot(rel, s.fwd);
    if (z <= 0.001) continue;
    const xc = dot(rel, s.right);
    const yc = dot(rel, s.up);
    const p0x = s.CX + (s.FOC * xc) / z;
    const p0y = s.CY - (s.FOC * yc) / z;

    // Streak
    if (streak > 1e-9) {
      const w2 = [
        w[0] + s.fwd[0] * streak * sgn,
        w[1] + s.fwd[1] * streak * sgn,
        w[2] + s.fwd[2] * streak * sgn,
      ];
      const rel2 = [w2[0] - s.cam[0], w2[1] - s.cam[1], w2[2] - s.cam[2]];
      const z2 = dot(rel2, s.fwd);
      if (z2 > 0.001) {
        const xc2 = dot(rel2, s.right);
        const yc2 = dot(rel2, s.up);
        const p1x = s.CX + (s.FOC * xc2) / z2;
        const p1y = s.CY - (s.FOC * yc2) / z2;
        ctx.strokeStyle = 'rgba(185,205,220,0.55)';
        ctx.beginPath();
        ctx.moveTo(p0x, p0y);
        ctx.lineTo(p1x, p1y);
        ctx.stroke();
      }
    }

    ctx.fillStyle = 'rgba(205,218,228,0.7)';
    ctx.fillRect(p0x, p0y, 1.2, 1.2);
  }
}

// ---- gravity sway (bounded, from HTML demo) ----
export function applySolarGravity(s: FlightState, solar: SolarState, dt: number, planets: Planet[]) {
  const AU_M = 149597870.7 * 1000; // meters per AU
  const G = 6.674e-11;

  // camera position in AU (s.cam is world units; AU = 100 world units)
  const camAU = [s.cam[0] / AU, s.cam[1] / AU, s.cam[2] / AU];

  const g = [0, 0, 0];
  let dNear = 1e9;
  const bodies: Array<{ pos: number[]; mass: number }> = [
    { pos: [0, 0, 0], mass: 1.989e30 },
    ...planets.map((p) => ({ pos: p.pos, mass: p.mass })),
  ];
  for (const b of bodies) {
    const d = [b.pos[0] - camAU[0], b.pos[1] - camAU[1], b.pos[2] - camAU[2]];
    const r = Math.hypot(d[0], d[1], d[2]) + 1e-9;
    dNear = Math.min(dNear, r);
    const acc = (G * b.mass) / Math.pow(r * AU_M, 2);
    g[0] += (acc * d[0]) / r;
    g[1] += (acc * d[1]) / r;
    g[2] += (acc * d[2]) / r;
  }

  // Bounded positional sway: a gentle settling lean toward the dominant mass.
  // It is an offset, never a velocity, so it can't accumulate into a crash;
  // capped at 3% of the distance to the nearest body (AU -> world units).
  const gmag = Math.hypot(g[0], g[1], g[2]);
  const offAU = gmag > 1e-12 ? Math.min(dNear * 0.03, gmag * 0.5) : 0;
  const target = gmag > 1e-12
    ? [(g[0] / gmag) * offAU * AU, (g[1] / gmag) * offAU * AU, (g[2] / gmag) * offAU * AU]
    : [0, 0, 0];
  const k = Math.min(1, dt * 2.5);
  for (let i = 0; i < 3; i++) solar.sway[i] += (target[i] - solar.sway[i]) * k;
}

// ---- MAIN RENDER ----
// ---- planet spin axis (pole line through the sphere) ----
function drawPlanetAxis(
  ctx: CanvasRenderingContext2D,
  s: FlightState,
  eye: number[],
  planet: Planet,
  planetScale: number
) {
  const n = planet.pole;
  if (!n) return;
  const worldR = (planet.R / 149597870.7) * AU * planetScale;
  const half = worldR * 2.4;
  const c = [planet.pos[0] * AU, planet.pos[1] * AU, planet.pos[2] * AU];
  const a = [c[0] + n[0] * half, c[1] + n[1] * half, c[2] + n[2] * half]; // north end
  const b = [c[0] - n[0] * half, c[1] - n[1] * half, c[2] - n[2] * half]; // south end
  const pa = projectWorld(a, eye, s.CX, s.CY, s.FOC, s.right, s.up, s.fwd, s.beta);
  const pb = projectWorld(b, eye, s.CX, s.CY, s.FOC, s.right, s.up, s.fwd, s.beta);
  if (!pa || !pb) return;
  ctx.strokeStyle = 'rgba(130,205,240,0.6)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(pa.x, pa.y);
  ctx.lineTo(pb.x, pb.y);
  ctx.stroke();
  // mark the north pole end
  ctx.fillStyle = 'rgba(165,225,255,0.95)';
  ctx.beginPath();
  ctx.arc(pa.x, pa.y, 2.2, 0, Math.PI * 2);
  ctx.fill();
}

// ---- navigation compass: ecliptic-axis gizmo + pointers to Sol / focus body ----
function drawCompass(
  ctx: CanvasRenderingContext2D,
  s: FlightState,
  eye: number[],
  solar: SolarState
) {
  ctx.save();
  ctx.font = '10px ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // (a) ecliptic-axis orientation gizmo (bottom-left)
  const gx = 84, gy = s.H - 84, gr = 26;
  const axes = [
    { v: [0, 0, 1], label: 'N', col: '#46e0d2' }, // ecliptic north
    { v: [1, 0, 0], label: 'X', col: '#7f93a6' }, // vernal equinox
    { v: [0, 1, 0], label: 'Y', col: '#7f93a6' },
  ];
  ctx.strokeStyle = 'rgba(120,150,170,0.18)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(gx, gy, gr + 7, 0, Math.PI * 2);
  ctx.stroke();
  for (const ax of axes) {
    const cx = dot(ax.v, s.right), cy = dot(ax.v, s.up), cz = dot(ax.v, s.fwd);
    ctx.globalAlpha = cz >= -0.05 ? 1 : 0.35;
    ctx.strokeStyle = ax.col;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx + cx * gr, gy - cy * gr);
    ctx.stroke();
    ctx.fillStyle = ax.col;
    ctx.fillText(ax.label, gx + cx * (gr + 9), gy - cy * (gr + 9));
  }
  ctx.globalAlpha = 1;

  // (b) pointers to Sol (origin) and the focus body
  const targets = [{ pos: [0, 0, 0], label: 'SOL', col: '#ffcf6e' }];
  if (solar.focusBody && solar.focusBody !== 'Sun' && solar.focusBody !== 'Sol') {
    const fb = solar.planets.find((p) => p.name === solar.focusBody);
    if (fb) targets.push({ pos: [fb.pos[0] * AU, fb.pos[1] * AU, fb.pos[2] * AU], label: fb.name.toUpperCase(), col: '#9fd0cb' });
  }
  for (const t of targets) {
    const rel = [t.pos[0] - eye[0], t.pos[1] - eye[1], t.pos[2] - eye[2]];
    const distAU = len(rel) / AU;
    let dir = norm(rel);
    if (s.beta > 1e-4) dir = aberrateLocal(dir, s.fwd, s.beta);
    const tx = dot(dir, s.right), ty = dot(dir, s.up), tz = dot(dir, s.fwd);
    const px = s.CX + (s.FOC * tx) / Math.max(tz, 1e-3);
    const py = s.CY - (s.FOC * ty) / Math.max(tz, 1e-3);
    const inFront = tz > 0.05;
    const inView = inFront && px > 30 && px < s.W - 30 && py > 30 && py < s.H - 30;
    const dl = `${t.label} ${distAU < 10 ? distAU.toFixed(2) : distAU.toFixed(0)} AU`;
    if (inView) {
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = t.col;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(px, py, 9, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = t.col;
      ctx.fillText(dl, px, py - 17);
    } else {
      const ang = inFront ? Math.atan2(py - s.CY, px - s.CX) : Math.atan2(-ty, tx);
      const R = Math.min(s.W, s.H) * 0.4;
      const ex = s.CX + Math.cos(ang) * R, ey = s.CY + Math.sin(ang) * R;
      ctx.save();
      ctx.translate(ex, ey);
      ctx.rotate(ang);
      ctx.globalAlpha = 0.92;
      ctx.fillStyle = t.col;
      ctx.beginPath();
      ctx.moveTo(11, 0);
      ctx.lineTo(-7, 6);
      ctx.lineTo(-7, -6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      ctx.globalAlpha = 1;
      ctx.fillStyle = t.col;
      ctx.fillText(dl, s.CX + Math.cos(ang) * (R - 20), s.CY + Math.sin(ang) * (R - 20));
    }
  }
  ctx.restore();
}

export function renderSolarSystem(
  ctx: CanvasRenderingContext2D,
  s: FlightState,
  solar: SolarState,
  planetScale: number,
  dt: number
) {
  const eye = [s.cam[0] + solar.sway[0], s.cam[1] + solar.sway[1], s.cam[2] + solar.sway[2]];

  // 1. Draw Sun
  drawSun(ctx, s, solar, eye);

  // 2. Draw orbit lines
  for (const p of solar.planets) {
    drawOrbit(ctx, p.path, eye, s.CX, s.CY, s.FOC, s.right, s.up, s.fwd, false, s.beta);
  }

  // 3. Collect visible planets, sort back-to-front
  const draws: Array<{
    planet: Planet;
    sx: number; sy: number; z: number; rad: number;
  }> = [];

  for (const p of solar.planets) {
    const pr = projectWorld(p.pos, eye, s.CX, s.CY, s.FOC, s.right, s.up, s.fwd, s.beta);
    if (!pr) {
      (p as any)._sx = null;
      continue;
    }
    // Visual radius: true scale * planetScale
    // True radius in AU = R_km / 149597870.7
    const trueRadAU = p.R / 149597870.7;
    const rad = Math.max(1.5, s.FOC * (trueRadAU * AU * planetScale) / pr.z);
    draws.push({ planet: p, sx: pr.x, sy: pr.y, z: pr.z, rad });
    (p as any)._sx = pr.x;
    (p as any)._sy = pr.y;
  }

  // Sort back to front (farther z first = drawn first)
  draws.sort((a, b) => b.z - a.z);

  // 4. Draw planets as sun-lit 3D spheres
  for (const d of draws) {
    drawPlanetSphere(ctx, s, d.planet, d.sx, d.sy, d.rad);

    // Rings
    if (d.planet.ring && d.rad > 3) {
      drawRings(ctx, d.sx, d.sy, d.rad);
    }

    // Label
    if (d.rad > 1.6) {
      drawLabel(ctx, d.planet.name, d.sx, d.sy - d.rad - 7, '#bcd3d2', false);
    }

    // Spin axis (pole line) once the planet reads as a disc
    if (d.rad > 4 && d.planet.pole) {
      drawPlanetAxis(ctx, s, eye, d.planet, planetScale);
    }
  }

  // 5. Debris streaks (for speed sense, adapted from HTML demo)
  if (s.beta > 0.001) {
    drawDebrisStreaks(ctx, s, dt);
  }

  // 6. Navigation compass: ecliptic-axis gizmo + pointers to Sol / focus body
  drawCompass(ctx, s, eye, solar);
}

// ---- HUD data for solar system ----
export function getSolarHUD(s: FlightState, _solar: SolarState): {
  distance: string;
  velocity: string;
  gamma: string;
  properTime: string;
  coordTime: string;
  compression: string;
  status: 'near-horizon' | 'paused' | 'cruising';
} {
  const R = len(s.cam);
  const au = R / AU;
  const gamma = 1 / Math.sqrt(1 - s.beta * s.beta);

  let status: 'near-horizon' | 'paused' | 'cruising' = 'cruising';
  if (au < 0.02) status = 'near-horizon'; // near Sun
  else if (s.paused) status = 'paused';

  return {
    distance: au.toFixed(3) + ' AU',
    velocity: s.beta.toFixed(3) + ' c',
    compression: '\u00d7' + Math.round(s.timeScale),
    gamma: gamma.toFixed(3),
    properTime: s.properT.toFixed(1) + ' s',
    coordTime: s.coordT.toFixed(1) + ' s',
    status,
  };
}
