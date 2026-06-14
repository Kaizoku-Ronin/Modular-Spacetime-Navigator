// ============================================================
// FlightControls — on-screen pause + speed for touch devices
// (and desktop discoverability). Reads the same app state the
// keyboard/wheel handlers use, so everything stays in sync.
// ============================================================

import { useAppState } from './Layout';

export function FlightControls() {
  const { beta, setBeta, isPaused, setPaused } = useAppState();

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '74px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'rgba(6,12,18,0.72)',
        border: '1px solid rgba(70,224,210,0.18)',
        borderRadius: '6px',
        padding: '8px 12px',
        backdropFilter: 'blur(4px)',
        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        maxWidth: 'calc(100vw - 24px)',
      }}
    >
      <button
        onClick={() => setPaused(!isPaused)}
        aria-label={isPaused ? 'Play' : 'Pause'}
        style={{
          width: '46px',
          height: '40px',
          flex: 'none',
          appearance: 'none',
          border: `1.5px solid ${isPaused ? '#46e0d2' : '#ffb648'}`,
          background: isPaused ? 'rgba(70,224,210,0.12)' : 'rgba(255,182,72,0.12)',
          color: isPaused ? '#46e0d2' : '#ffb648',
          borderRadius: '4px',
          fontSize: '15px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isPaused ? '\u25B6' : '\u23F8'}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
        <label
          style={{
            fontSize: '9.5px',
            letterSpacing: '0.12em',
            color: '#5f7e7d',
            textTransform: 'uppercase',
          }}
        >
          Speed
        </label>
        <input
          className="speed-slider"
          type="range"
          min={0.01}
          max={0.99}
          step={0.01}
          value={beta}
          onChange={(e) => setBeta(parseFloat(e.target.value))}
          aria-label="Flight speed (fraction of c)"
        />
        <span
          style={{
            fontSize: '12px',
            color: '#46e0d2',
            minWidth: '52px',
            textAlign: 'right',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {beta.toFixed(2)} c
        </span>
      </div>
    </div>
  );
}
