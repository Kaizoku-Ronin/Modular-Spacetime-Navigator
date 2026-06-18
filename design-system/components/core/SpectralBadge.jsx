import React from 'react';

/** Spectral type → canonical color (lib/colors.ts spectralColor). */
function spectralHex(type) {
  const s = (type || '').charAt(0).toUpperCase();
  switch (s) {
    case 'O': case 'B': return '#5a7cff';
    case 'A': return '#8aa4ff';
    case 'F': return '#fff5e0';
    case 'G': return '#ffe88a';
    case 'K': return '#ffaa44';
    case 'M': return '#ff6622';
    case 'L': case 'T': case 'Y': return '#441100';
    case 'D': return '#c0d8ff';
    default: return '#8aa4ff';
  }
}

/**
 * SpectralBadge — a star's spectral classification as a colored pill.
 * Color is derived from the leading class letter (O/B blue … M red, D white dwarf).
 */
export function SpectralBadge({ type = 'G2V', style }) {
  const c = spectralHex(type);
  // brown-dwarf class is too dark for text; lift it.
  const textC = c === '#441100' ? '#b08a78' : c;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.02em',
        color: textC,
        background: `${c}15`,
        border: `1px solid ${c}40`,
        borderRadius: 12,
        padding: '3px 10px',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {type}
    </span>
  );
}
