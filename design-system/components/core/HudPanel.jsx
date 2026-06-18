import React from 'react';

/**
 * HudPanel — the signature instrument-glass surface.
 * Translucent dark fill, a single teal hairline, 4px backdrop blur, 4px radius.
 * Optional header with a pulsing system dot, a title, and a tag pill (e.g. CRUISE).
 */
export function HudPanel({
  title,
  dot = false,
  dotColor = '#46e0d2',
  tag,
  tagTone = 'teal',
  children,
  blur = 'hud', // 'hud' (4px) | 'dock' (12px) | 'panel' (16px)
  style,
  ...rest
}) {
  const blurPx = { hud: 4, dock: 12, panel: 16 }[blur] ?? 4;
  const tagColors = {
    teal: { c: '#46e0d2', bg: 'rgba(70,224,210,0.12)', bd: 'rgba(70,224,210,0.3)' },
    warn: { c: '#ffb648', bg: 'rgba(255,182,72,0.12)', bd: 'rgba(255,182,72,0.3)' },
    violet: { c: '#9b59ff', bg: 'rgba(155,89,255,0.12)', bd: 'rgba(155,89,255,0.4)' },
  }[tagTone] || {};

  return (
    <div
      style={{
        background: 'rgba(6,12,18,0.72)',
        border: '1px solid rgba(70,224,210,0.18)',
        borderRadius: 4,
        padding: '14px 16px',
        backdropFilter: `blur(${blurPx}px)`,
        WebkitBackdropFilter: `blur(${blurPx}px)`,
        fontFamily: "'JetBrains Mono', monospace",
        ...style,
      }}
      {...rest}
    >
      {(title || dot || tag) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 10,
            paddingBottom: 8,
            borderBottom: '1px solid rgba(70,224,210,0.12)',
          }}
        >
          {dot && (
            <span
              style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: dotColor,
                animation: 'msn-pulse 2s ease-in-out infinite',
              }}
            />
          )}
          {title && (
            <span
              style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontSize: 13, fontWeight: 500, color: dotColor,
                letterSpacing: '0.04em', textTransform: 'uppercase',
              }}
            >
              {title}
            </span>
          )}
          {tag && (
            <span
              style={{
                marginLeft: 'auto',
                fontSize: 8, fontWeight: 600, letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: tagColors.c, background: tagColors.bg,
                border: `1px solid ${tagColors.bd}`,
                borderRadius: 3, padding: '2px 6px',
              }}
            >
              {tag}
            </span>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
