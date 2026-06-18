import React from 'react';

const MODES = {
  flight:  { color: '#46e0d2', label: 'FLIGHT' },
  starmap: { color: '#9b59ff', label: 'STARMAP' },
  jump:    { color: '#ffffff', label: 'HYPERJUMP' },
};

/**
 * ModePill — the rounded mode indicator from the top nav. A dot + the mode
 * name in mono, colored by mode (flight teal, starmap violet, jump white).
 */
export function ModePill({ mode = 'flight', style }) {
  const m = MODES[mode] || MODES.flight;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
        fontWeight: 700,
        color: m.color,
        background: 'rgba(6,12,18,0.72)',
        border: `1px solid ${m.color}30`,
        borderRadius: 20,
        padding: '6px 16px',
        backdropFilter: 'blur(4px)',
        ...style,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.color, display: 'inline-block' }} />
      {m.label}
    </span>
  );
}
