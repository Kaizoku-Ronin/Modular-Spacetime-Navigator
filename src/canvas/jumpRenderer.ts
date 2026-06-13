// ============================================================
// Hyperjump Transition Canvas Renderer
// Warp tunnel with radial star streaks, gamma flash, D(143) rings
// ============================================================

export interface JumpState {
  phase: 'accel' | 'flash' | 'warp' | 'rings' | 'fadeout' | 'arrival';
  progress: number; // 0 to 1 overall
  timeInPhase: number;
  flashOpacity: number;
  // Streak state
  streakAngles: number[];
  streakLengths: number[];
  swirlOffset: number;
  // Ring state
  ringRotations: number[];
  // Messages
  messageIndex: number;
  messageOpacity: number;
}

const MESSAGES = [
  'COMPUTING GEODESIC...',
  'ALIGNING MODULAR CURVE X\u2080(143)...',
  'MOUNTING CUSP COORDINATES...',
  'CALIBRATING D(143) = {1, 11, 13, 143}...',
  'BRIDGING MODULAR SPACETIME...',
  'ARRIVAL IMMINENT',
];

export function createJumpState(): JumpState {
  const streakAngles: number[] = [];
  const streakLengths: number[] = [];
  for (let i = 0; i < 200; i++) {
    streakAngles.push(Math.random() * Math.PI * 2);
    streakLengths.push(20 + Math.random() * 180);
  }
  return {
    phase: 'accel',
    progress: 0,
    timeInPhase: 0,
    flashOpacity: 0,
    streakAngles,
    streakLengths,
    swirlOffset: 0,
    ringRotations: [0, 0, 0, 0],
    messageIndex: 0,
    messageOpacity: 0,
  };
}

export function resetJump(s: JumpState) {
  s.phase = 'accel';
  s.progress = 0;
  s.timeInPhase = 0;
  s.flashOpacity = 0;
  s.swirlOffset = 0;
  s.ringRotations = [0, 0, 0, 0];
  s.messageIndex = 0;
  s.messageOpacity = 0;
}

// Timeline constants
const ACCEL_DUR = 0.8;
const FLASH_IN_DUR = 0.3;
const FLASH_HOLD_DUR = 1.2;
const RINGS_DUR = 0.7;
const FADEOUT_DUR = 0.6;
const ARRIVAL_DUR = 1.0;
const TOTAL_DUR = ACCEL_DUR + FLASH_IN_DUR + FLASH_HOLD_DUR + FADEOUT_DUR + ARRIVAL_DUR;

export function updateJump(s: JumpState, dt: number) {
  s.timeInPhase += dt;
  s.progress = Math.min(1, s.progress + dt / TOTAL_DUR);

  // Phase transitions
  switch (s.phase) {
    case 'accel':
      if (s.timeInPhase >= ACCEL_DUR) {
        s.phase = 'flash';
        s.timeInPhase = 0;
      }
      break;
    case 'flash':
      s.flashOpacity = Math.min(1, s.timeInPhase / FLASH_IN_DUR);
      if (s.timeInPhase >= FLASH_IN_DUR) {
        s.phase = 'warp';
        s.timeInPhase = 0;
      }
      break;
    case 'warp':
      s.flashOpacity = 1;
      if (s.timeInPhase >= FLASH_HOLD_DUR * 0.5) {
        s.phase = 'rings';
        s.timeInPhase = 0;
      }
      break;
    case 'rings':
      s.flashOpacity = 1;
      if (s.timeInPhase >= RINGS_DUR) {
        s.phase = 'fadeout';
        s.timeInPhase = 0;
      }
      break;
    case 'fadeout':
      s.flashOpacity = Math.max(0, 1 - s.timeInPhase / FADEOUT_DUR);
      if (s.timeInPhase >= FADEOUT_DUR) {
        s.phase = 'arrival';
        s.timeInPhase = 0;
        s.flashOpacity = 0;
      }
      break;
    case 'arrival':
      s.flashOpacity = 0;
      break;
  }

  // Swirl
  const warpProgress =
    s.phase === 'flash' || s.phase === 'warp' || s.phase === 'rings' || s.phase === 'fadeout'
      ? 1
      : s.phase === 'accel'
        ? s.timeInPhase / ACCEL_DUR
        : 0;
  s.swirlOffset += 0.02 * warpProgress * dt * 60;

  // Ring rotations (continuous)
  const ringSpeeds = [1 / 20, 1 / 13, 1 / 11, 1 / 7]; // revs per second
  s.ringRotations = s.ringRotations.map((r, i) => r + ringSpeeds[i] * Math.PI * 2 * dt);

  // Message cycling (during warp through fadeout)
  if (
    s.phase === 'warp' ||
    s.phase === 'rings' ||
    s.phase === 'fadeout'
  ) {
    const cycleTime = s.timeInPhase;
    const phase = cycleTime % 1.5;
    if (phase < 0.3) s.messageOpacity = phase / 0.3;
    else if (phase < 1.2) s.messageOpacity = 1;
    else s.messageOpacity = 1 - (phase - 1.2) / 0.3;
    s.messageIndex = Math.floor(s.progress * MESSAGES.length) % MESSAGES.length;
  } else {
    s.messageOpacity = 0;
  }
}

export function renderJump(
  ctx: CanvasRenderingContext2D,
  s: JumpState,
  W: number,
  H: number
) {
  if (W === 0 || H === 0) return;

  const cx = W / 2;
  const cy = H / 2;

  // Clear
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#03050a';
  ctx.fillRect(0, 0, W, H);

  const warpActive =
    s.phase === 'flash' || s.phase === 'warp' || s.phase === 'rings' || s.phase === 'fadeout';
  const warpProgress = warpActive
    ? 1
    : s.phase === 'accel'
      ? s.timeInPhase / ACCEL_DUR
      : 0;
  const fade = warpActive && s.phase !== 'fadeout' ? 1 : s.phase === 'fadeout' ? 1 - s.timeInPhase / FADEOUT_DUR : warpProgress;

  if (warpProgress > 0.01 && fade > 0.01) {
    // ---- Radial star streaks ----
    const innerRadius = 5 + warpProgress * 10;
    for (let i = 0; i < 200; i++) {
      const angle = s.streakAngles[i] + s.swirlOffset * (i % 2 === 0 ? 1 : -1);
      const dist = s.streakLengths[i] * warpProgress;
      const x1 = cx + Math.cos(angle) * innerRadius;
      const y1 = cy + Math.sin(angle) * innerRadius;
      const x2 = cx + Math.cos(angle) * (innerRadius + dist);
      const y2 = cy + Math.sin(angle) * (innerRadius + dist);

      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, `rgba(170,221,255,${0.8 * fade})`);
      grad.addColorStop(1, `rgba(26,51,170,${0.2 * fade})`);

      ctx.strokeStyle = grad;
      ctx.lineWidth = 1 + Math.random() * 1.5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Center glow
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 120 * warpProgress);
    glow.addColorStop(0, `rgba(255,255,255,${0.3 * s.flashOpacity})`);
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
  }

  // ---- D(143) Rings ----
  const ringPhases = ['warp', 'rings', 'fadeout'];
  if (ringPhases.includes(s.phase)) {
    let ringFade: number;
    if (s.phase === 'warp') {
      ringFade = 0;
    } else if (s.phase === 'rings') {
      ringFade = Math.min(0.6, s.timeInPhase / 0.4);
    } else {
      ringFade = Math.max(0, 0.6 * (1 - s.timeInPhase / FADEOUT_DUR));
    }

    if (ringFade > 0.01) {
      const ringColors = [
        'rgba(95,126,125,', // --ink-dim (width 143)
        'rgba(255,182,72,', // --warn (width 13)
        'rgba(70,224,210,', // --safe (width 11)
        'rgba(155,89,255,', // --lane-galactic (width 1)
      ];
      const ringSizes = [0.35, 0.22, 0.16, 0.08]; // relative to min(W,H)
      const ringLabels = ['143', '13', '11', '1'];
      const baseR = Math.min(W, H);

      for (let i = 0; i < 4; i++) {
        const r = baseR * ringSizes[i];
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(s.ringRotations[i] * (s.phase === 'fadeout' ? 2 : 1));
        ctx.translate(-cx, -cy);

        ctx.globalAlpha = ringFade;
        ctx.strokeStyle = ringColors[i] + '0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        // Label
        ctx.globalAlpha = ringFade * 0.8;
        ctx.fillStyle = ringColors[i] + '1)';
        ctx.font = '700 10px "JetBrains Mono", monospace';
        ctx.fillText(`w${ringLabels[i]}`, cx + r + 6, cy - r * 0.5);

        ctx.restore();
      }
    }
  }

  // ---- Loading message ----
  if (s.messageOpacity > 0.01 && s.messageIndex < MESSAGES.length) {
    ctx.globalAlpha = s.messageOpacity;
    ctx.fillStyle = '#5f7e7d';
    ctx.font = '400 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '0.1em';
    ctx.fillText(MESSAGES[s.messageIndex], cx, cy + Math.min(W, H) * 0.15 + 20);
    ctx.textAlign = 'start';
  }
}

export function isJumpComplete(s: JumpState): boolean {
  return s.phase === 'arrival' && s.timeInPhase >= ARRIVAL_DUR;
}

export function getJumpProgress(s: JumpState): number {
  return s.progress;
}
