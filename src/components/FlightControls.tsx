// ============================================================
// FlightControls — on-screen pause + speed + planet scale
// Dual speed modes:
//   Cruise:  0.001 c — 0.200 c  (realistic solar system transit)
//   Flight:  0.250 c — 0.990 c  (full relativistic)
// Planet size slider: 1x — 50x (only in Sol system)
// ============================================================

import { useState } from 'react';
import { useAppState } from './Layout';
import type { ShipColor } from './Layout';
import { MIN_TIME_COMPRESSION, MAX_TIME_COMPRESSION } from '../lib/physics';

const SPEED_CONFIG = {
  cruise: { min: 0.001, max: 0.2, step: 0.001, label: 'cruise' },
  flight: { min: 0.25, max: 0.99, step: 0.01, label: 'flight' },
};

const h2 = (n: number) => ('0' + Math.max(0, Math.min(255, n | 0)).toString(16)).slice(-2);
const rgb2hex = (c: ShipColor) => '#' + h2(c[0]) + h2(c[1]) + h2(c[2]);
const hex2rgb = (h: string): ShipColor => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];

const SOL_PLANETS = ['Sun', 'Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
const SOL_DWARFS = ['Ceres', 'Pluto', 'Haumea', 'Makemake', 'Eris', 'Sedna'];

export function FlightControls() {
  const {
    beta, setBeta,
    isPaused, setPaused,
    speedMode, setSpeedMode,
    currentStar,
    planetScale, setPlanetScale,
    timeScale, setTimeScale,
    setHypojumpTarget,
    setOrientPending,
    viewMode, setViewMode,
    shipHull, setShipHull,
    shipAccent, setShipAccent,
  } = useAppState();

  const isSol = currentStar?.name === 'Sol';
  const cfg = SPEED_CONFIG[speedMode];

  // Planets panel (scale slider + body chips) collapses by default so the
  // bottom HUD stays out of the way; the current scale shows in the header.
  const [planetsOpen, setPlanetsOpen] = useState(false);

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

      {/* Time compression — physical speed stays below c; this only fast-forwards the clock */}
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
          title="Simulated seconds per real second. The ship never exceeds light speed; higher values just fast-forward the journey clock."
        >
          time&nbsp;comp
        </label>
        <input
          type="range"
          min={MIN_TIME_COMPRESSION}
          max={MAX_TIME_COMPRESSION}
          step={1}
          value={timeScale}
          onChange={(e) => setTimeScale(parseInt(e.target.value))}
          aria-label="Time compression (simulated seconds per real second)"
          style={{ width: '130px' }}
        />
        <span
          style={{
            fontSize: '11px',
            color: '#9fd0cb',
            minWidth: '60px',
            textAlign: 'right',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {timeScale <= 1 ? '1:1 light' : '\u00d7' + timeScale}
        </span>
      </div>

      {/* View mode + ship paint (own ship shows in third-person) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(6,12,18,0.72)',
          border: '1px solid rgba(70,224,210,0.18)',
          borderRadius: '6px',
          padding: '6px 12px',
          backdropFilter: 'blur(4px)',
          fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        }}
      >
        <label
          style={{ fontSize: '9.5px', letterSpacing: '0.12em', color: '#5f7e7d', textTransform: 'uppercase', whiteSpace: 'nowrap' }}
          title="Toggle first / third-person camera (V)"
        >
          view
        </label>
        <button
          onClick={() => setViewMode(viewMode === 'third' ? 'first' : 'third')}
          aria-label="Toggle camera view"
          style={{
            fontFamily: 'inherit',
            fontSize: '10px',
            letterSpacing: '0.08em',
            color: viewMode === 'third' ? '#ffb648' : '#46e0d2',
            background: viewMode === 'third' ? 'rgba(255,182,72,0.12)' : 'rgba(70,224,210,0.12)',
            border: `1px solid ${viewMode === 'third' ? 'rgba(255,182,72,0.5)' : 'rgba(70,224,210,0.4)'}`,
            borderRadius: '4px',
            padding: '5px 10px',
            cursor: 'pointer',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          {viewMode === 'third' ? '3rd \u00b7 ship' : '1st \u00b7 cockpit'}
        </button>
        <div style={{ width: '1px', height: '18px', background: 'rgba(70,224,210,0.18)' }} />
        <label style={{ fontSize: '9.5px', letterSpacing: '0.12em', color: '#5f7e7d', textTransform: 'uppercase' }}>
          paint
        </label>
        <ColorSwatch title="Hull color" value={rgb2hex(shipHull)} onChange={(h) => setShipHull(hex2rgb(h))} />
        <ColorSwatch title="Accent — wings / fin" value={rgb2hex(shipAccent)} onChange={(h) => setShipAccent(hex2rgb(h))} />
      </div>

      {/* Planets panel — scale slider + hypojump chips, collapsible to keep the
          bottom HUD from blocking the view. Collapsed by default. */}
      {isSol && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setPlanetsOpen((o) => !o)}
            aria-expanded={planetsOpen}
            aria-label={planetsOpen ? 'Collapse planets panel' : 'Expand planets panel'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(6,12,18,0.72)',
              border: '1px solid rgba(70,224,210,0.18)',
              borderRadius: '6px',
              padding: '6px 12px',
              backdropFilter: 'blur(4px)',
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: '9.5px', letterSpacing: '0.12em', color: '#5f7e7d', textTransform: 'uppercase' }}>
              planets
            </span>
            <span style={{ fontSize: '11px', color: '#46e0d2', fontVariantNumeric: 'tabular-nums' }}>{planetScale}x</span>
            <span
              aria-hidden
              style={{
                fontSize: '10px',
                color: '#5f7e7d',
                transform: planetsOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s var(--ease-ui, ease)',
              }}
            >
              &#9662;
            </span>
          </button>

          {planetsOpen && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(6,12,18,0.72)',
                border: '1px solid rgba(70,224,210,0.18)',
                borderRadius: '6px',
                padding: '9px 12px',
                backdropFilter: 'blur(4px)',
                fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                maxWidth: 'calc(100vw - 24px)',
              }}
            >
              {/* size slider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <label style={{ fontSize: '9.5px', letterSpacing: '0.12em', color: '#5f7e7d', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  size
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
                <span style={{ fontSize: '11px', color: '#46e0d2', minWidth: '36px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  {planetScale}x
                </span>
              </div>

              {/* hypojump targets — planets, then dwarf planets */}
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '5px', maxWidth: '440px' }}>
                {SOL_PLANETS.map((b) => (
                  <BodyChip key={b} name={b} onClick={() => setHypojumpTarget(b)} />
                ))}
                {SOL_DWARFS.map((b) => (
                  <BodyChip key={b} name={b} dwarf onClick={() => setHypojumpTarget(b)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Orientation: snap "up" to ecliptic north (Sol only) */}
      {isSol && (
        <button
          onClick={() => setOrientPending(true)}
          title="Snap 'up' to ecliptic north so planetary axial tilts read true"
          style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: '10px',
            letterSpacing: '0.06em',
            color: '#cfe8e4',
            background: 'rgba(6,12,18,0.72)',
            border: '1px solid rgba(70,224,210,0.3)',
            borderRadius: '5px',
            padding: '5px 13px',
            cursor: 'pointer',
            backdropFilter: 'blur(4px)',
          }}
        >
          ⊥ NORTH UP
        </button>
      )}
    </div>
  );
}

function BodyChip({ name, dwarf, onClick }: { name: string; dwarf?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={`Hypojump to ${name}${dwarf ? ' (dwarf planet)' : ''}`}
      style={{
        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        fontSize: '10px',
        letterSpacing: '0.04em',
        color: dwarf ? '#a9a2c8' : '#9fd0cb',
        background: 'rgba(6,12,18,0.72)',
        border: `1px solid ${dwarf ? 'rgba(155,140,210,0.30)' : 'rgba(70,224,210,0.22)'}`,
        borderRadius: '5px',
        padding: '4px 9px',
        cursor: 'pointer',
        backdropFilter: 'blur(4px)',
      }}
    >
      {name}
    </button>
  );
}

function ColorSwatch({
  value,
  onChange,
  title,
}: {
  value: string;
  onChange: (hex: string) => void;
  title: string;
}) {
  return (
    <label
      title={title}
      style={{
        width: '26px',
        height: '24px',
        borderRadius: '5px',
        border: '1px solid rgba(70,224,210,0.3)',
        background: value,
        cursor: 'pointer',
        display: 'inline-block',
        position: 'relative',
        overflow: 'hidden',
        flex: 'none',
      }}
    >
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={title}
        style={{ opacity: 0, width: '200%', height: '200%', position: 'absolute', left: '-50%', top: '-50%', cursor: 'pointer', border: 'none' }}
      />
    </label>
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
