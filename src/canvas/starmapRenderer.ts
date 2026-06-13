// ============================================================
// Starmap Mode Canvas Renderer
// 3D interactive scatter plot of 60 nearby stars
// ============================================================

import { dot, len, sub, cross, norm, clamp, sph } from '../lib/math3d';
import { spectralColor, laneColor } from '../lib/colors';
import type { Star, Lane } from '../data/starData';

const LY = 30; // world units per light-year
const FOV = (60 * Math.PI) / 180;

export interface StarmapState {
  // camera orbit
  azimuth: number;    // yaw around Y
  polar: number;      // pitch from Y axis
  distance: number;   // camera distance from origin
  targetX: number;
  targetY: number;
  targetZ: number;
  // smooth interpolation
  azimuthTarget: number;
  polarTarget: number;
  distanceTarget: number;
  targetXTarget: number;
  targetYTarget: number;
  targetZTarget: number;
  // auto-rotate
  idleTime: number;
  autoRotate: boolean;
  // canvas
  W: number;
  H: number;
  // selection
  selectedStarId: number | null;
  hoveredStarId: number | null;
  hoveredLaneIdx: number | null;
  // fade-in animation
  fadeIn: number; // 0→1
  laneFadeIn: number; // 0→1
}

export function createStarmapState(): StarmapState {
  return {
    azimuth: 0.3,
    polar: 1.2,
    distance: 600,
    targetX: 0,
    targetY: 0,
    targetZ: 0,
    azimuthTarget: 0.3,
    polarTarget: 1.2,
    distanceTarget: 600,
    targetXTarget: 0,
    targetYTarget: 0,
    targetZTarget: 0,
    idleTime: 0,
    autoRotate: false,
    W: 0,
    H: 0,
    selectedStarId: null,
    hoveredStarId: null,
    hoveredLaneIdx: null,
    fadeIn: 0,
    laneFadeIn: 0,
  };
}

export function resizeStarmap(s: StarmapState, width: number, height: number) {
  s.W = width;
  s.H = height;
}

function getCameraBasis(s: StarmapState) {
  const sinP = Math.sin(s.polar),
    cosP = Math.cos(s.polar);
  const sinA = Math.sin(s.azimuth),
    cosA = Math.cos(s.azimuth);

  // Camera position (orbit around target)
  const camPos: [number, number, number] = [
    s.targetX + s.distance * sinP * sinA,
    s.targetY + s.distance * cosP,
    s.targetZ + s.distance * sinP * cosA,
  ];

  // Forward = from camera toward target
  const fwd = norm(sub([s.targetX, s.targetY, s.targetZ], camPos));
  // Up reference (world up)
  let ref: number[] = [0, 1, 0];
  if (Math.abs(fwd[1]) > 0.95) ref = [0, 0, 1];
  const right = norm(cross(fwd, ref));
  const up = cross(right, fwd);

  return { camPos, fwd, right, up };
}

export function projectStarmap(
  worldPos: number[],
  camPos: number[],
  fwd: number[],
  right: number[],
  up: number[],
  W: number,
  H: number
) {
  const rel = sub(worldPos, camPos);
  const d = len(rel);
  if (d < 1) return null;
  const zc = dot(rel, fwd);
  if (zc <= 0.1) return null;
  const focalLength = H / (2 * Math.tan(FOV / 2));
  const xc = dot(rel, right);
  const yc = dot(rel, up);
  const sx = W / 2 + (focalLength * xc) / zc;
  const sy = H / 2 - (focalLength * yc) / zc;
  const scale = focalLength / zc;
  return { sx, sy, depth: zc, scale, d };
}

function getStarScreenPositions(
  s: StarmapState,
  stars: Star[]
): Array<{ sx: number; sy: number; scale: number; depth: number; star: Star } | null> {
  const { camPos, fwd, right, up } = getCameraBasis(s);
  return stars.map((star) => {
    const p = projectStarmap([star.x, star.y, star.z], camPos, fwd, right, up, s.W, s.H);
    if (!p) return null;
    return { sx: p.sx, sy: p.sy, scale: p.scale, depth: p.depth, star };
  });
}

export function findStarAtMouse(
  mx: number,
  my: number,
  s: StarmapState,
  stars: Star[]
): number | null {
  const screenPos = getStarScreenPositions(s, stars);
  let closestId: number | null = null;
  let closestDist = 20; // click radius in px

  screenPos.forEach((p, i) => {
    if (!p) return;
    const d = Math.hypot(p.sx - mx, p.sy - my);
    if (d < closestDist) {
      closestDist = d;
      closestId = i;
    }
  });
  return closestId;
}

export function findLaneAtMouse(
  mx: number,
  my: number,
  s: StarmapState,
  stars: Star[],
  lanes: Lane[]
): number | null {
  const { camPos, fwd, right, up } = getCameraBasis(s);
  let closestIdx: number | null = null;
  let closestDist = 8;

  lanes.forEach((lane, idx) => {
    const a = stars[lane.from];
    const b = stars[lane.to];
    const pa = projectStarmap([a.x, a.y, a.z], camPos, fwd, right, up, s.W, s.H);
    const pb = projectStarmap([b.x, b.y, b.z], camPos, fwd, right, up, s.W, s.H);
    if (!pa || !pb) return;

    // Distance from point to line segment
    const dx = pb.sx - pa.sx,
      dy = pb.sy - pa.sy;
    const len2 = dx * dx + dy * dy;
    let t = ((mx - pa.sx) * dx + (my - pa.sy) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    const projX = pa.sx + t * dx;
    const projY = pa.sy + t * dy;
    const dist = Math.hypot(mx - projX, my - projY);
    if (dist < closestDist) {
      closestDist = dist;
      closestIdx = idx;
    }
  });
  return closestIdx;
}

export function updateStarmap(s: StarmapState, dt: number) {
  // Smooth camera damping
  const lerpA = 0.08;
  const lerpD = 0.06;
  s.azimuth += (s.azimuthTarget - s.azimuth) * lerpA;
  s.polar += (s.polarTarget - s.polar) * lerpA;
  s.distance += (s.distanceTarget - s.distance) * lerpD;
  s.targetX += (s.targetXTarget - s.targetX) * lerpD;
  s.targetY += (s.targetYTarget - s.targetY) * lerpD;
  s.targetZ += (s.targetZTarget - s.targetZ) * lerpD;

  // Fade in
  s.fadeIn = Math.min(1, s.fadeIn + dt * 1.5);
  if (s.fadeIn >= 1) {
    s.laneFadeIn = Math.min(1, s.laneFadeIn + dt * 2);
  }

  // Auto-rotate
  if (s.autoRotate) {
    s.azimuthTarget += 0.05 * dt;
  }
  s.idleTime += dt;
  if (s.idleTime > 5 && !s.autoRotate) {
    s.autoRotate = true;
  }
}

export function renderStarmap(
  ctx: CanvasRenderingContext2D,
  s: StarmapState,
  stars: Star[],
  lanes: Lane[]
) {
  const { W, H } = s;
  if (W === 0 || H === 0) return;

  // Clear
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#03050a';
  ctx.fillRect(0, 0, W, H);

  const { camPos, fwd, right, up } = getCameraBasis(s);
  const globalFade = s.fadeIn;

  if (globalFade <= 0.01) return;

  // ---- Celestial reference sphere ----
  ctx.globalAlpha = 0.04 * globalFade;
  ctx.strokeStyle = 'rgba(70,224,210,0.3)';
  ctx.lineWidth = 0.5;
  const radius = 600; // 20 ly
  const DEG = Math.PI / 180;

  // Latitude lines
  for (const latd of [-60, -40, -20, 0, 20, 40, 60]) {
    const lat = latd * DEG;
    ctx.beginPath();
    let first = true;
    for (let lond = 0; lond <= 360; lond += 6) {
      const lon = lond * DEG;
      const p = sph(lat, lon);
      const wp = [p[0] * radius, p[1] * radius, p[2] * radius];
      const proj = projectStarmap(wp, camPos, fwd, right, up, W, H);
      if (proj) {
        if (first) {
          ctx.moveTo(proj.sx, proj.sy);
          first = false;
        } else {
          ctx.lineTo(proj.sx, proj.sy);
        }
      } else {
        first = true;
      }
    }
    ctx.stroke();
  }
  // Longitude lines
  for (let lond = 0; lond < 360; lond += 30) {
    const lon = lond * DEG;
    ctx.beginPath();
    let first = true;
    for (let latd = -80; latd <= 80; latd += 5) {
      const p = sph(latd * DEG, lon);
      const wp = [p[0] * radius, p[1] * radius, p[2] * radius];
      const proj = projectStarmap(wp, camPos, fwd, right, up, W, H);
      if (proj) {
        if (first) {
          ctx.moveTo(proj.sx, proj.sy);
          first = false;
        } else {
          ctx.lineTo(proj.sx, proj.sy);
        }
      } else {
        first = true;
      }
    }
    ctx.stroke();
  }

  // ---- Sol marker ----
  const solProj = projectStarmap([0, 0, 0], camPos, fwd, right, up, W, H);
  if (solProj) {
    // Glow
    const glow = ctx.createRadialGradient(solProj.sx, solProj.sy, 0, solProj.sx, solProj.sy, 12);
    glow.addColorStop(0, 'rgba(255,232,138,0.8)');
    glow.addColorStop(1, 'rgba(255,232,138,0)');
    ctx.globalAlpha = globalFade;
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(solProj.sx, solProj.sy, 12, 0, Math.PI * 2);
    ctx.fill();
    // Core
    ctx.globalAlpha = globalFade;
    ctx.fillStyle = 'rgba(255,232,138,0.9)';
    ctx.beginPath();
    ctx.arc(solProj.sx, solProj.sy, 3, 0, Math.PI * 2);
    ctx.fill();
    // Label
    ctx.globalAlpha = 0.6 * globalFade;
    ctx.fillStyle = '#ffe88a';
    ctx.font = '500 11px "Space Grotesk", system-ui, sans-serif';
    ctx.fillText('Sol', solProj.sx + 8, solProj.sy + 4);
  }

  // ---- Lanes ----
  const laneFade = s.laneFadeIn * globalFade;
  if (laneFade > 0.01) {
    const showAll = s.distance < 400;
    lanes.forEach((lane) => {
      const a = stars[lane.from];
      const b = stars[lane.to];
      const pa = projectStarmap([a.x, a.y, a.z], camPos, fwd, right, up, W, H);
      const pb = projectStarmap([b.x, b.y, b.z], camPos, fwd, right, up, W, H);
      if (!pa || !pb) return;

      const [lr, lg, lb] = laneColor(lane.class);
      let opacity: number;
      let lineWidth: number;
      switch (lane.class) {
        case 'planck':
          opacity = 0.35;
          lineWidth = 1.5;
          break;
        case 'stellar':
          if (!showAll) return;
          opacity = 0.25;
          lineWidth = 1.0;
          break;
        case 'galactic':
          if (!showAll) return;
          opacity = 0.15;
          lineWidth = 0.5;
          break;
        default:
          opacity = 0.15;
          lineWidth = 0.5;
      }

      ctx.globalAlpha = opacity * laneFade;
      ctx.strokeStyle = `rgba(${lr},${lg},${lb},0.8)`;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(pa.sx, pa.sy);
      ctx.lineTo(pb.sx, pb.sy);
      ctx.stroke();
    });
  }

  // ---- Stars ----
  // Sort by depth (far to near) and distance for stagger
  const screenPos = getStarScreenPositions(s, stars);
  const sortedIndices = stars
    .map((_, i) => i)
    .sort((a, b) => {
      const da = screenPos[a]?.depth ?? 0;
      const db = screenPos[b]?.depth ?? 0;
      return db - da;
    });

  sortedIndices.forEach((idx) => {
    const sp = screenPos[idx];
    if (!sp) return;
    const { sx, sy } = sp;
    const star = stars[idx];
    const [cr, cg, cb] = spectralColor(star.spectralType);

    // Stagger fade: closer stars appear first
    const distFromCam = len(sub([star.x, star.y, star.z], camPos));
    const staggerDelay = (distFromCam / 1200) * 0.5;
    const starFade = clamp((globalFade - staggerDelay) / (1 - staggerDelay), 0, 1);
    if (starFade <= 0.01) return;

    const baseSize = 2;
    const glowSize = 6;
    const outerSize = 14;
    const bloomSize = 30 * Math.sqrt(star.luminosity);

    // Bloom halo for bright stars
    if (star.luminosity > 1.0) {
      const b = ctx.createRadialGradient(sx, sy, 0, sx, sy, bloomSize);
      b.addColorStop(0, `rgba(${cr},${cg},${cb},0.04)`);
      b.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
      ctx.globalAlpha = starFade;
      ctx.fillStyle = b;
      ctx.beginPath();
      ctx.arc(sx, sy, bloomSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Outer glow
    const og = ctx.createRadialGradient(sx, sy, 0, sx, sy, outerSize);
    og.addColorStop(0, `rgba(${cr},${cg},${cb},0.08)`);
    og.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
    ctx.globalAlpha = starFade;
    ctx.fillStyle = og;
    ctx.beginPath();
    ctx.arc(sx, sy, outerSize, 0, Math.PI * 2);
    ctx.fill();

    // Inner glow
    const ig = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowSize);
    ig.addColorStop(0, `rgba(${cr},${cg},${cb},0.3)`);
    ig.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
    ctx.globalAlpha = starFade;
    ctx.fillStyle = ig;
    ctx.beginPath();
    ctx.arc(sx, sy, glowSize, 0, Math.PI * 2);
    ctx.fill();

    // Core
    ctx.globalAlpha = starFade;
    ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
    ctx.beginPath();
    ctx.arc(sx, sy, baseSize, 0, Math.PI * 2);
    ctx.fill();

    // Selected highlight ring
    if (s.selectedStarId === idx) {
      const pulse = 1 + 0.2 * Math.sin(Date.now() * 0.005);
      ctx.globalAlpha = 0.6 * starFade;
      ctx.strokeStyle = '#46e0d2';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sx, sy, 8 * pulse, 0, Math.PI * 2);
      ctx.stroke();

      // Dashed targeting line
      ctx.globalAlpha = 0.08 * starFade;
      ctx.strokeStyle = '#46e0d2';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx, H);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Label for nearby/bright stars
    const showLabel = distFromCam < 400 || star.luminosity > 2.0 || s.selectedStarId === idx;
    if (showLabel) {
      ctx.globalAlpha = 0.5 * starFade;
      ctx.fillStyle = '#cfe7e6';
      ctx.font = '500 10px "Space Grotesk", system-ui, sans-serif';
      const label = star.name;
      ctx.fillText(label, sx + 6, sy - 4);
      // Spectral dot
      ctx.globalAlpha = 0.7 * starFade;
      ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
      ctx.beginPath();
      ctx.arc(sx + 4, sy - 8, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // ---- Hovered lane highlight ----
  if (s.hoveredLaneIdx !== null) {
    const lane = lanes[s.hoveredLaneIdx];
    if (lane) {
      const a = stars[lane.from];
      const b = stars[lane.to];
      const pa = projectStarmap([a.x, a.y, a.z], camPos, fwd, right, up, W, H);
      const pb = projectStarmap([b.x, b.y, b.z], camPos, fwd, right, up, W, H);
      if (pa && pb) {
        const [lr, lg, lb] = laneColor(lane.class);
        ctx.globalAlpha = 0.6;
        ctx.strokeStyle = `rgba(${lr},${lg},${lb},1)`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(pa.sx, pa.sy);
        ctx.lineTo(pb.sx, pb.sy);
        ctx.stroke();
      }
    }
  }
}

export function getStarmapHUD(s: StarmapState): { scaleText: string; countText: string } {
  const viewLy = (s.distance / LY).toFixed(1);
  return {
    scaleText: `1 LY = ${LY} UNITS \u00b7 VIEW: ${viewLy} LY`,
    countText: `60 SYSTEMS \u00b7 105 LANES`,
  };
}
