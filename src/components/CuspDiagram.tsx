// ============================================================
// CuspDiagram — Animated SVG of X_0(143) four cusps
// Four concentric rings rotating at different speeds
// Labels: 143/cosmological, 13/galactic, 11/stellar, 1/Planck
// ============================================================

import { memo } from 'react';
import { CUSP_COLORS } from '@/lib/colors';

interface CuspDiagramProps {
  size?: number;
  className?: string;
}

const CuspDiagram = memo(function CuspDiagram({ size = 400, className = '' }: CuspDiagramProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.42;

  // Four cusps: width, label, color, scale label
  const cusps = [
    { width: 143, r: maxR, color: CUSP_COLORS.cosmological, label: '143', scale: 'cosmological' },
    { width: 13, r: maxR * 0.6, color: CUSP_COLORS.galactic, label: '13', scale: 'galactic' },
    { width: 11, r: maxR * 0.35, color: CUSP_COLORS.stellar, label: '11', scale: 'stellar' },
    { width: 1, r: maxR * 0.15, color: CUSP_COLORS.planck, label: '1', scale: 'Planck' },
  ];

  // Rotation durations (prime-inspired, different speeds)
  const durations = [20, 13, 11, 7];
  const strokeWidths = [1.5, 1.5, 1.5, 2];
  const dashArrays = [
    `${2 * Math.PI * cusps[0].r / 143 * 7},${2 * Math.PI * cusps[0].r / 143 * 3}`,
    `${2 * Math.PI * cusps[1].r / 13 * 2},${2 * Math.PI * cusps[1].r / 13 * 1}`,
    `${2 * Math.PI * cusps[2].r / 11 * 2},${2 * Math.PI * cusps[2].r / 11 * 1}`,
    'none',
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={{ overflow: 'visible' }}
    >
      <defs>
        {cusps.map((_, i) => (
          <filter key={`glow-${i}`} id={`cusp-glow-${i}`}>
            <feGaussianBlur stdDeviation={i === 3 ? 3 : 2} result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        ))}
      </defs>

      {/* Background faint circle (the modular curve) */}
      <circle
        cx={cx}
        cy={cy}
        r={maxR * 1.05}
        fill="none"
        stroke="rgba(95, 126, 125, 0.12)"
        strokeWidth={0.5}
      />

      {/* Four rotating rings */}
      {cusps.map((cusp, i) => (
        <g key={cusp.width}>
          {/* Rotating ring group */}
          <g
            style={{
              transformOrigin: `${cx}px ${cy}px`,
              animation: `cuspRotate${i % 2 === 0 ? 'CW' : 'CCW'} ${durations[i]}s linear infinite`,
            }}
          >
            <circle
              cx={cx}
              cy={cy}
              r={cusp.r}
              fill="none"
              stroke={cusp.color}
              strokeWidth={strokeWidths[i]}
              strokeDasharray={dashArrays[i] === 'none' ? undefined : dashArrays[i]}
              opacity={0.7}
              filter={`url(#cusp-glow-${i})`}
            />
          </g>

          {/* Scale label */}
          <text
            x={cx + cusp.r + 12}
            y={cy - cusp.r + 4}
            fill={cusp.color}
            fontSize={Math.max(9, size * 0.022)}
            fontFamily="'JetBrains Mono', monospace"
            fontWeight={700}
            opacity={0.9}
          >
            {cusp.label}
          </text>

          {/* Scale name */}
          <text
            x={cx + cusp.r + 12}
            y={cy - cusp.r + 4 + Math.max(11, size * 0.028)}
            fill="#5f7e7d"
            fontSize={Math.max(8, size * 0.018)}
            fontFamily="'Inter', system-ui, sans-serif"
            fontWeight={300}
            opacity={0.8}
          >
            {cusp.scale}
          </text>

          {/* Ticks around the ring */}
          {Array.from({ length: Math.min(cusp.width, 24) }).map((_, tickIdx) => {
            const angle = (tickIdx / Math.min(cusp.width, 24)) * Math.PI * 2;
            const innerR = cusp.r - 4;
            const outerR = cusp.r + 4;
            return (
              <line
                key={tickIdx}
                x1={cx + Math.cos(angle) * innerR}
                y1={cy + Math.sin(angle) * innerR}
                x2={cx + Math.cos(angle) * outerR}
                y2={cy + Math.sin(angle) * outerR}
                stroke={cusp.color}
                strokeWidth={0.5}
                opacity={0.3}
              />
            );
          })}
        </g>
      ))}

      {/* Center point */}
      <circle
        cx={cx}
        cy={cy}
        r={3}
        fill="#46e0d2"
        opacity={0.8}
      />

      {/* D(143) label at center */}
      <text
        x={cx}
        y={cy + 1}
        fill="#46e0d2"
        fontSize={Math.max(7, size * 0.016)}
        fontFamily="'JetBrains Mono', monospace"
        fontWeight={700}
        textAnchor="middle"
        dominantBaseline="middle"
        opacity={0.6}
      >
        D(143)
      </text>
    </svg>
  );
});

export default CuspDiagram;
