// ============================================================
// LaneNetwork — Simplified 2D network visualization
// Shows 60 stars as nodes and hyperspace lanes as edges
// Uses Canvas 2D for performant rendering
// ============================================================

import { memo, useRef, useEffect, useState } from 'react';
import { spectralHex, laneColorHex } from '@/lib/colors';

interface StarNode {
  name: string;
  spectral_type: string;
  distance_ly: number;
  x: number;
  y: number;
  z: number;
}

interface LaneEdge {
  from: string;
  to: string;
  distanceLy: number;
  class: string;
}

interface LaneNetworkProps {
  stars: StarNode[];
  lanes: LaneEdge[];
  className?: string;
}

function getSpectralColor(type: string): string {
  return spectralHex(type);
}

function getLaneColor(laneClass: string): string {
  return laneColorHex(laneClass);
}

const LaneNetwork = memo(function LaneNetwork({ stars, lanes, className = '' }: LaneNetworkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 700 });
  const animationRef = useRef<number>(0);
  const progressRef = useRef(0);

  // Responsive sizing
  useEffect(() => {
    function handleResize() {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        setDimensions({ width: w, height: Math.min(700, w * 0.65) });
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || stars.length === 0 || lanes.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    // Compute projected positions (use x,y, ignore z for 2D)
    // Scale to fit canvas with padding
    const pad = 40;
    const xs = stars.map((s) => s.x);
    const ys = stars.map((s) => s.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;

    const scale = Math.min(
      (dimensions.width - pad * 2) / rangeX,
      (dimensions.height - pad * 2) / rangeY
    );

    const project = (star: StarNode) => ({
      x: pad + (star.x - minX) * scale,
      y: dimensions.height - (pad + (star.y - minY) * scale),
    });

    // Build star positions map
    const posMap = new Map<string, { x: number; y: number }>();
    stars.forEach((s) => posMap.set(s.name, project(s)));

    // Sort lanes so shorter ones draw on top
    const sortedLanes = [...lanes].sort((a, b) => a.distanceLy - b.distanceLy);

    // Build adjacency for node glow
    const nodeFirstEdge = new Map<string, number>();
    sortedLanes.forEach((lane, i) => {
      if (!nodeFirstEdge.has(lane.from)) nodeFirstEdge.set(lane.from, i);
      if (!nodeFirstEdge.has(lane.to)) nodeFirstEdge.set(lane.to, i);
    });

    // Build lane draw order index
    const laneIndexMap = new Map<string, number>();
    sortedLanes.forEach((lane, i) => {
      laneIndexMap.set(`${lane.from}|${lane.to}`, i);
      laneIndexMap.set(`${lane.to}|${lane.from}`, i);
    });

    // Animation: edge draw-on
    let isActive = true;
    progressRef.current = 0;

    function draw() {
      if (!isActive || !ctx) return;
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      const progress = Math.min(progressRef.current, 1);
      const edgesToDraw = Math.floor(progress * sortedLanes.length);
      const partialProgress = (progress * sortedLanes.length) - edgesToDraw;

      // Draw edges
      sortedLanes.forEach((lane, i) => {
        if (i > edgesToDraw) return;

        const from = posMap.get(lane.from);
        const to = posMap.get(lane.to);
        if (!from || !to) return;

        const opacity = i === edgesToDraw ? partialProgress : 1;
        if (opacity <= 0) return;

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);

        const color = getLaneColor(lane.class);
        ctx.strokeStyle = color;
        ctx.globalAlpha = opacity * 0.3;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.globalAlpha = 1;
      });

      // Draw nodes (only if their first edge has started)
      stars.forEach((star) => {
        const pos = posMap.get(star.name);
        if (!pos) return;

        const firstEdgeIdx = nodeFirstEdge.get(star.name) ?? Infinity;
        const edgeProgress = progress * sortedLanes.length;
        const nodeOpacity = edgeProgress > firstEdgeIdx ? 1 :
          edgeProgress > firstEdgeIdx - 2 ? (edgeProgress - (firstEdgeIdx - 2)) / 2 : 0;

        if (nodeOpacity <= 0) return;

        const color = getSpectralColor(star.spectral_type);
        const isSol = star.name === 'Sol';

        ctx.globalAlpha = nodeOpacity;

        // Glow for Sol
        if (isSol) {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 232, 138, 0.2)';
          ctx.fill();
        }

        // Node circle
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, isSol ? 4 : 2.5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.globalAlpha = 1;
      });

      // Increment progress
      if (progressRef.current < 1.5) {
        progressRef.current += 0.008;
        animationRef.current = requestAnimationFrame(draw);
      }
    }

    draw();

    return () => {
      isActive = false;
      cancelAnimationFrame(animationRef.current);
    };
  }, [stars, lanes, dimensions]);

  return (
    <div ref={containerRef} className={className} style={{ width: '100%' }}>
      <canvas
        ref={canvasRef}
        style={{
          width: dimensions.width,
          height: dimensions.height,
          display: 'block',
          margin: '0 auto',
        }}
      />
    </div>
  );
});

export default LaneNetwork;
