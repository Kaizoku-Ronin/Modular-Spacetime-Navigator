/* @ds-bundle: {"format":3,"namespace":"MSNDesignSystem_6270fe","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"DataRow","sourcePath":"components/core/DataRow.jsx"},{"name":"HudPanel","sourcePath":"components/core/HudPanel.jsx"},{"name":"ModePill","sourcePath":"components/core/ModePill.jsx"},{"name":"Slider","sourcePath":"components/core/Slider.jsx"},{"name":"SpectralBadge","sourcePath":"components/core/SpectralBadge.jsx"},{"name":"StatusLine","sourcePath":"components/core/StatusLine.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"c792652ec193","components/core/Button.jsx":"9c3ff4b5f681","components/core/DataRow.jsx":"5980821157d3","components/core/HudPanel.jsx":"ce0260d20183","components/core/ModePill.jsx":"da19ce900a88","components/core/Slider.jsx":"58bd3012aa89","components/core/SpectralBadge.jsx":"bfb44ed33f82","components/core/StatusLine.jsx":"1ad5549b94ef","ui_kits/simulator/SimApp.jsx":"e0fdd279f5d5","ui_kits/simulator/starfield.js":"8f5016412489"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.MSNDesignSystem_6270fe = window.MSNDesignSystem_6270fe || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
const TONES = {
  teal: '#46e0d2',
  warn: '#ffb648',
  violet: '#9b59ff',
  alert: '#ff4466',
  dim: '#5f7e7d'
};

/**
 * Badge — a small mono uppercase tag. Tinted fill + accent text, optionally a
 * thin outline. Used for spectral types, lane classes, mode tags, counts.
 */
function Badge({
  children,
  tone = 'teal',
  outline = true,
  pill = false,
  style
}) {
  const c = TONES[tone] || TONES.teal;
  return /*#__PURE__*/React.createElement("span", {
    style: {
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
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState
} = React;
/**
 * MSN Button — the cockpit action control.
 * Tinted glass fill + accent hairline + accent label. Tone carries meaning:
 * teal = safe/confirm, warn = flight/caution, violet = jump, alert = destructive.
 * No drop shadows; the `pulse` variant adds the violet hyperjump halo.
 */
const TONES = {
  teal: {
    c: '#46e0d2',
    fill: 'rgba(70,224,210,0.12)',
    fillHover: 'rgba(70,224,210,0.22)',
    border: 'rgba(70,224,210,0.40)'
  },
  warn: {
    c: '#ffb648',
    fill: 'rgba(255,182,72,0.12)',
    fillHover: 'rgba(255,182,72,0.22)',
    border: 'rgba(255,182,72,0.50)'
  },
  violet: {
    c: '#9b59ff',
    fill: 'rgba(155,89,255,0.15)',
    fillHover: 'rgba(155,89,255,0.28)',
    border: 'rgba(155,89,255,0.40)'
  },
  alert: {
    c: '#ff4466',
    fill: 'rgba(255,68,102,0.12)',
    fillHover: 'rgba(255,68,102,0.22)',
    border: 'rgba(255,68,102,0.45)'
  }
};
const SIZES = {
  sm: {
    padding: '6px 12px',
    fontSize: 10
  },
  md: {
    padding: '10px 16px',
    fontSize: 12
  },
  lg: {
    padding: '12px 22px',
    fontSize: 13
  }
};
function Button({
  children,
  tone = 'teal',
  variant = 'solid',
  // 'solid' | 'ghost'
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
    color: isGhost ? hover && !disabled ? t.c : '#5f7e7d' : t.c,
    background: isGhost ? hover && !disabled ? 'rgba(70,224,210,0.06)' : 'transparent' : hover && !disabled ? t.fillHover : t.fill,
    border: isGhost ? '1px solid transparent' : `1px solid ${t.border}`,
    animation: pulse && !disabled ? 'msn-pulse-glow 1.5s infinite' : undefined,
    ...style
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    style: base,
    disabled: disabled,
    onClick: disabled ? undefined : onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false)
  }, rest), icon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      fontSize: '1.1em',
      lineHeight: 1
    }
  }, icon), children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/DataRow.jsx
try { (() => {
/**
 * DataRow — one telemetry line: an uppercase mono label on the left, a
 * tabular-numeral value on the right. The atom of every HUD readout.
 */
function DataRow({
  label,
  value,
  valueColor = '#46e0d2',
  divider = true,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 18,
      padding: '4px 0',
      borderBottom: divider ? '1px solid rgba(70,224,210,0.06)' : 'none',
      fontFamily: "'JetBrains Mono', monospace",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#5f7e7d',
      textTransform: 'uppercase',
      fontSize: 9.5,
      letterSpacing: '0.12em'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      color: valueColor,
      fontSize: 12,
      fontVariantNumeric: 'tabular-nums'
    }
  }, value));
}
Object.assign(__ds_scope, { DataRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/DataRow.jsx", error: String((e && e.message) || e) }); }

// components/core/HudPanel.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * HudPanel — the signature instrument-glass surface.
 * Translucent dark fill, a single teal hairline, 4px backdrop blur, 4px radius.
 * Optional header with a pulsing system dot, a title, and a tag pill (e.g. CRUISE).
 */
function HudPanel({
  title,
  dot = false,
  dotColor = '#46e0d2',
  tag,
  tagTone = 'teal',
  children,
  blur = 'hud',
  // 'hud' (4px) | 'dock' (12px) | 'panel' (16px)
  style,
  ...rest
}) {
  const blurPx = {
    hud: 4,
    dock: 12,
    panel: 16
  }[blur] ?? 4;
  const tagColors = {
    teal: {
      c: '#46e0d2',
      bg: 'rgba(70,224,210,0.12)',
      bd: 'rgba(70,224,210,0.3)'
    },
    warn: {
      c: '#ffb648',
      bg: 'rgba(255,182,72,0.12)',
      bd: 'rgba(255,182,72,0.3)'
    },
    violet: {
      c: '#9b59ff',
      bg: 'rgba(155,89,255,0.12)',
      bd: 'rgba(155,89,255,0.4)'
    }
  }[tagTone] || {};
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      background: 'rgba(6,12,18,0.72)',
      border: '1px solid rgba(70,224,210,0.18)',
      borderRadius: 4,
      padding: '14px 16px',
      backdropFilter: `blur(${blurPx}px)`,
      WebkitBackdropFilter: `blur(${blurPx}px)`,
      fontFamily: "'JetBrains Mono', monospace",
      ...style
    }
  }, rest), (title || dot || tag) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 10,
      paddingBottom: 8,
      borderBottom: '1px solid rgba(70,224,210,0.12)'
    }
  }, dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      flexShrink: 0,
      background: dotColor,
      animation: 'msn-pulse 2s ease-in-out infinite'
    }
  }), title && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'Space Grotesk', system-ui, sans-serif",
      fontSize: 13,
      fontWeight: 500,
      color: dotColor,
      letterSpacing: '0.04em',
      textTransform: 'uppercase'
    }
  }, title), tag && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      fontSize: 8,
      fontWeight: 600,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: tagColors.c,
      background: tagColors.bg,
      border: `1px solid ${tagColors.bd}`,
      borderRadius: 3,
      padding: '2px 6px'
    }
  }, tag)), children);
}
Object.assign(__ds_scope, { HudPanel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/HudPanel.jsx", error: String((e && e.message) || e) }); }

// components/core/ModePill.jsx
try { (() => {
const MODES = {
  flight: {
    color: '#46e0d2',
    label: 'FLIGHT'
  },
  starmap: {
    color: '#9b59ff',
    label: 'STARMAP'
  },
  jump: {
    color: '#ffffff',
    label: 'HYPERJUMP'
  }
};

/**
 * ModePill — the rounded mode indicator from the top nav. A dot + the mode
 * name in mono, colored by mode (flight teal, starmap violet, jump white).
 */
function ModePill({
  mode = 'flight',
  style
}) {
  const m = MODES[mode] || MODES.flight;
  return /*#__PURE__*/React.createElement("span", {
    style: {
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
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: m.color,
      display: 'inline-block'
    }
  }), m.label);
}
Object.assign(__ds_scope, { ModePill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/ModePill.jsx", error: String((e && e.message) || e) }); }

// components/core/Slider.jsx
try { (() => {
const {
  useEffect
} = React;
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
function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  tone = 'teal',
  displayValue,
  width = 160,
  style
}) {
  useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = CSS;
    document.head.appendChild(el);
  }, []);
  const accent = tone === 'warn' ? '#ffb648' : '#46e0d2';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      fontFamily: "'JetBrains Mono', monospace",
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 9.5,
      letterSpacing: '0.12em',
      color: '#5f7e7d',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap'
    }
  }, label), /*#__PURE__*/React.createElement("input", {
    className: `msn-slider ${tone}`,
    type: "range",
    min: min,
    max: max,
    step: step,
    value: value,
    onChange: e => onChange && onChange(parseFloat(e.target.value)),
    style: {
      width
    }
  }), displayValue != null && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: accent,
      minWidth: 60,
      textAlign: 'right',
      fontVariantNumeric: 'tabular-nums'
    }
  }, displayValue));
}
Object.assign(__ds_scope, { Slider });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Slider.jsx", error: String((e && e.message) || e) }); }

// components/core/SpectralBadge.jsx
try { (() => {
/** Spectral type → canonical color (lib/colors.ts spectralColor). */
function spectralHex(type) {
  const s = (type || '').charAt(0).toUpperCase();
  switch (s) {
    case 'O':
    case 'B':
      return '#5a7cff';
    case 'A':
      return '#8aa4ff';
    case 'F':
      return '#fff5e0';
    case 'G':
      return '#ffe88a';
    case 'K':
      return '#ffaa44';
    case 'M':
      return '#ff6622';
    case 'L':
    case 'T':
    case 'Y':
      return '#441100';
    case 'D':
      return '#c0d8ff';
    default:
      return '#8aa4ff';
  }
}

/**
 * SpectralBadge — a star's spectral classification as a colored pill.
 * Color is derived from the leading class letter (O/B blue … M red, D white dwarf).
 */
function SpectralBadge({
  type = 'G2V',
  style
}) {
  const c = spectralHex(type);
  // brown-dwarf class is too dark for text; lift it.
  const textC = c === '#441100' ? '#b08a78' : c;
  return /*#__PURE__*/React.createElement("span", {
    style: {
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
      ...style
    }
  }, type);
}
Object.assign(__ds_scope, { SpectralBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/SpectralBadge.jsx", error: String((e && e.message) || e) }); }

// components/core/StatusLine.jsx
try { (() => {
const STATUS = {
  cruising: {
    dot: '#46e0d2',
    glow: '0 0 7px #46e0d2',
    text: '#cfe7e6',
    label: 'Cruising — far from the horizon'
  },
  paused: {
    dot: '#46e0d2',
    glow: '0 0 7px #46e0d2',
    text: '#cfe7e6',
    label: 'Paused — you can look around safely'
  },
  'near-horizon': {
    dot: '#ffb648',
    glow: '0 0 8px #ffb648',
    text: '#ffb648',
    label: 'Near horizon — shield holding'
  }
};

/**
 * StatusLine — a glowing status dot + reassuring message, in the cockpit's
 * second-person voice. Three canonical states; override `text` for custom copy.
 */
function StatusLine({
  status = 'cruising',
  text,
  style
}) {
  const s = STATUS[status] || STATUS.cruising;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 10,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: '50%',
      flexShrink: 0,
      background: s.dot,
      boxShadow: s.glow,
      transition: 'background 0.2s, box-shadow 0.2s'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: s.text,
      transition: 'color 0.2s'
    }
  }, text || s.label));
}
Object.assign(__ds_scope, { StatusLine });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/StatusLine.jsx", error: String((e && e.message) || e) }); }

// ui_kits/simulator/SimApp.jsx
try { (() => {
// Simulator UI kit — interactive overlay HUD over a starfield.
// Composes the design-system primitives from window.MSNDesignSystem_6270fe.
// Two modes: FLIGHT (telemetry + chronometer + speed controls) and STARMAP
// (clickable 3D-ish star nodes + slide-in info panel + hyperjump).

const NS = window.MSNDesignSystem_6270fe;
const {
  Button,
  HudPanel,
  DataRow,
  Badge,
  ModePill,
  StatusLine,
  SpectralBadge,
  Slider
} = NS;

// ── Curated real nearby stars (HYG lineage), projected to 2D for the map ──
const STARS = [{
  name: 'Sol',
  type: 'G2V',
  ly: 0.0,
  x: 0,
  y: 0,
  mass: 1.000,
  notes: 'Home system. Real planets, live ephemeris.'
}, {
  name: 'Proxima Centauri',
  type: 'M5.5V',
  ly: 4.24,
  x: -120,
  y: 60,
  mass: 0.122,
  notes: 'Closest star. Hosts Proxima b.'
}, {
  name: 'Alpha Centauri A',
  type: 'G2V',
  ly: 4.37,
  x: -140,
  y: 78,
  mass: 1.100,
  notes: 'Sun-like primary of the αCen triple.'
}, {
  name: 'Alpha Centauri B',
  type: 'K1V',
  ly: 4.37,
  x: -128,
  y: 92,
  mass: 0.907,
  notes: 'Orange companion to αCen A.'
}, {
  name: "Barnard's Star",
  type: 'M4V',
  ly: 5.96,
  x: 150,
  y: -40,
  mass: 0.144,
  notes: 'Highest known proper motion.'
}, {
  name: 'Wolf 359',
  type: 'M6V',
  ly: 7.86,
  x: 96,
  y: 150,
  mass: 0.090,
  notes: 'Faint, flaring red dwarf.'
}, {
  name: 'Lalande 21185',
  type: 'M2V',
  ly: 8.31,
  x: -60,
  y: -160,
  mass: 0.390,
  notes: 'Bright nearby red dwarf.'
}, {
  name: 'Sirius A',
  type: 'A1V',
  ly: 8.60,
  x: 200,
  y: 70,
  mass: 2.063,
  notes: 'Brightest star in the night sky.'
}, {
  name: 'Sirius B',
  type: 'DA2',
  ly: 8.60,
  x: 214,
  y: 84,
  mass: 1.018,
  notes: 'White-dwarf companion to Sirius A.'
}, {
  name: 'Ross 154',
  type: 'M3.5V',
  ly: 9.69,
  x: 40,
  y: -200,
  mass: 0.170,
  notes: 'Flare star in Sagittarius.'
}, {
  name: 'Epsilon Eridani',
  type: 'K2V',
  ly: 10.48,
  x: 244,
  y: -120,
  mass: 0.820,
  notes: 'Young K-dwarf with a debris disk.'
}, {
  name: 'Procyon A',
  type: 'F5V',
  ly: 11.46,
  x: 270,
  y: 30,
  mass: 1.499,
  notes: 'Bright F-type primary.'
}, {
  name: 'Tau Ceti',
  type: 'G8V',
  ly: 11.91,
  x: -250,
  y: -90,
  mass: 0.783,
  notes: 'Sun-like, multiple candidate planets.'
}, {
  name: '61 Cygni A',
  type: 'K5V',
  ly: 11.40,
  x: -210,
  y: 170,
  mass: 0.700,
  notes: 'First star with a measured parallax.'
}];
const LANES = [['Sol', 'Proxima Centauri', 'planck'], ['Sol', 'Alpha Centauri A', 'planck'], ['Alpha Centauri A', 'Alpha Centauri B', 'planck'], ['Proxima Centauri', 'Alpha Centauri A', 'planck'], ['Sol', "Barnard's Star", 'stellar'], ['Sol', 'Lalande 21185', 'stellar'], ['Sol', 'Wolf 359', 'stellar'], ["Barnard's Star", 'Ross 154', 'stellar'], ['Sol', 'Sirius A', 'galactic'], ['Sirius A', 'Sirius B', 'planck'], ['Sol', 'Tau Ceti', 'galactic'], ['Sol', 'Procyon A', 'galactic'], ['Procyon A', 'Epsilon Eridani', 'stellar'], ['Sol', '61 Cygni A', 'galactic']];
const CUSP = {
  planck: '#ff5f9e',
  stellar: '#b86bff',
  galactic: '#4db6e8'
};
function specHex(t) {
  const s = (t || '')[0];
  return {
    O: '#5a7cff',
    B: '#5a7cff',
    A: '#8aa4ff',
    F: '#fff5e0',
    G: '#ffe88a',
    K: '#ffaa44',
    M: '#ff6622',
    D: '#c0d8ff'
  }[s] || '#cfe7e6';
}
const pad = n => String(n).padStart(2, '0');
function fmtClock(s) {
  s = Math.floor(s);
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
}

// ── Chronometer panel (twin-paradox clock) ──
function Chronometer({
  universe,
  ship,
  gamma,
  flying,
  onReset
}) {
  const drift = universe - ship;
  const frac = universe > 0 ? Math.max(0, Math.min(1, ship / universe)) : 1;
  const VIOLET = '#b86bff';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      top: 60,
      right: 20,
      zIndex: 20,
      minWidth: 236,
      background: 'rgba(6,12,18,0.72)',
      border: '1px solid rgba(70,224,210,0.18)',
      borderRadius: 4,
      padding: '12px 14px',
      backdropFilter: 'blur(4px)',
      fontFamily: "'JetBrains Mono', monospace",
      letterSpacing: '0.04em'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      letterSpacing: '0.14em',
      color: '#5f7e7d',
      marginBottom: 9
    }
  }, "RELATIVISTIC CHRONOMETER", /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: .6
    }
  }, " \xB7 this journey")), /*#__PURE__*/React.createElement(DataRow, {
    label: "Standard galactic",
    value: fmtClock(universe),
    divider: false
  }), /*#__PURE__*/React.createElement(DataRow, {
    label: "Ship chronometer",
    value: fmtClock(ship),
    valueColor: VIOLET,
    divider: false
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '9px 0 7px',
      height: 6,
      borderRadius: 3,
      background: 'rgba(70,224,210,0.14)',
      overflow: 'hidden',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      insetBlock: 0,
      left: 0,
      width: `${frac * 100}%`,
      background: VIOLET,
      transition: 'width .15s linear'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid rgba(70,224,210,0.18)',
      paddingTop: 7
    }
  }, /*#__PURE__*/React.createElement(DataRow, {
    label: "Ship aged less by",
    value: `${drift.toFixed(1)} s`,
    valueColor: VIOLET,
    divider: false
  }), /*#__PURE__*/React.createElement(DataRow, {
    label: "Time dilation",
    value: flying ? `γ ${gamma.toFixed(2)} · ship ${(100 / gamma).toFixed(0)}%` : 'at rest · synced',
    valueColor: flying ? VIOLET : '#5f7e7d',
    divider: false
  })), /*#__PURE__*/React.createElement("button", {
    onClick: onReset,
    style: {
      marginTop: 9,
      width: '100%',
      border: '1px solid rgba(70,224,210,0.18)',
      background: 'transparent',
      color: '#5f7e7d',
      fontFamily: 'inherit',
      fontSize: 9.5,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      padding: 6,
      borderRadius: 3,
      cursor: 'pointer'
    }
  }, "\u21BB Reset journey clock"));
}

// ── Top nav ──
function Nav({
  mode,
  onSettings
}) {
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'linear-gradient(to bottom, rgba(3,5,10,0.8), transparent)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Space Grotesk', system-ui, sans-serif",
      fontSize: 13,
      fontWeight: 500,
      color: '#5f7e7d',
      letterSpacing: '0.1em',
      textTransform: 'uppercase'
    }
  }, "Modular Spacetime Navigator"), /*#__PURE__*/React.createElement(ModePill, {
    mode: mode
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      color: '#5f7e7d',
      fontSize: 18
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      cursor: 'pointer'
    },
    title: "Lore"
  }, "\u24D8"), /*#__PURE__*/React.createElement("span", {
    style: {
      cursor: 'pointer'
    },
    title: "Fullscreen"
  }, "\u2922"), /*#__PURE__*/React.createElement("span", {
    onClick: onSettings,
    style: {
      cursor: 'pointer'
    },
    title: "Settings \xB7 paint"
  }, "\u2699")));
}

// ── Mode switch dock ──
function ModeDock({
  mode,
  setMode,
  canJump,
  onJump
}) {
  const btn = (active, color) => ({
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    padding: '8px 14px',
    borderRadius: 8,
    border: active ? `1px solid ${color}30` : '1px solid transparent',
    background: active ? `${color}15` : 'transparent',
    color: active ? color : '#5f7e7d',
    cursor: 'pointer',
    transition: 'all .25s cubic-bezier(0.22,1,0.36,1)'
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 40,
      display: 'flex',
      gap: 8,
      background: 'rgba(6,12,18,0.72)',
      border: '1px solid rgba(70,224,210,0.18)',
      borderRadius: 12,
      padding: '8px 12px',
      backdropFilter: 'blur(12px)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: btn(mode === 'flight', '#46e0d2'),
    onClick: () => setMode('flight')
  }, "Flight"), /*#__PURE__*/React.createElement("button", {
    style: btn(mode === 'starmap', '#9b59ff'),
    onClick: () => setMode('starmap')
  }, "Starmap"), /*#__PURE__*/React.createElement("button", {
    style: {
      ...btn(false, '#9b59ff'),
      opacity: canJump ? 1 : 0.3,
      cursor: canJump ? 'pointer' : 'not-allowed'
    },
    disabled: !canJump,
    onClick: onJump
  }, "Jump"));
}
const SPEED = {
  cruise: {
    min: 0.001,
    max: 0.2,
    step: 0.001
  },
  flight: {
    min: 0.25,
    max: 0.99,
    step: 0.01
  }
};
const glass = {
  background: 'rgba(6,12,18,0.72)',
  border: '1px solid rgba(70,224,210,0.18)',
  backdropFilter: 'blur(8px)',
  fontFamily: "'JetBrains Mono', monospace"
};

// ── Top-center cluster: CRUISE/FLIGHT speed-mode toggle + NORTH UP ──
function TopCluster({
  speedMode,
  setSpeedMode,
  beta,
  setBeta,
  isSol,
  onNorthUp,
  planetsOpen,
  onPlanets
}) {
  const modeBtn = (active, color, label, onClick) => /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      border: 'none',
      background: active ? `${color}18` : 'transparent',
      color: active ? color : '#5f7e7d',
      fontFamily: 'inherit',
      fontSize: 10,
      fontWeight: 500,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      padding: '6px 14px',
      borderRadius: 4,
      cursor: 'pointer'
    }
  }, label);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      top: 54,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 40,
      display: 'flex',
      gap: 8,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...glass,
      display: 'flex',
      gap: 4,
      alignItems: 'center',
      borderRadius: 6,
      padding: '4px 6px'
    }
  }, modeBtn(speedMode === 'cruise', '#46e0d2', 'Cruise', () => {
    setSpeedMode('cruise');
    setBeta(Math.min(0.2, Math.max(0.001, beta)));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      height: 16,
      background: 'rgba(70,224,210,0.18)'
    }
  }), modeBtn(speedMode === 'flight', '#ffb648', 'Flight', () => {
    setSpeedMode('flight');
    setBeta(Math.min(0.99, Math.max(0.25, beta)));
  })), isSol && /*#__PURE__*/React.createElement("button", {
    onClick: onNorthUp,
    title: "Snap 'up' to ecliptic north",
    style: {
      ...glass,
      fontSize: 10,
      letterSpacing: '0.06em',
      color: '#cfe8e4',
      border: '1px solid rgba(70,224,210,0.3)',
      borderRadius: 6,
      padding: '7px 13px',
      cursor: 'pointer'
    }
  }, "\u22A5 North up"), isSol && /*#__PURE__*/React.createElement("button", {
    onClick: onPlanets,
    title: "Hypojump targets",
    style: {
      ...glass,
      fontSize: 10,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      cursor: 'pointer',
      borderRadius: 6,
      padding: '7px 13px',
      color: planetsOpen ? '#46e0d2' : '#cfe8e4',
      border: `1px solid ${planetsOpen ? 'rgba(70,224,210,0.5)' : 'rgba(70,224,210,0.18)'}`,
      background: planetsOpen ? 'rgba(70,224,210,0.1)' : 'rgba(6,12,18,0.72)'
    }
  }, "\u25CE Planets"));
}

// ── Hypojump target list — grouped Star / Planets / Dwarf planets ──
const BODIES = [{
  g: 'Star',
  name: 'Sol',
  au: 0,
  c: '#f3efe6'
}, {
  g: 'Planets',
  name: 'Mercury',
  au: 0.4,
  c: '#9c958c'
}, {
  g: 'Planets',
  name: 'Venus',
  au: 0.7,
  c: '#e3b95e'
}, {
  g: 'Planets',
  name: 'Earth',
  au: 1.0,
  c: '#4d9fe0'
}, {
  g: 'Planets',
  name: 'Mars',
  au: 1.4,
  c: '#e0573a'
}, {
  g: 'Planets',
  name: 'Jupiter',
  au: 5.3,
  c: '#d6a06a'
}, {
  g: 'Planets',
  name: 'Saturn',
  au: 9.5,
  c: '#e8c66a'
}, {
  g: 'Planets',
  name: 'Uranus',
  au: 19,
  c: '#8fd4d8'
}, {
  g: 'Planets',
  name: 'Neptune',
  au: 30,
  c: '#4a6cf0'
}, {
  g: 'Dwarf planets',
  name: 'Ceres',
  au: 2.5,
  c: '#b3a89a'
}, {
  g: 'Dwarf planets',
  name: 'Pluto',
  au: 36,
  c: '#c9a98a'
}, {
  g: 'Dwarf planets',
  name: 'Haumea',
  au: 50,
  c: '#a8aab0'
}, {
  g: 'Dwarf planets',
  name: 'Makemake',
  au: 53,
  c: '#c5825c'
}, {
  g: 'Dwarf planets',
  name: 'Eris',
  au: 95,
  c: '#dadce4'
}, {
  g: 'Dwarf planets',
  name: 'Sedna',
  au: 81,
  c: '#c0504a'
}];
function PlanetMenu({
  open,
  target,
  onPick,
  onClose
}) {
  if (!open) return null;
  let lastG = null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      left: 20,
      top: 60,
      bottom: 20,
      width: 248,
      zIndex: 46,
      background: 'rgba(6,12,18,0.92)',
      border: '1px solid rgba(70,224,210,0.18)',
      borderRadius: 8,
      backdropFilter: 'blur(16px)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 14px 10px',
      borderBottom: '1px solid rgba(70,224,210,0.12)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'Space Grotesk', system-ui, sans-serif",
      fontSize: 12,
      fontWeight: 500,
      color: '#46e0d2',
      letterSpacing: '0.06em',
      textTransform: 'uppercase'
    }
  }, "Hypojump \xB7 Sol"), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: 'none',
      border: 'none',
      color: '#5f7e7d',
      cursor: 'pointer',
      fontSize: 15
    }
  }, "\xD7")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      overflowX: 'hidden',
      padding: '6px 0 10px'
    }
  }, BODIES.map(b => {
    const head = b.g !== lastG ? lastG = b.g : null;
    const sel = b.name === target;
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: b.name
    }, head && /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 9,
        letterSpacing: '0.16em',
        color: '#5f7e7d',
        textTransform: 'uppercase',
        padding: '12px 16px 6px'
      }
    }, b.g), /*#__PURE__*/React.createElement("button", {
      onClick: () => onPick(b.name),
      style: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '8px 18px 8px 16px',
        cursor: 'pointer',
        textAlign: 'left',
        border: 'none',
        boxSizing: 'border-box',
        borderLeft: sel ? '2px solid #46e0d2' : '2px solid transparent',
        background: sel ? 'rgba(70,224,210,0.10)' : 'transparent',
        transition: 'background 0.15s'
      },
      onMouseEnter: e => {
        if (!sel) e.currentTarget.style.background = 'rgba(70,224,210,0.04)';
      },
      onMouseLeave: e => {
        if (!sel) e.currentTarget.style.background = 'transparent';
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 11,
        height: 11,
        borderRadius: '50%',
        flexShrink: 0,
        background: b.c,
        boxShadow: `0 0 6px ${b.c}66`
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        fontFamily: "'Space Grotesk', system-ui, sans-serif",
        fontSize: 14,
        fontWeight: 500,
        color: sel ? '#46e0d2' : '#cfe7e6'
      }
    }, b.name), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 12,
        color: '#5f7e7d',
        fontVariantNumeric: 'tabular-nums'
      }
    }, b.au)));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 16px',
      borderTop: '1px solid rgba(70,224,210,0.12)',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 9,
      letterSpacing: '0.06em',
      color: '#5f7e7d',
      textTransform: 'uppercase'
    }
  }, "AU from Sun"));
}

// ── Left rail: vertical TIME COMP slider (lives at the foot of the left column) ──
function TimeCompRail({
  timeScale,
  setTimeScale
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      ...glass,
      borderRadius: 8,
      padding: '10px 10px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 7,
      alignSelf: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 8.5,
      letterSpacing: '0.1em',
      color: '#5f7e7d',
      textTransform: 'uppercase'
    }
  }, "T\xB7comp"), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: 1,
    max: 500,
    step: 1,
    value: timeScale,
    onChange: e => setTimeScale(parseInt(e.target.value)),
    className: "msn-slider teal",
    "aria-label": "Time compression",
    style: {
      writingMode: 'vertical-lr',
      direction: 'rtl',
      height: 96,
      width: 4
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: '#9fd0cb',
      fontVariantNumeric: 'tabular-nums'
    }
  }, timeScale <= 1 ? '1:1' : '×' + timeScale));
}

// ── Right rail: 1st / 3rd person VIEW toggle ──
function ViewToggle({
  view,
  setView
}) {
  const third = view === 'third';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      right: 20,
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 40,
      ...glass,
      borderRadius: 8,
      padding: '10px 12px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      letterSpacing: '0.12em',
      color: '#5f7e7d',
      textTransform: 'uppercase'
    }
  }, "View"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setView(third ? 'first' : 'third'),
    "aria-label": "Toggle camera view",
    style: {
      fontFamily: 'inherit',
      fontSize: 10,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      cursor: 'pointer',
      color: third ? '#ffb648' : '#46e0d2',
      background: third ? 'rgba(255,182,72,0.12)' : 'rgba(70,224,210,0.12)',
      border: `1px solid ${third ? 'rgba(255,182,72,0.5)' : 'rgba(70,224,210,0.4)'}`,
      borderRadius: 6,
      padding: '8px 10px',
      width: 78,
      lineHeight: 1.4
    }
  }, third ? '3rd · ship' : '1st · cockpit'));
}

// ── Bottom: play/pause + speed slider (sits just above the mode dock) ──
function SpeedDock({
  beta,
  setBeta,
  speedMode,
  paused,
  setPaused
}) {
  const cfg = SPEED[speedMode];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      bottom: 78,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 40,
      ...glass,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      borderRadius: 6,
      padding: '8px 12px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setPaused(!paused),
    "aria-label": paused ? 'Play' : 'Pause',
    style: {
      width: 46,
      height: 40,
      border: `1.5px solid ${paused ? '#46e0d2' : '#ffb648'}`,
      background: paused ? 'rgba(70,224,210,0.12)' : 'rgba(255,182,72,0.12)',
      color: paused ? '#46e0d2' : '#ffb648',
      borderRadius: 4,
      fontSize: 15,
      cursor: 'pointer'
    }
  }, paused ? '▶' : '⏸'), /*#__PURE__*/React.createElement(Slider, {
    label: speedMode,
    min: cfg.min,
    max: cfg.max,
    step: cfg.step,
    value: beta,
    onChange: setBeta,
    tone: speedMode === 'cruise' ? 'teal' : 'warn',
    displayValue: `${beta < 0.01 ? beta.toFixed(3) : beta.toFixed(2)} c`
  }));
}

// ── Settings / paint bay (gear in nav opens this; embeds the color customizer) ──
function SettingsPanel({
  open,
  onClose
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      top: 80,
      bottom: 20,
      right: 0,
      width: 380,
      zIndex: 45,
      background: 'rgba(6,12,18,0.92)',
      borderLeft: '1px solid rgba(70,224,210,0.18)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 18px',
      borderBottom: '1px solid rgba(70,224,210,0.12)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'Space Grotesk', system-ui, sans-serif",
      fontSize: 13,
      fontWeight: 500,
      color: '#46e0d2',
      letterSpacing: '0.06em',
      textTransform: 'uppercase'
    }
  }, "\u2699 Paint & boost bay"), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: 'none',
      border: 'none',
      color: '#5f7e7d',
      cursor: 'pointer',
      fontSize: 16
    }
  }, "\xD7")), /*#__PURE__*/React.createElement("iframe", {
    src: "paint-bay.html",
    title: "Paint bay",
    style: {
      flex: 1,
      width: '100%',
      border: 'none',
      background: '#070b11'
    }
  }));
}

// ── Starmap (SVG nodes + lanes) ──
function Starmap({
  selected,
  setSelected
}) {
  const byName = Object.fromEntries(STARS.map(s => [s.name, s]));
  const VB = 640,
    cx = VB / 2,
    cy = VB / 2;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: `0 0 ${VB} ${VB}`,
    style: {
      width: 'min(86vh,86vw)',
      height: 'min(86vh,86vw)'
    }
  }, LANES.map(([a, b, c], i) => {
    const A = byName[a],
      B = byName[b];
    return /*#__PURE__*/React.createElement("line", {
      key: i,
      x1: cx + A.x,
      y1: cy + A.y,
      x2: cx + B.x,
      y2: cy + B.y,
      stroke: CUSP[c],
      strokeWidth: 1,
      opacity: 0.32
    });
  }), STARS.map(s => {
    const sel = selected === s.name;
    const col = specHex(s.type);
    return /*#__PURE__*/React.createElement("g", {
      key: s.name,
      style: {
        cursor: 'pointer'
      },
      onClick: () => setSelected(s.name)
    }, sel && /*#__PURE__*/React.createElement("circle", {
      cx: cx + s.x,
      cy: cy + s.y,
      r: 14,
      fill: "none",
      stroke: "#9b59ff",
      strokeWidth: 1.5,
      opacity: 0.8
    }), /*#__PURE__*/React.createElement("circle", {
      cx: cx + s.x,
      cy: cy + s.y,
      r: s.name === 'Sol' ? 6 : 4,
      fill: col,
      style: {
        filter: `drop-shadow(0 0 6px ${col})`
      }
    }), /*#__PURE__*/React.createElement("text", {
      x: cx + s.x + 10,
      y: cy + s.y + 4,
      fill: sel ? '#cfe7e6' : '#5f7e7d',
      fontSize: 11,
      fontFamily: "'JetBrains Mono', monospace"
    }, s.name));
  })));
}

// ── Star info side panel ──
function StarPanel({
  star,
  onClose,
  onJump
}) {
  if (!star) return null;
  const col = specHex(star.type);
  const lanes = LANES.filter(([a, b]) => a === star.name || b === star.name).map(([a, b, c]) => ({
    to: a === star.name ? b : a,
    c
  }));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      top: 80,
      bottom: 80,
      right: 0,
      width: 320,
      zIndex: 30,
      background: 'rgba(6,12,18,0.82)',
      borderLeft: '1px solid rgba(70,224,210,0.18)',
      backdropFilter: 'blur(16px)',
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      animation: 'msn-slide-in-right .4s cubic-bezier(0.22,1,0.36,1)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      position: 'absolute',
      top: 12,
      right: 12,
      background: 'none',
      border: 'none',
      color: '#5f7e7d',
      cursor: 'pointer',
      fontSize: 16
    }
  }, "\xD7"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "'Space Grotesk', system-ui, sans-serif",
      fontSize: 20,
      fontWeight: 700,
      color: '#cfe7e6',
      margin: '0 0 8px'
    }
  }, star.name), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'center',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(SpectralBadge, {
    type: star.type
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 12,
      color: '#5f7e7d'
    }
  }, star.ly.toFixed(2), " ly")), /*#__PURE__*/React.createElement(DataRow, {
    label: "Mass",
    value: `${star.mass.toFixed(3)} M☉`
  }), /*#__PURE__*/React.createElement(DataRow, {
    label: "Class",
    value: star.type
  }), /*#__PURE__*/React.createElement(DataRow, {
    label: "Distance",
    value: `${star.ly.toFixed(2)} ly`,
    divider: false
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'Inter, sans-serif',
      fontSize: 12,
      fontStyle: 'italic',
      color: '#5f7e7d',
      lineHeight: 1.5,
      margin: '14px 0'
    }
  }, star.notes), lanes.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 10,
      color: '#5f7e7d',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      marginBottom: 8,
      paddingBottom: 6,
      borderBottom: '1px solid rgba(70,224,210,0.1)'
    }
  }, "Connected lanes"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto'
    }
  }, lanes.map((l, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '6px 4px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: CUSP[l.c]
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 12,
      color: '#cfe7e6'
    }
  }, l.to))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginTop: 'auto'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    tone: "teal",
    style: {
      flex: 1
    }
  }, "Align"), /*#__PURE__*/React.createElement(Button, {
    tone: "violet",
    pulse: true,
    style: {
      flex: 1
    },
    onClick: onJump
  }, "Hyperjump")));
}

// ── Hyperjump flash overlay ──
function JumpOverlay({
  to
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle, rgba(170,221,255,0.9), rgba(26,51,170,0.6) 40%, #03050a 80%)',
      animation: 'msn-fade-in .25s ease'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      fontFamily: "'JetBrains Mono', monospace"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      letterSpacing: '0.3em',
      color: '#03050a',
      fontWeight: 700
    }
  }, "HYPERJUMP"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Space Grotesk', sans-serif",
      fontSize: 28,
      fontWeight: 700,
      color: '#03050a',
      marginTop: 8
    }
  }, to)));
}
function App() {
  const [mode, setMode] = React.useState('flight');
  const [speedMode, setSpeedMode] = React.useState('cruise');
  const [beta, setBeta] = React.useState(0.2);
  const [paused, setPaused] = React.useState(false);
  const [timeScale, setTimeScale] = React.useState(120);
  const [view, setView] = React.useState('first');
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [planetsOpen, setPlanetsOpen] = React.useState(false);
  const [hypoTarget, setHypoTarget] = React.useState('Earth');
  const [selected, setSelected] = React.useState(null);
  const [jumpTo, setJumpTo] = React.useState(null);
  const [clock, setClock] = React.useState({
    universe: 74,
    ship: 72
  });
  const canvasRef = React.useRef(null);
  const stateRef = React.useRef({});
  const gamma = 1 / Math.sqrt(1 - Math.min(beta, 0.9999) ** 2);
  const flying = mode === 'flight' && !paused && beta > 0.001;
  stateRef.current = {
    beta,
    paused,
    mode
  };
  React.useEffect(() => {
    if (!canvasRef.current) return;
    return window.MSNStarfield.mount(canvasRef.current, () => stateRef.current);
  }, []);

  // journey clock
  React.useEffect(() => {
    const id = setInterval(() => {
      if (mode === 'flight' && !paused) {
        setClock(c => ({
          universe: c.universe + 0.1,
          ship: c.ship + 0.1 / gamma
        }));
      }
    }, 100);
    return () => clearInterval(id);
  }, [mode, paused, gamma]);
  const doJump = () => {
    const target = selected || 'Proxima Centauri';
    setJumpTo(target);
    setTimeout(() => {
      setJumpTo(null);
      setMode('flight');
      setSelected(null);
      setClock(c => ({
        universe: c.universe + 6,
        ship: c.ship + 6 / gamma
      }));
    }, 1100);
  };
  const status = paused ? 'paused' : beta > 0.6 ? 'near-horizon' : 'cruising';
  const sel = STARS.find(s => s.name === selected);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      overflow: 'hidden',
      background: '#03050a'
    }
  }, /*#__PURE__*/React.createElement("canvas", {
    ref: canvasRef,
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%'
    }
  }), mode === 'starmap' && /*#__PURE__*/React.createElement(Starmap, {
    selected: selected,
    setSelected: setSelected
  }), /*#__PURE__*/React.createElement(Nav, {
    mode: jumpTo ? 'jump' : mode,
    onSettings: () => setSettingsOpen(o => !o)
  }), mode === 'flight' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      top: 60,
      left: 20,
      bottom: 96,
      zIndex: 20,
      width: 222,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: 16,
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      pointerEvents: 'auto'
    }
  }, /*#__PURE__*/React.createElement(HudPanel, {
    title: (speedMode === 'flight' ? 'PROXIMA' : 'SOL') + ' SYSTEM',
    dot: true,
    tag: speedMode === 'cruise' ? 'CRUISE' : 'FLIGHT',
    tagTone: speedMode === 'cruise' ? 'teal' : 'warn'
  }, /*#__PURE__*/React.createElement(DataRow, {
    label: "Distance",
    value: `${(0.605 / (beta + 0.05)).toFixed(3)} AU`
  }), /*#__PURE__*/React.createElement(DataRow, {
    label: "Velocity",
    value: `${beta.toFixed(3)} c`
  }), /*#__PURE__*/React.createElement(DataRow, {
    label: "Time comp",
    value: `×${timeScale}`,
    valueColor: "#9fd0cb"
  }), /*#__PURE__*/React.createElement(DataRow, {
    label: "Lorentz \u03B3",
    value: gamma.toFixed(3)
  }), /*#__PURE__*/React.createElement(DataRow, {
    label: "Aboard",
    value: fmtClock(clock.ship)
  }), /*#__PURE__*/React.createElement(DataRow, {
    label: "Outside",
    value: fmtClock(clock.universe),
    divider: false
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      paddingTop: 8,
      borderTop: '1px solid rgba(70,224,210,0.12)'
    }
  }, /*#__PURE__*/React.createElement(StatusLine, {
    status: status
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      pointerEvents: 'auto'
    }
  }, /*#__PURE__*/React.createElement(TimeCompRail, {
    timeScale: timeScale,
    setTimeScale: setTimeScale
  }))), /*#__PURE__*/React.createElement(Chronometer, {
    universe: clock.universe,
    ship: clock.ship,
    gamma: gamma,
    flying: flying,
    onReset: () => setClock({
      universe: 0,
      ship: 0
    })
  }), /*#__PURE__*/React.createElement(TopCluster, {
    speedMode: speedMode,
    setSpeedMode: setSpeedMode,
    beta: beta,
    setBeta: setBeta,
    isSol: speedMode === 'cruise',
    onNorthUp: () => {},
    planetsOpen: planetsOpen,
    onPlanets: () => setPlanetsOpen(o => !o)
  }), /*#__PURE__*/React.createElement(ViewToggle, {
    view: view,
    setView: setView
  }), /*#__PURE__*/React.createElement(SpeedDock, {
    beta: beta,
    setBeta: setBeta,
    speedMode: speedMode,
    paused: paused,
    setPaused: setPaused
  }), /*#__PURE__*/React.createElement(PlanetMenu, {
    open: planetsOpen,
    target: hypoTarget,
    onPick: n => {
      setHypoTarget(n);
      setPlanetsOpen(false);
    },
    onClose: () => setPlanetsOpen(false)
  })), mode === 'starmap' && /*#__PURE__*/React.createElement(StarPanel, {
    star: sel,
    onClose: () => setSelected(null),
    onJump: doJump
  }), /*#__PURE__*/React.createElement(ModeDock, {
    mode: mode,
    setMode: m => {
      setMode(m);
      if (m === 'flight') setSelected(null);
    },
    canJump: mode === 'starmap' && !!selected,
    onJump: doJump
  }), /*#__PURE__*/React.createElement(SettingsPanel, {
    open: settingsOpen,
    onClose: () => setSettingsOpen(false)
  }), jumpTo && /*#__PURE__*/React.createElement(JumpOverlay, {
    to: jumpTo
  }));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/simulator/SimApp.jsx", error: String((e && e.message) || e) }); }

// ui_kits/simulator/starfield.js
try { (() => {
// Lightweight starfield for the simulator backdrop. Plain canvas, no deps.
// Draws a parallax star field with a faint center reticle + horizon glow.
// Cruise = slow drift; flight = streaking. Call MSNStarfield.mount(canvas).
(function () {
  function mount(canvas, getState) {
    const ctx = canvas.getContext('2d');
    let raf,
      w,
      h,
      stars = [];
    const N = 320;
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function seed() {
      stars = Array.from({
        length: N
      }, () => ({
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1,
        z: Math.random() * 0.9 + 0.1,
        c: pick()
      }));
    }
    function pick() {
      const r = Math.random();
      if (r > 0.92) return '#8aa4ff';
      if (r > 0.84) return '#ffe88a';
      if (r > 0.78) return '#ffaa44';
      return '#cfe7e6';
    }
    function frame() {
      const st = getState && getState() || {};
      const beta = st.beta || 0.05;
      const paused = st.paused;
      const flight = st.mode === 'flight';
      ctx.clearRect(0, 0, w, h);
      // void wash + faint horizon glow
      ctx.fillStyle = '#03050a';
      ctx.fillRect(0, 0, w, h);
      const cx = w / 2,
        cy = h / 2;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.6);
      g.addColorStop(0, flight ? 'rgba(70,224,210,0.05)' : 'rgba(18,40,60,0.18)');
      g.addColorStop(1, 'rgba(3,5,10,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      const speed = paused ? 0 : beta * (flight ? 0.05 : 0.006);
      for (const s of stars) {
        // perspective from center
        const px = cx + s.x / s.z * cx;
        const py = cy + s.y / s.z * cy;
        const r = (1.4 - s.z) * 1.6 + 0.3;
        // streak length grows with speed + proximity
        const len = speed * 1400 * (1.2 - s.z);
        const ang = Math.atan2(py - cy, px - cx);
        const ex = px - Math.cos(ang) * len;
        const ey = py - Math.sin(ang) * len;
        ctx.globalAlpha = Math.min(1, 1.1 - s.z);
        if (len > 1.5) {
          ctx.strokeStyle = s.c;
          ctx.lineWidth = r;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(ex, ey);
          ctx.stroke();
        } else {
          ctx.fillStyle = s.c;
          ctx.beginPath();
          ctx.arc(px, py, r, 0, 7);
          ctx.fill();
        }
        // advance toward viewer
        if (!paused) {
          s.z -= speed;
          if (s.z <= 0.08) {
            s.z = 1.0;
            s.x = Math.random() * 2 - 1;
            s.y = Math.random() * 2 - 1;
          }
        }
      }
      ctx.globalAlpha = 1;
      // center reticle
      ctx.strokeStyle = 'rgba(70,224,210,0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy);
      ctx.lineTo(cx - 3, cy);
      ctx.moveTo(cx + 3, cy);
      ctx.lineTo(cx + 10, cy);
      ctx.moveTo(cx, cy - 10);
      ctx.lineTo(cx, cy - 3);
      ctx.moveTo(cx, cy + 3);
      ctx.lineTo(cx, cy + 10);
      ctx.stroke();
      raf = requestAnimationFrame(frame);
    }
    resize();
    seed();
    window.addEventListener('resize', resize);
    frame();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }
  window.MSNStarfield = {
    mount
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/simulator/starfield.js", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.DataRow = __ds_scope.DataRow;

__ds_ns.HudPanel = __ds_scope.HudPanel;

__ds_ns.ModePill = __ds_scope.ModePill;

__ds_ns.Slider = __ds_scope.Slider;

__ds_ns.SpectralBadge = __ds_scope.SpectralBadge;

__ds_ns.StatusLine = __ds_scope.StatusLine;

})();
