// ============================================================
// FlightControls — on-screen pause + speed + planet scale
// Dual speed modes:
//   Cruise:  0.001 c — 0.200 c  (realistic solar system transit)
//   Flight:  0.250 c — 0.990 c  (full relativistic)
// Planet size slider: 1x — 50x (only in Sol system)
// ============================================================

import { useAppState } from './Layout';

const SPEED_CONFIG = {
  cruise: { min: 0.001, max: 0.2, step: 0.001, label: 'cruise' },
  flight: { min: 0.25, max: 0.99, step: 0.01, label: 'flight' },
};

export function FlightControls() {
  const {
    beta, setBeta,
    isPaused, setPaused,
    speedMode, setSpeedMode,
    currentStar,
    planetScale, setPlanetScale,
  } = useAppState();

  const isSol = currentStar?.name === 'Sol';
  const cfg = SPEED_CONFIG[speedMode];

  // Clamp beta when switching modes
  const handleModeSwitch = (mode: 'cruise' | 'flight') => {
    setSpeedMode(mode);
    const newCfg = SPEED_CONFIG[mode];
    const clamped = Math.max(newCfg.min, Math.min(newCfg.max, beta));
    setBeta(clamped);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '74px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        maxWidth: 'calc(100vw - 24px)',
      }}
    >
      {/* Speed mode toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(6,12,18,0.72)',
          border: '1px solid rgba(70,224,210,0.18)',
          borderRadius: '6px',
          padding: '4px 6px',
          backdropFilter: 'blur(4px)',
          fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        }}
      >
        <SpeedModeBtn
          label="CRUISE"
          active={speedMode === 'cruise'}
          onClick={() => handleModeSwitch('cruise')}
          color="#46e0d2"
        />
        <div style={{ width: '1px', height: '16px', background: 'rgba(70,224,210,0.18)' }} />
        <SpeedModeBtn
          label="FLIGHT"
          active={speedMode === 'flight'}
          onClick={() => handleModeSwitch('flight')}
          color="#ffb648"
        />
      </div>

      {/* Main controls row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(6,12,18,0.72)',
          border: '1px solid rgba(70,224,210,0.18)',
          borderRadius: '6px',
          padding: '8px 12px',
          backdropFilter: 'blur(4px)',
          fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        }}
      >
        {/* Play/Pause */}
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

        {/* Speed slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <label
            style={{
              fontSize: '9.5px',
              letterSpacing: '0.12em',
              color: '#5f7e7d',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            {cfg.label}
          </label>
          <input
            className="speed-slider"
            type="range"
            min={cfg.min}
            max={cfg.max}
            step={cfg.step}
            value={beta}
            onChange={(e) => setBeta(parseFloat(e.target.value))}
            aria-label={`Flight speed ${cfg.label} mode`}
            style={{ width: '160px' }}
          />
          <span
            style={{
              fontSize: '12px',
              color: speedMode === 'cruise' ? '#46e0d2' : '#ffb648',
              minWidth: '68px',
              textAlign: 'right',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {beta < 0.01 ? beta.toFixed(3) : beta.toFixed(2)} c
          </span>
        </div>
      </div>

      {/* Planet scale slider (Sol system only) */}
      {isSol && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '9px',
            background: 'rgba(6,12,18,0.72)',
            border: '1px solid rgba(70,224,210,0.18)',
            borderRadius: '6px',
            padding: '6px 12px',
            backdropFilter: 'blur(4px)',
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
          }}
        >
          <label
            style={{
              fontSize: '9.5px',
              letterSpacing: '0.12em',
              color: '#5f7e7d',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            planets
          </label>
          <input
            type="range"
            min={1}
            max={50}
            step={1}
            value={planetScale}
            onChange={(e) => setPlanetScale(parseInt(e.target.value))}
            aria-label="Planet visual scale"
            style={{ width: '120px' }}
          />
          <span
            style={{
              fontSize: '11px',
              color: '#46e0d2',
              minWidth: '36px',
              textAlign: 'right',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {planetScale}x
          </span>
        </div>
      )}
    </div>
  );
}

function SpeedModeBtn({
  label,
  active,
  onClick,
  color,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        appearance: 'none',
        border: 'none',
        background: active ? `${color}18` : 'transparent',
        color: active ? color : '#5f7e7d',
        fontFamily: 'inherit',
        fontSize: '10px',
        fontWeight: 500,
        letterSpacing: '0.1em',
        textTransform: 'uppercase' as const,
        padding: '5px 12px',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {label}
    </button>
  );
}
