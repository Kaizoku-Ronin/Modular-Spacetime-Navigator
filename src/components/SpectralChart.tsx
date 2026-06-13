// ============================================================
// SpectralChart — Horizontal bar chart of spectral type distribution
// Color-coded bars matching spectral star colors
// ============================================================

import { memo } from 'react';

interface SpectralBar {
  class: string;
  count: number;
  color: string;
}

const spectralData: SpectralBar[] = [
  { class: 'O/B', count: 0, color: '#5a7cff' },
  { class: 'A', count: 1, color: '#8aa4ff' },
  { class: 'F', count: 1, color: '#fff5e0' },
  { class: 'G', count: 4, color: '#ffe88a' },
  { class: 'K', count: 6, color: '#ffaa44' },
  { class: 'M', count: 39, color: '#ff6622' },
  { class: 'L/T/Y', count: 4, color: '#441100' },
  { class: 'WD', count: 5, color: '#c0d8ff' },
];

const maxCount = Math.max(...spectralData.map((d) => d.count));

interface SpectralChartProps {
  className?: string;
  animated?: boolean;
}

const SpectralChart = memo(function SpectralChart({ className = '', animated = true }: SpectralChartProps) {
  const barHeight = 28;
  const gap = 12;
  const labelWidth = 60;
  const chartWidth = 500;
  const chartHeight = spectralData.length * (barHeight + gap) + 20;

  return (
    <svg
      viewBox={`0 0 ${labelWidth + chartWidth + 40} ${chartHeight}`}
      className={className}
      style={{ width: '100%', maxWidth: 700 }}
    >
      {spectralData.map((item, i) => {
        const y = 10 + i * (barHeight + gap);
        const barWidth = item.count > 0 ? (item.count / maxCount) * chartWidth : 0;

        return (
          <g key={item.class}>
            {/* Label */}
            <text
              x={labelWidth - 10}
              y={y + barHeight / 2 + 1}
              fill={item.color}
              fontSize={12}
              fontFamily="'JetBrains Mono', monospace"
              fontWeight={700}
              textAnchor="end"
              dominantBaseline="middle"
            >
              {item.class}
            </text>

            {/* Bar background */}
            <rect
              x={labelWidth}
              y={y}
              width={chartWidth}
              height={barHeight}
              rx={4}
              fill="rgba(95, 126, 125, 0.06)"
            />

            {/* Bar */}
            <rect
              x={labelWidth}
              y={y}
              width={animated ? 0 : barWidth}
              height={barHeight}
              rx={4}
              fill={item.color}
              opacity={0.75}
              className={animated ? `spectral-bar spectral-bar-${i}` : ''}
              style={
                animated
                  ? {
                      animation: `spectralBarGrow 0.6s var(--ease-ui) ${0.08 * i}s forwards`,
                    }
                  : undefined
              }
            />

            {/* Count label */}
            <text
              x={labelWidth + barWidth + 8}
              y={y + barHeight / 2 + 1}
              fill="#cfe7e6"
              fontSize={11}
              fontFamily="'JetBrains Mono', monospace"
              fontWeight={400}
              dominantBaseline="middle"
            >
              {item.count}
            </text>
          </g>
        );
      })}
    </svg>
  );
});

export default SpectralChart;
