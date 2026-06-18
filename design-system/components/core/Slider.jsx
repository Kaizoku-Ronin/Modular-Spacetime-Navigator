import React, { useEffect } from 'react';

/**
 * Slider — the touch-friendly HUD range input. Teal gradient track that reads
 * as a fill gauge, glowing round thumb, optional mono label + tabular value.
 * Tone recolors the track/thumb (teal cruise, amber flight).
 */
const STYLE_ID = 'msn-slider-styles';
const CSS = `
.msn-slider { -webkit-appearance:none; appearance:none; height:4px; border-radius:3px; outline:none; cursor:pointer; }
.msn-slider::-webkit-slider-thumb { -webkit-appearance:none; width:20px; height:20px; border-radius:50%; background:#cfe7e6; cursor:pointer; }
.msn-slider::-moz-range-thumb { width:20px; height:20px; border-radius:50%; background:#cfe7e6; cursor:pointer; border:none; }
.msn-slider.teal { background:linear-gradient(90deg,#1d6b66,#46e0d2); }
.msn-slider.teal::-webkit-slider-thumb { border:2px solid #46e0d2; box-shadow:0 0 6px rgba(70,224,210,0.6); }
.msn-slider.teal::-moz-range-thumb { border:2px solid #46e0d2; box-shadow:0 0 6px rgba(70,224,210,0.6); }
.msn-slider.warn { background:linear-gradient(90deg,#7a5410,#ffb648); }
.msn-slider.warn::-webkit-slider-thumb { border:2px solid #ffb648; box-shadow:0 0 6px rgba(255,182,72,0.6); }
.msn-slider.warn::-moz-range-thumb { border:2px solid #ffb648; box-shadow:0 0 6px rgba(255,182,72,0.6); }
`;

export function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  tone = 'teal',
  displayValue,
  width = 160,
  style,
}) {
  useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = CSS;
    document.head.appendChild(el);
  }, []);

  const accent = tone === 'warn' ? '#ffb648' : '#46e0d2';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontFamily: "'JetBrains Mono', monospace", ...style }}>
      {label && (
        <label style={{ fontSize: 9.5, letterSpacing: '0.12em', color: '#5f7e7d', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          {label}
        </label>
      )}
      <input
        className={`msn-slider ${tone}`}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange && onChange(parseFloat(e.target.value))}
        style={{ width }}
      />
      {displayValue != null && (
        <span style={{ fontSize: 12, color: accent, minWidth: 60, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
          {displayValue}
        </span>
      )}
    </div>
  );
}
