// ============================================================
// Chronometer — Standard Galactic Time vs. ship proper time.
// The twin paradox as a live HUD panel. Accumulates across the
// whole journey (flights + jumps), so the drift grows over time.
// ============================================================

import { fmtClock, fmtDrift } from '../lib/clock';

const CYAN = '#46e0d2';   // galactic / standard
const VIOLET = '#b86bff'; // the ship's own clock + its lag
const INK_DIM = '#5f7e7d';

interface ChronoData {
  universe: number;
  ship: number;
  gamma: number;
  flying: boolean;
}

export function Chronometer({ data, onReset }: { data: ChronoData; onReset: () => void }) {
  const drift = data.universe - data.ship;
  const frac = data.universe > 0 ? Math.max(0, Math.min(1, data.ship / data.universe)) : 1;
  const dilPct = (100 / data.gamma).toFixed(0);

  return (
    <div
      style={{
        position: 'fixed',
        top: '60px',
        right: '20px',
        zIndex: 20,
        background: 'rgba(6,12,18,0.72)',
        border: '1px solid rgba(70,224,210,0.18)',
        borderRadius: '4px',
        padding: '12px 14px',
        backdropFilter: 'blur(4px)',
        fontFamily: '"JetBrains Mono", monospace',
        letterSpacing: '0.04em',
        minWidth: '236px',
      }}
    >
      <div style={{ fontSize: '9px', letterSpacing: '0.14em', color: INK_DIM, marginBottom: '9px' }}>
        RELATIVISTIC CHRONOMETER<span style={{ opacity: 0.6 }}> · this journey</span>
      </div>

      {/* the two clocks */}
      <Row label="Standard galactic" value={fmtClock(data.universe)} color={CYAN} />
      <Row label="Ship chronometer" value={fmtClock(data.ship)} color={VIOLET} />

      {/* twin meter: how much of galactic time the ship has experienced */}
      <div style={{ margin: '9px 0 7px', position: 'relative', height: '6px', borderRadius: '3px', background: 'rgba(70,224,210,0.14)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, width: '100%', background: 'rgba(70,224,210,0.28)' }} />
        <div style={{ position: 'absolute', insetBlock: 0, left: 0, width: `${frac * 100}%`, background: VIOLET, transition: 'width 0.15s linear' }} />
      </div>

      <div style={{ borderTop: '1px solid rgba(70,224,210,0.18)', marginTop: '7px', paddingTop: '7px' }}>
        <Row label="Ship aged less by" value={fmtDrift(drift)} color={VIOLET} />
        <Row
          label="Time dilation"
          value={data.flying ? `\u03b3 ${data.gamma.toFixed(2)} \u00b7 ship ${dilPct}%` : 'at rest \u00b7 clocks synced'}
          color={data.flying ? VIOLET : INK_DIM}
        />
      </div>

      <button
        onClick={onReset}
        style={{
          marginTop: '9px',
          width: '100%',
          appearance: 'none',
          border: '1px solid rgba(70,224,210,0.18)',
          background: 'transparent',
          color: INK_DIM,
          fontFamily: 'inherit',
          fontSize: '9.5px',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          padding: '6px',
          borderRadius: '3px',
          cursor: 'pointer',
        }}
      >
        &#8635; Reset journey clock
      </button>
    </div>
  );
}

function Row({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '18px', fontSize: '11px', lineHeight: 1.65 }}>
      <span style={{ color: INK_DIM, textTransform: 'uppercase', fontSize: '9.5px', letterSpacing: '0.1em' }}>{label}</span>
      <span style={{ color, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  );
}
