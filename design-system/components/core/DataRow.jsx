import React from 'react';

/**
 * DataRow — one telemetry line: an uppercase mono label on the left, a
 * tabular-numeral value on the right. The atom of every HUD readout.
 */
export function DataRow({ label, value, valueColor = '#46e0d2', divider = true, style }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 18,
        padding: '4px 0',
        borderBottom: divider ? '1px solid rgba(70,224,210,0.06)' : 'none',
        fontFamily: "'JetBrains Mono', monospace",
        ...style,
      }}
    >
      <span
        style={{
          color: '#5f7e7d',
          textTransform: 'uppercase',
          fontSize: 9.5,
          letterSpacing: '0.12em',
        }}
      >
        {label}
      </span>
      <span style={{ color: valueColor, fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </span>
    </div>
  );
}
