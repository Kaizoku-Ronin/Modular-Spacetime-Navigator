// ============================================================
// Solar System Renderer — Sun + planets + orbits
// Replaces the black hole / accretion disk when in Sol system.
// Integrates into the flight renderer pipeline.
// ============================================================

import { dot, len } from '../lib/math3d';
import { tempToRGB } from '../data/solarSystem';
import type { FlightState } from './flightRenderer';
import { aberrateLocal } from './flightRenderer';
import type { Planet } from '../data/solarSystem';

const AU = 100; // world units per AU (matches flightRenderer)

// ---- solar system state ----
export interface SolarState {
  planets: Planet[];
  initialized: boolean;
  lastSunScreen: { x: number; y: number } | null;
  sway: number[];
}

export function createSolarState(): SolarState {
  return {
    planets: [],
    initialized: false,
    lastSunScreen: null,
    sway: [0, 0, 0],
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

// ---- planet shading (sun-direction) ----
function shadePlanet(
  ctx: CanvasRenderingContext2D,
  sx: number, sy: number, rad: number,
  col: string,
  sunX: number, sunY: number
) {
  if (rad <= 2.2) {
    // Too small for shading, just draw a dot
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(sx, sy, Math.max(1, rad), 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  const sdx = sunX - sx;
  const sdy = sunY - sy;
  const m = Math.hypot(sdx, sdy) || 1;
  const ox = (sdx / m) * rad * 0.55;
  const oy = (sdy / m) * rad * 0.55;

  const g = ctx.createRadialGradient(sx + ox, sy + oy, rad * 0.1, sx, sy, rad);
  g.addColorStop(0, col);
  g.addColorStop(0.65, col);
  g.addColorStop(1, '#05070b');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(sx, sy, rad, 0, Math.PI * 2);
  ctx.fill();
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
  const speed = s.beta * 42; // world units/sec at beta=1
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

  // 4. Draw planets
  const sunX = solar.lastSunScreen?.x ?? s.CX;
  const sunY = solar.lastSunScreen?.y ?? s.CY;

  for (const d of draws) {
    shadePlanet(ctx, d.sx, d.sy, d.rad, d.planet.col, sunX, sunY);

    // Rings
    if (d.planet.ring && d.rad > 3) {
      drawRings(ctx, d.sx, d.sy, d.rad);
    }

    // Label
    if (d.rad > 1.6) {
      drawLabel(ctx, d.planet.name, d.sx, d.sy - d.rad - 7, '#bcd3d2', false);
    }
  }

  // 5. Debris streaks (for speed sense, adapted from HTML demo)
  if (s.beta > 0.001) {
    drawDebrisStreaks(ctx, s, dt);
  }
}

// ---- HUD data for solar system ----
export function getSolarHUD(s: FlightState, _solar: SolarState): {
  distance: string;
  velocity: string;
  gamma: string;
  properTime: string;
  coordTime: string;
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
    gamma: gamma.toFixed(3),
    properTime: s.properT.toFixed(1) + ' s',
    coordTime: s.coordT.toFixed(1) + ' s',
    status,
  };
}
