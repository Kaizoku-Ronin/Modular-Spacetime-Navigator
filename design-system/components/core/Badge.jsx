import React from 'react';

const TONES = {
  teal:   '#46e0d2',
  warn:   '#ffb648',
  violet: '#9b59ff',
  alert:  '#ff4466',
  dim:    '#5f7e7d',
};

/**
 * Badge — a small mono uppercase tag. Tinted fill + accent text, optionally a
 * thin outline. Used for spectral types, lane classes, mode tags, counts.
 */
export function Badge({ children, tone = 'teal', outline = true, pill = false, style }) {
  const c = TONES[tone] || TONES.teal;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: c,
        background: `${c}15`,
        border: outline ? `1px solid ${c}40` : '1px solid transparent',
        borderRadius: pill ? 12 : 4,
        padding: '3px 10px',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </span>
  );
}
