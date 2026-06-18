import React, { useState } from 'react';

/**
 * MSN Button — the cockpit action control.
 * Tinted glass fill + accent hairline + accent label. Tone carries meaning:
 * teal = safe/confirm, warn = flight/caution, violet = jump, alert = destructive.
 * No drop shadows; the `pulse` variant adds the violet hyperjump halo.
 */

const TONES = {
  teal:   { c: '#46e0d2', fill: 'rgba(70,224,210,0.12)',  fillHover: 'rgba(70,224,210,0.22)',  border: 'rgba(70,224,210,0.40)' },
  warn:   { c: '#ffb648', fill: 'rgba(255,182,72,0.12)',  fillHover: 'rgba(255,182,72,0.22)',  border: 'rgba(255,182,72,0.50)' },
  violet: { c: '#9b59ff', fill: 'rgba(155,89,255,0.15)',  fillHover: 'rgba(155,89,255,0.28)',  border: 'rgba(155,89,255,0.40)' },
  alert:  { c: '#ff4466', fill: 'rgba(255,68,102,0.12)',  fillHover: 'rgba(255,68,102,0.22)',  border: 'rgba(255,68,102,0.45)' },
};

const SIZES = {
  sm: { padding: '6px 12px', fontSize: 10 },
  md: { padding: '10px 16px', fontSize: 12 },
  lg: { padding: '12px 22px', fontSize: 13 },
};

export function Button({
  children,
  tone = 'teal',
  variant = 'solid', // 'solid' | 'ghost'
  size = 'md',
  icon,
  pulse = false,
  disabled = false,
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = useState(false);
  const t = TONES[tone] || TONES.teal;
  const s = SIZES[size] || SIZES.md;
  const isGhost = variant === 'ghost';

  const base = {
    appearance: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
    fontWeight: 500,
    fontSize: s.fontSize,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    padding: s.padding,
    borderRadius: 8,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    transition: 'background 0.2s, color 0.2s, border-color 0.2s',
    color: isGhost ? (hover && !disabled ? t.c : '#5f7e7d') : t.c,
    background: isGhost
      ? (hover && !disabled ? 'rgba(70,224,210,0.06)' : 'transparent')
      : (hover && !disabled ? t.fillHover : t.fill),
    border: isGhost
      ? '1px solid transparent'
      : `1px solid ${t.border}`,
    animation: pulse && !disabled ? 'msn-pulse-glow 1.5s infinite' : undefined,
    ...style,
  };

  return (
    <button
      type="button"
      style={base}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      {...rest}
    >
      {icon && <span style={{ display: 'inline-flex', fontSize: '1.1em', lineHeight: 1 }}>{icon}</span>}
      {children}
    </button>
  );
}
