// ============================================================
// Flight Mode Canvas Renderer
// Exact port from X0_143_BlackHole_Flight.html
// Imperative canvas — called from React useEffect + rAF loop
// ============================================================

import {
  dot,
  len,
  sub,
  cross,
  norm,
  clamp,
  rot,
  randDir,
  sph,
} from '../lib/math3d';
import { dColor, CUSP_COLORS, cuspNameForWidth } from '../lib/colors';
import type { Star } from '../data/starData';

// ---- constants (EXACT from original) ----
const AU = 100;
const FIELD = AU;
const BASE_RVIS = 1.6;
const SPEED_SCALE = 42;
const BASE_GM = 1400;
const MAXTURN = 2.0;
const LENSK = 2.6;
const RS = 0.58; // render scale

// ---- state ----
export interface FlightState {
  beta: number;
  paused: boolean;
  coordT: number;
  properT: number;
  diskPhase: number;
  cam: number[];
  fwd: number[];
  right: number[];
  up: number[];
  stars: Array<{ d: number[]; b: number }>;
  debris: Array<{ p: number[]; b: number }>;
  gridLines: number[][][];
  disk: Array<{
    phi: number;
    r: number;
    h: number;
    b: number;
    w: number;
  }>;
  dn: number[];
  da: number[];
  db: number[];
  cusps: Array<{ w: number; lab: string }>;
  opt: { grid: boolean; debris: boolean; disk: boolean; cusps: boolean; safety: boolean };
  // per-star params
  GM_scale: number;
  RVIS: number;
  debrisCount: number;
  diskTint: [number, number, number];
  // canvas size
  W: number;
  H: number;
  CX: number;
  CY: number;
  FOC: number;
  // BH geometry cache
  bx: number;
  by: number;
  shadowR: number;
  bhOn: boolean;
  // solar system mode
  isSolar: boolean;
}

export function createFlightState(): FlightState {
  return {
    beta: 0.2,
    paused: true,
    coordT: 0,
    properT: 0,
    diskPhase: 0,
    cam: [0, 8, 60],
    fwd: norm([0, -0.12, -1]),
    right: [1, 0, 0],
    up: [0, 1, 0],
    stars: [],
    debris: [],
    gridLines: [],
    disk: [],
    dn: [0, 0, 0],
    da: [0, 0, 0],
    db: [0, 0, 0],
    cusps: [
      { w: 143, lab: '\u221E cosmological  w143' },
      { w: 13, lab: 'galactic  w13' },
      { w: 11, lab: 'stellar  w11' },
      { w: 1, lab: 'Planck  w1' },
    ],
    opt: { grid: true, debris: true, disk: true, cusps: true, safety: true },
    GM_scale: BASE_GM,
    RVIS: BASE_RVIS,
    debrisCount: 540,
    diskTint: [255, 220, 180],
    W: 0,
    H: 0,
    CX: 0,
    CY: 0,
    FOC: 0,
    bx: 0,
    by: 0,
    shadowR: 0,
    bhOn: false,
    isSolar: false,
  };
}

export function initFlightState(s: FlightState, star?: Star | null) {
  rebuild(s);
  // Generate background stars
  s.stars = [];
  for (let i = 0; i < 440; i++) s.stars.push({ d: randDir(), b: 0.25 + Math.random() * 0.75 });

  // Generate grid lines
  s.gridLines = [];
  const DEG = Math.PI / 180;
  for (const latd of [-60, -40, -20, 0, 20, 40, 60]) {
    const lat = latd * DEG,
      line: number[][] = [];
    for (let lon = 0; lon <= 360; lon += 6) line.push(sph(lat, lon * DEG));
    s.gridLines.push(line);
  }
  for (let lond = 0; lond < 360; lond += 30) {
    const lon = lond * DEG,
      line: number[][] = [];
    for (let lat = -80; lat <= 80; lat += 5) line.push(sph(lat * DEG, lon));
    s.gridLines.push(line);
  }

  // Disk basis vectors
  s.dn = norm([0.26, 1, 0.16]);
  s.da = norm(cross(s.dn, [0, 0, 1]));
  s.db = cross(s.da, s.dn);

  // Generate accretion disk particles
  s.disk = [];
  for (let i = 0; i < 240; i++) {
    const rr = (BASE_RVIS * 2.4) + Math.random() * (BASE_RVIS * 6.0 - BASE_RVIS * 2.4);
    s.disk.push({
      phi: Math.random() * Math.PI * 2,
      r: rr,
      h: (Math.random() - 0.5) * 0.7 * BASE_RVIS,
      b: 0.5 + Math.random() * 0.5,
      w: 0.9 / Math.pow(rr, 1.5),
    });
  }

  // Apply star-specific parameters
  if (star) {
    s.GM_scale = BASE_GM * star.mass;
    // NOTE: deliberate playability scaling, NOT physical. A real Schwarzschild
    // radius is r_s = 2GM/c^2, i.e. r_s ∝ mass (linear). Across this catalog
    // (~0.04–2 M_sun) linear scaling spans ~50x and is visually unusable, so we
    // use cbrt(mass) (~3.7x range) to keep every system flyable. GM_scale IS
    // linear in mass (physically correct); only the *visual* horizon is compressed.
    s.RVIS = BASE_RVIS * Math.cbrt(Math.max(star.mass, 0.01));
    s.debrisCount = Math.round(540 * Math.sqrt(star.luminosity));
    // disk tint from spectral color
    const sp = star.spectralType.charAt(0).toUpperCase();
    const tint: Record<string, [number, number, number]> = {
      O: [90, 120, 255], B: [90, 120, 255], A: [138, 164, 255],
      F: [255, 245, 224], G: [255, 232, 138], K: [255, 170, 68],
      M: [255, 102, 34], L: [120, 30, 0], T: [80, 20, 0], Y: [60, 15, 0],
      D: [192, 216, 255],
    };
    s.diskTint = tint[sp] || [255, 220, 180];
  } else {
    s.GM_scale = BASE_GM;
    s.RVIS = BASE_RVIS;
    s.debrisCount = 540;
    s.diskTint = [255, 220, 180];
  }

  // Generate debris (after star params are set)
  s.debris = [];
  const count = s.debrisCount;
  for (let i = 0; i < count; i++) {
    const r = s.RVIS * 4 + Math.cbrt(Math.random()) * (FIELD - s.RVIS * 4);
    const d = randDir();
    s.debris.push({ p: [d[0] * r, d[1] * r, d[2] * r], b: 0.3 + Math.random() * 0.7 });
  }
}

export function resize(s: FlightState, width: number, height: number) {
  s.W = Math.floor(width * RS);
  s.H = Math.floor(height * RS);
  s.CX = s.W / 2;
  s.CY = s.H / 2;
  s.FOC = s.W * 0.82;
}

export function resetFlight(s: FlightState) {
  s.cam = [0, 8, 60];
  s.fwd = norm([0, -0.12, -1]);
  s.beta = 0.2;
  s.coordT = 0;
  s.properT = 0;
  s.diskPhase = 0;
  rebuild(s);
}

function rebuild(s: FlightState) {
  let ref = Math.abs(s.fwd[1]) > 0.95 ? [0, 0, 1] : [0, 1, 0];
  s.right = norm(cross(s.fwd, ref));
  s.up = cross(s.right, s.fwd);
}

// Re-orthonormalize the basis from the current fwd + up (no world-up reference,
// so it never snaps at the poles). Used by the free-look camera.
function reortho(s: FlightState) {
  s.fwd = norm(s.fwd);
  s.right = norm(cross(s.fwd, s.up));
  s.up = norm(cross(s.right, s.fwd));
}

// ---- relativistic optics (EXACT) ----
export function aberrateLocal(d: number[], fwd: number[], beta: number) {
  if (beta < 1e-4) return d;
  const cT = clamp(dot(d, fwd), -1, 1);
  const cT2 = (cT + beta) / (1 + beta * cT);
  const sT2 = Math.sqrt(Math.max(0, 1 - cT2 * cT2));
  let px = d[0] - cT * fwd[0],
    py = d[1] - cT * fwd[1],
    pz = d[2] - cT * fwd[2];
  const pl = Math.hypot(px, py, pz);
  if (pl < 1e-7) return fwd.slice();
  px /= pl;
  py /= pl;
  pz /= pl;
  return [
    fwd[0] * cT2 + px * sT2,
    fwd[1] * cT2 + py * sT2,
    fwd[2] * cT2 + pz * sT2,
  ];
}

export function dopplerLocal(da: number[], fwd: number[], beta: number, gamma: number) {
  const cT = clamp(dot(da, fwd), -1, 1);
  return 1 / (gamma * (1 - beta * cT));
}

// ---- projection (EXACT) ----
function projectLocal(
  d: number[],
  CX: number,
  CY: number,
  FOC: number,
  right: number[],
  up: number[],
  fwd: number[]
) {
  const xc = dot(d, right),
    yc = dot(d, up),
    zc = dot(d, fwd);
  if (zc <= 0.001) return null;
  return [CX + (FOC * xc) / zc, CY - (FOC * yc) / zc, zc];
}

// ---- physics step (EXACT) ----
export function stepFlight(s: FlightState, dt: number) {
  const R = len(s.cam);
  const gmag = s.GM_scale / Math.max(R * R, 1e-3);
  const g = [(-s.cam[0] / R) * gmag, (-s.cam[1] / R) * gmag, (-s.cam[2] / R) * gmag];
  const sp = s.beta * SPEED_SCALE;
  let V = [
    s.fwd[0] * sp + g[0] * dt,
    s.fwd[1] * sp + g[1] * dt,
    s.fwd[2] * sp + g[2] * dt,
  ];
  const nh = norm(V);
  const ang = Math.acos(clamp(dot(nh, s.fwd), -1, 1));
  const mx = MAXTURN * dt;
  const oldFwd = [s.fwd[0], s.fwd[1], s.fwd[2]];
  if (ang > mx && ang > 1e-6) {
    s.fwd = norm(rot(s.fwd, norm(cross(s.fwd, nh)), mx));
  } else {
    s.fwd = nh;
  }
  // follow the heading change while preserving roll (pole-free)
  const fax = cross(oldFwd, s.fwd);
  const fsin = len(fax);
  if (fsin > 1e-7) {
    const fa = Math.atan2(fsin, dot(oldFwd, s.fwd));
    const fn = [fax[0] / fsin, fax[1] / fsin, fax[2] / fsin];
    s.right = rot(s.right, fn, fa);
    s.up = rot(s.up, fn, fa);
  }
  reortho(s);
  s.cam = [
    s.cam[0] + s.fwd[0] * sp * dt,
    s.cam[1] + s.fwd[1] * sp * dt,
    s.cam[2] + s.fwd[2] * sp * dt,
  ];
  s.coordT += dt;
  const gamma = 1 / Math.sqrt(1 - s.beta * s.beta);
  s.properT += dt / gamma;

  // horizon shield
  const R2 = len(s.cam);
  if (R2 < s.RVIS * 1.45) {
    const k = (s.RVIS * 1.45) / R2;
    s.cam = [s.cam[0] * k, s.cam[1] * k, s.cam[2] * k];
  }
}

// ---- black hole geometry ----
function bhGeom(s: FlightState) {
  const R = len(s.cam);
  const d = aberrateLocal(norm([-s.cam[0], -s.cam[1], -s.cam[2]]), s.fwd, s.beta);
  const p = projectLocal(d, s.CX, s.CY, s.FOC, s.right, s.up, s.fwd);
  s.bhOn = !!p;
  if (p) {
    s.bx = p[0];
    s.by = p[1];
  }
  s.shadowR = s.FOC * (s.RVIS / Math.max(R, s.RVIS * 1.1));
}

function lens(s: FlightState, sx: number, sy: number): [number, number] {
  if (!s.bhOn) return [sx, sy];
  let dx = sx - s.bx,
    dy = sy - s.by,
    r = Math.hypot(dx, dy);
  if (r < 1e-3) r = 1e-3;
  const r2 = r + (s.shadowR * s.shadowR * LENSK) / r;
  return [s.bx + (dx / r) * r2, s.by + (dy / r) * r2];
}

// ---- drawing helpers ----
function dot2(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  sx: number,
  sy: number,
  col: number[],
  alpha: number,
  size: number
) {
  if (sx < -8 || sy < -8 || sx > W + 8 || sy > H + 8) return;
  ctx.globalAlpha = clamp(alpha, 0, 1);
  ctx.fillStyle = 'rgb(' + (col[0] | 0) + ',' + (col[1] | 0) + ',' + (col[2] | 0) + ')';
  const sz = Math.max(1, size);
  ctx.fillRect(sx - sz / 2, sy - sz / 2, sz, sz);
}

// ---- render functions ----
function drawStars(ctx: CanvasRenderingContext2D, s: FlightState) {
  const gamma = 1 / Math.sqrt(1 - s.beta * s.beta);
  for (const st of s.stars) {
    const da = aberrateLocal(st.d, s.fwd, s.beta);
    const p = projectLocal(da, s.CX, s.CY, s.FOC, s.right, s.up, s.fwd);
    if (!p) continue;
    let lsx = p[0], lsy = p[1];
    if (!s.isSolar) {
      [lsx, lsy] = lens(s, lsx, lsy);
      if (s.bhOn && Math.hypot(lsx - s.bx, lsy - s.by) < s.shadowR) continue;
    }
    const D = dopplerLocal(da, s.fwd, s.beta, gamma);
    dot2(ctx, s.W, s.H, lsx, lsy, dColor(D), clamp(Math.pow(D, 2.3), 0.08, 5) * st.b * 0.9, 1.3);
  }
}

function drawGrid(ctx: CanvasRenderingContext2D, s: FlightState) {
  const gamma = 1 / Math.sqrt(1 - s.beta * s.beta);
  ctx.lineWidth = 1;
  for (const line of s.gridLines) {
    let prev: [number, number, number[]] | null = null;
    for (const v of line) {
      const da = aberrateLocal(v, s.fwd, s.beta);
      const p = projectLocal(da, s.CX, s.CY, s.FOC, s.right, s.up, s.fwd);
      let cur: [number, number, number[]] | null = null;
      if (p) {
        const [lsx, lsy] = lens(s, p[0], p[1]);
        cur = [lsx, lsy, da];
      }
      if (prev && cur) {
        const jump = Math.hypot(cur[0] - prev[0], cur[1] - prev[1]);
        if (jump < s.W * 0.4) {
          const D = dopplerLocal(cur[2], s.fwd, s.beta, gamma);
          const c = dColor(D);
          ctx.globalAlpha = clamp(0.1 * Math.pow(D, 1.0), 0.02, 0.35);
          ctx.strokeStyle = 'rgb(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ')';
          ctx.beginPath();
          ctx.moveTo(prev[0], prev[1]);
          ctx.lineTo(cur[0], cur[1]);
          ctx.stroke();
        }
      }
      prev = cur;
    }
  }
}

function drawDebris(ctx: CanvasRenderingContext2D, s: FlightState, front: boolean) {
  const R = len(s.cam);
  const gamma = 1 / Math.sqrt(1 - s.beta * s.beta);
  for (const db of s.debris) {
    const rel = sub(db.p, s.cam),
      dist = len(rel);
    const behind = dist > R;
    if (behind === front) continue;
    const dir = [rel[0] / dist, rel[1] / dist, rel[2] / dist];
    const da = aberrateLocal(dir, s.fwd, s.beta);
    const p = projectLocal(da, s.CX, s.CY, s.FOC, s.right, s.up, s.fwd);
    if (!p) continue;
    let sx = p[0],
      sy = p[1];
    if (behind) {
      [sx, sy] = lens(s, sx, sy);
      if (s.bhOn && Math.hypot(sx - s.bx, sy - s.by) < s.shadowR) continue;
    }
    const D = dopplerLocal(da, s.fwd, s.beta, gamma);
    const fall = clamp((FIELD * 0.5) / dist, 0.18, 1.5);
    dot2(
      ctx,
      s.W,
      s.H,
      sx,
      sy,
      dColor(D),
      clamp(Math.pow(D, 2), 0.1, 5) * fall * db.b,
      clamp(1.5 * fall, 0.8, 3)
    );
  }
}

function drawDisk(ctx: CanvasRenderingContext2D, s: FlightState) {
  const R = len(s.cam);
  const gamma = 1 / Math.sqrt(1 - s.beta * s.beta);
  const { da, db: dbv, dn } = s;
  for (const pt of s.disk) {
    const ph = pt.phi + s.diskPhase * pt.w * 60;
    const c = Math.cos(ph),
      sn = Math.sin(ph);
    const wp = [
      da[0] * pt.r * c + dbv[0] * pt.r * sn + dn[0] * pt.h,
      da[1] * pt.r * c + dbv[1] * pt.r * sn + dn[1] * pt.h,
      da[2] * pt.r * c + dbv[2] * pt.r * sn + dn[2] * pt.h,
    ];
    const rel = sub(wp, s.cam),
      dist = len(rel);
    const los = [rel[0] / dist, rel[1] / dist, rel[2] / dist];
    const dir = aberrateLocal(los, s.fwd, s.beta);
    const p = projectLocal(dir, s.CX, s.CY, s.FOC, s.right, s.up, s.fwd);
    if (!p) continue;
    const sx = p[0],
      sy = p[1];
    const behind = dist > R;
    if (behind && s.bhOn && Math.hypot(sx - s.bx, sy - s.by) < s.shadowR) continue;
    // orbital velocity Doppler
    const vdir = norm([-da[0] * sn + dbv[0] * c, -da[1] * sn + dbv[1] * c, -da[2] * sn + dbv[2] * c]);
    const bo = clamp(2.6 / Math.sqrt(pt.r), 0.05, 0.45);
    const cp = clamp(dot(los, vdir), -1, 1);
    const Do = 1 / ((1 / Math.sqrt(1 - bo * bo)) * (1 - bo * cp));
    const D = dopplerLocal(dir, s.fwd, s.beta, gamma) * Do;
    // warm base disk colour + Doppler tint + star spectral tint
    const c2 = dColor(D);
    const [tR, tG, tB] = s.diskTint;
    const col = [
      clamp((tR * 0.62) + c2[0] * 0.38, 0, 255),
      clamp((tG * 0.55) + c2[1] * 0.45, 0, 255),
      clamp((tB * 0.4) + c2[2] * 0.6, 0, 255),
    ];
    dot2(ctx, s.W, s.H, sx, sy, col, clamp(Math.pow(D, 2), 0.12, 5) * pt.b * 0.85, 1.6);
  }
}

function drawBH(ctx: CanvasRenderingContext2D, s: FlightState) {
  if (!s.bhOn) return;
  const { bx, by, shadowR } = s;
  // soft glow
  const g = ctx.createRadialGradient(bx, by, shadowR * 0.9, bx, by, shadowR * 2.4);
  g.addColorStop(0, 'rgba(120,180,255,.16)');
  g.addColorStop(1, 'rgba(120,180,255,0)');
  ctx.globalAlpha = 1;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(bx, by, shadowR * 2.4, 0, Math.PI * 2);
  ctx.fill();
  // event-horizon shadow
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(bx, by, shadowR, 0, Math.PI * 2);
  ctx.fill();
  // photon ring
  ctx.globalAlpha = 0.95;
  ctx.lineWidth = Math.max(1, shadowR * 0.07);
  ctx.strokeStyle = 'rgba(180,210,255,.9)';
  ctx.beginPath();
  ctx.arc(bx, by, shadowR * 1.06, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = Math.max(1, shadowR * 0.16);
  ctx.strokeStyle = 'rgba(120,170,255,.4)';
  ctx.beginPath();
  ctx.arc(bx, by, shadowR * 1.12, 0, Math.PI * 2);
  ctx.stroke();
}

function drawCusps(ctx: CanvasRenderingContext2D, s: FlightState) {
  if (!s.bhOn) return;
  ctx.setLineDash([4, 5]);
  ctx.lineWidth = 1;
  for (const cu of s.cusps) {
    const r = s.shadowR * 1.6 * Math.cbrt(cu.w);
    if (r > Math.max(s.W, s.H) * 1.3) continue;
    const hex = CUSP_COLORS[cuspNameForWidth(cu.w)];
    const cr = parseInt(hex.slice(1, 3), 16);
    const cg = parseInt(hex.slice(3, 5), 16);
    const cb = parseInt(hex.slice(5, 7), 16);
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = `rgba(${cr},${cg},${cb},.6)`;
    ctx.beginPath();
    ctx.arc(s.bx, s.by, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = `rgba(${cr},${cg},${cb},.85)`;
    ctx.font = '9px ui-monospace,monospace';
    ctx.fillText(cu.lab, s.bx + r * 0.71 + 4, s.by - r * 0.71);
  }
  ctx.setLineDash([]);
}

function drawReticle(ctx: CanvasRenderingContext2D, s: FlightState) {
  const { CX, CY } = s;
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = 'rgba(70,224,210,.6)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(CX - 8, CY);
  ctx.lineTo(CX - 3, CY);
  ctx.moveTo(CX + 3, CY);
  ctx.lineTo(CX + 8, CY);
  ctx.moveTo(CX, CY - 8);
  ctx.lineTo(CX, CY - 3);
  ctx.moveTo(CX, CY + 3);
  ctx.lineTo(CX, CY + 8);
  ctx.stroke();
}

function drawVignette(ctx: CanvasRenderingContext2D, s: FlightState) {
  const v = ctx.createRadialGradient(
    s.CX,
    s.CY,
    Math.min(s.W, s.H) * 0.35,
    s.CX,
    s.CY,
    Math.max(s.W, s.H) * 0.72
  );
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,.55)');
  ctx.globalAlpha = 1;
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, s.W, s.H);
}

// ---- main render entry ----
export function renderFlight(ctx: CanvasRenderingContext2D, s: FlightState, postRender?: (ctx: CanvasRenderingContext2D, s: FlightState) => void) {
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#03050a';
  ctx.fillRect(-2, -2, s.W + 4, s.H + 4);

  if (!s.isSolar) {
    bhGeom(s);
  }

  drawStars(ctx, s);
  if (s.opt.grid && !s.isSolar) drawGrid(ctx, s);
  if (s.opt.debris && !s.isSolar) drawDebris(ctx, s, false);

  if (s.isSolar) {
    // Solar system: postRender callback draws Sun + planets + orbits
    if (postRender) postRender(ctx, s);
  } else {
    // Black hole system
    drawBH(ctx, s);
    if (s.opt.disk) drawDisk(ctx, s);
    if (s.opt.cusps) drawCusps(ctx, s);
  }

  if (s.opt.debris && !s.isSolar) drawDebris(ctx, s, true);
  drawReticle(ctx, s);
  drawVignette(ctx, s);
}

// ---- HUD data ----
export function getFlightHUD(s: FlightState) {
  const R = len(s.cam),
    au = R / AU;
  const gamma = 1 / Math.sqrt(1 - s.beta * s.beta);
  let status: 'near-horizon' | 'paused' | 'cruising' = 'cruising';
  if (au < 0.05) status = 'near-horizon';
  else if (s.paused) status = 'paused';
  return {
    distance: au.toFixed(2) + ' AU',
    velocity: s.beta.toFixed(2) + ' c',
    gamma: gamma.toFixed(2),
    properTime: s.properT.toFixed(1) + ' s',
    coordTime: s.coordT.toFixed(1) + ' s',
    status,
  };
}

// ---- controls ----
export function yaw(s: FlightState, a: number) {
  s.fwd = norm(rot(s.fwd, s.up, a));
  s.right = norm(rot(s.right, s.up, a));
  reortho(s);
}

export function pitch(s: FlightState, a: number) {
  s.fwd = norm(rot(s.fwd, s.right, a));
  s.up = norm(rot(s.up, s.right, a));
  reortho(s);
}

// Place the camera at `eye` (world units) looking at `target`, with a valid basis.
export function aimFlightAt(s: FlightState, eye: number[], target: number[]) {
  s.cam = [eye[0], eye[1], eye[2]];
  const d = norm([target[0] - eye[0], target[1] - eye[1], target[2] - eye[2]]);
  if (len(d) > 0.5) s.fwd = d;
  rebuild(s);
}
