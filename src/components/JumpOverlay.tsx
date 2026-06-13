// ============================================================
// Jump Overlay — Loading/transition overlay with D(143) rings
// ============================================================

import { useEffect, useRef } from 'react';

const MESSAGES = [
  'COMPUTING GEODESIC...',
  'ALIGNING MODULAR CURVE X\u2080(143)...',
  'MOUNTING CUSP COORDINATES...',
  'CALIBRATING D(143) = {1, 11, 13, 143}...',
  'SPACETIME BRIDGE ACTIVE',
];

export function JumpOverlay({
  active,
  progress,
}: {
  active: boolean;
  progress: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const ringRotRef = useRef([0, 0, 0, 0]);
  const msgIdxRef = useRef(0);
  const msgOpRef = useRef(0);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    function frame(now: number) {
      if (!canvas || !ctx) return;
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const W = canvas.width;
      const H = canvas.height;
      const cx = W / 2;
      const cy = H / 2;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#03050a';
      ctx.fillRect(0, 0, W, H);

      // Update ring rotations
      const ringSpeeds = [1 / 20, 1 / 13, 1 / 11, 1 / 7];
      ringRotRef.current = ringRotRef.current.map((r, i) => r + ringSpeeds[i] * Math.PI * 2 * dt);

      // Update message
      msgIdxRef.current = Math.floor(progress * MESSAGES.length) % MESSAGES.length;
      const cycleTime = (now / 1000) % 1.5;
      if (cycleTime < 0.3) msgOpRef.current = cycleTime / 0.3;
      else if (cycleTime < 1.2) msgOpRef.current = 1;
      else msgOpRef.current = 1 - (cycleTime - 1.2) / 0.3;

      // Draw rings
      const ringColors = [
        'rgba(95,126,125,',
        'rgba(255,182,72,',
        'rgba(70,224,210,',
        'rgba(155,89,255,',
      ];
      const ringSizes = [0.25, 0.16, 0.12, 0.06];
      const ringLabels = ['143', '13', '11', '1'];
      const baseR = Math.min(W, H);

      for (let i = 0; i < 4; i++) {
        const r = baseR * ringSizes[i];
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(ringRotRef.current[i]);
        ctx.translate(-cx, -cy);

        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = ringColors[i] + '0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.globalAlpha = 0.7;
        ctx.fillStyle = ringColors[i] + '1)';
        ctx.font = '700 9px "JetBrains Mono", monospace';
        ctx.fillText(`w${ringLabels[i]}`, cx + r + 4, cy - r * 0.4);

        ctx.restore();
      }

      // Loading message
      ctx.globalAlpha = msgOpRef.current;
      ctx.fillStyle = '#5f7e7d';
      ctx.font = '400 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(MESSAGES[msgIdxRef.current], cx, cy + baseR * 0.12 + 20);
      ctx.textAlign = 'start';

      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, progress]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        width: '100vw',
        height: '100vh',
      }}
    />
  );
}
