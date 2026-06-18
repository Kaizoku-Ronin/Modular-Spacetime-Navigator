// ============================================================
// FlightControls — flight-mode controls, arranged around the
// screen edges to keep the view clear (the redesigned HUD):
//   top-center : CRUISE/FLIGHT speed-mode toggle · ⊥ NORTH UP · ◎ PLANETS
//   left rail  : vertical T·COMP (time-compression) slider
//   right rail : 1st / 3rd person VIEW toggle
//   bottom     : play/pause + speed slider (just above the mode dock)
//   left slide-out : grouped hypojump planet menu (Sol only)
// All wired to the real flight state; nothing here changes the renderer.
// ============================================================

import { useState } from 'react';
import type { CSSProperties } from 'react';
import { useAppState } from './Layout';
import { MIN_TIME_COMPRESSION, MAX_TIME_COMPRESSION } from '../lib/physics';

const SPEED_CONFIG = {
  cruise: { min: 0.001, max: 0.2, step: 0.001 },
  flight: { min: 0.25, max: 0.99, step: 0.01 },
};

const GLASS: CSSProperties = {
  background: 'rgba(6,12,18,0.72)',
  border: '1px solid rgba(70,224,210,0.18)',
  backdropFilter: 'blur(8px)',
  fontFamily: '"JetBrains Mono", monospace',
};

// Hypojump targets. `jump` is the name the engine expects ('Sol' → 'Sun');
// `au` is the body's rough heliocentric distance, shown as a static label.
interface Body { g: string; name: string; jump: string; au: string; c: string }
const BODIES: Body[] = [
  { g: 'Star', name: 'Sol', jump: 'Sun', au: '0', c: '#f3efe6' },
  { g: 'Planets', name: 'Mercury', jump: 'Mercury', au: '0.4', c: '#9c958c' },
  { g: 'Planets', name: 'Venus', jump: 'Venus', au: '0.7', c: '#e3b95e' },
  { g: 'Planets', name: 'Earth', jump: 'Earth', au: '1.0', c: '#4d9fe0' },
  { g: 'Planets', name: 'Mars', jump: 'Mars', au: '1.4', c: '#e0573a' },
  { g: 'Planets', name: 'Jupiter', jump: 'Jupiter', au: '5.3', c: '#d6a06a' },
  { g: 'Planets', name: 'Saturn', jump: 'Saturn', au: '9.5', c: '#e8c66a' },
  { g: 'Planets', name: 'Uranus', jump: 'Uranus', au: '19', c: '#8fd4d8' },
  { g: 'Planets', name: 'Neptune', jump: 'Neptune', au: '30', c: '#4a6cf0' },
  { g: 'Dwarf planets', name: 'Ceres', jump: 'Ceres', au: '2.5', c: '#b3a89a' },
  { g: 'Dwarf planets', name: 'Pluto', jump: 'Pluto', au: '36', c: '#c9a98a' },
  { g: 'Dwarf planets', name: 'Haumea', jump: 'Haumea', au: '50', c: '#a8aab0' },
  { g: 'Dwarf planets', name: 'Makemake', jump: 'Makemake', au: '53', c: '#c5825c' },
  { g: 'Dwarf planets', name: 'Eris', jump: 'Eris', au: '95', c: '#dadce4' },
  { g: 'Dwarf planets', name: 'Sedna', jump: 'Sedna', au: '81', c: '#c0504a' },
];
const GROUPS = ['Star', 'Planets', 'Dwarf planets'];

function ModeBtn({ active, color, label, onClick }: { active: boolean; color: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: 'none',
        background: active ? `${color}18` : 'transparent',
        color: active ? color : '#5f7e7d',
        fontFamily: 'inherit',
        fontSize: '10px',
        fontWeight: 500,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        padding: '6px 14px',
        borderRadius: '4px',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}

function PlanetMenu({
  selected,
  planetScale,
  setPlanetScale,
  onPick,
  onClose,
}: {
  selected: string | null;
  planetScale: number;
  setPlanetScale: (v: number) => void;
  onPick: (b: Body) => void;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: 'fixed',
        left: '20px',
        top: '60px',
        bottom: '20px',
        width: '248px',
        zIndex: 46,
        background: 'rgba(6,12,18,0.92)',
        border: '1px solid rgba(70,224,210,0.18)',
        borderRadius: '8px',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px 10px',
          borderBottom: '1px solid rgba(70,224,210,0.12)',
        }}
      >
        <span
          style={{
            fontFamily: '"Space Grotesk", system-ui, sans-serif',
            fontSize: '12px',
            fontWeight: 500,
            color: '#46e0d2',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          Hypojump · Sol
        </span>
        <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', color: '#5f7e7d', cursor: 'pointer', fontSize: '15px' }}>
          &times;
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '6px 0 10px' }}>
        {GROUPS.map((g) => (
          <div key={g}>
            <div
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '9px',
                letterSpacing: '0.16em',
                color: '#5f7e7d',
                textTransform: 'uppercase',
                padding: '12px 16px 6px',
              }}
            >
              {g}
            </div>
            {BODIES.filter((b) => b.g === g).map((b) => {
              const sel = b.name === selected;
              return (
                <button
                  key={b.name}
                  onClick={() => onPick(b)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 18px 8px 16px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    border: 'none',
                    boxSizing: 'border-box',
                    borderLeft: sel ? '2px solid #46e0d2' : '2px solid transparent',
                    background: sel ? 'rgba(70,224,210,0.10)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { if (!sel) e.currentTarget.style.background = 'rgba(70,224,210,0.04)'; }}
                  onMouseLeave={(e) => { if (!sel) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ width: '11px', height: '11px', borderRadius: '50%', flexShrink: 0, background: b.c, boxShadow: `0 0 6px ${b.c}66` }} />
                  <span style={{ flex: 1, fontFamily: '"Space Grotesk", system-ui, sans-serif', fontSize: '14px', fontWeight: 500, color: sel ? '#46e0d2' : '#cfe7e6' }}>
                    {b.name}
                  </span>
                  <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '12px', color: '#5f7e7d', fontVariantNumeric: 'tabular-nums' }}>
                    {b.au}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer: planet-size exaggeration (true scale → inflated) + units note */}
      <div style={{ borderTop: '1px solid rgba(70,224,210,0.12)', padding: '9px 16px 6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <label style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '9px', letterSpacing: '0.12em', color: '#5f7e7d', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            size
          </label>
          <input
            className="speed-slider"
            type="range"
            min={1}
            max={50}
            step={1}
            value={planetScale}
            onChange={(e) => setPlanetScale(parseInt(e.target.value))}
            aria-label="Planet visual scale"
            style={{ flex: 1, width: 'auto' }}
          />
          <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', color: '#46e0d2', minWidth: '30px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
            {planetScale}x
          </span>
        </div>
      </div>
      <div style={{ padding: '4px 16px 9px', fontFamily: '"JetBrains Mono", monospace', fontSize: '9px', letterSpacing: '0.06em', color: '#5f7e7d', textTransform: 'uppercase' }}>
        AU from Sun
      </div>
    </div>
  );
}

export function FlightControls() {
  const {
    beta, setBeta,
    isPaused, setPaused,
    speedMode, setSpeedMode,
    planetScale, setPlanetScale,
    timeScale, setTimeScale,
    setHypojumpTarget,
    setOrientPending,
    viewMode, setViewMode,
    currentStar,
  } = useAppState();

  const [planetsOpen, setPlanetsOpen] = useState(false);
  const [lastPick, setLastPick] = useState<string | null>(null);

  const isSol = currentStar?.name === 'Sol';
  const cfg = SPEED_CONFIG[speedMode];
  const third = viewMode === 'third';

  const switchMode = (m: 'cruise' | 'flight') => {
    setSpeedMode(m);
    const nc = SPEED_CONFIG[m];
    setBeta(Math.max(nc.min, Math.min(nc.max, beta)));
  };

  const pick = (b: Body) => {
    setLastPick(b.name);
    setHypojumpTarget(b.jump);
    setPlanetsOpen(false);
  };

  return (
    <>
      {/* ── Top-center: speed-mode toggle · NORTH UP · PLANETS ── */}
      <div style={{ position: 'fixed', top: '54px', left: '50%', transform: 'translateX(-50%)', zIndex: 40, display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{ ...GLASS, display: 'flex', gap: '4px', alignItems: 'center', borderRadius: '6px', padding: '4px 6px' }}>
          <ModeBtn active={speedMode === 'cruise'} color="#46e0d2" label="Cruise" onClick={() => switchMode('cruise')} />
          <div style={{ width: '1px', height: '16px', background: 'rgba(70,224,210,0.18)' }} />
          <ModeBtn active={speedMode === 'flight'} color="#ffb648" label="Flight" onClick={() => switchMode('flight')} />
        </div>
        {isSol && (
          <button
            onClick={() => setOrientPending(true)}
            title="Snap 'up' to ecliptic north so planetary axial tilts read true"
            style={{ ...GLASS, fontSize: '10px', letterSpacing: '0.06em', color: '#cfe8e4', border: '1px solid rgba(70,224,210,0.3)', borderRadius: '6px', padding: '7px 13px', cursor: 'pointer' }}
          >
            &perp; NORTH UP
          </button>
        )}
        {isSol && (
          <button
            onClick={() => setPlanetsOpen((o) => !o)}
            title="Hypojump targets"
            style={{
              ...GLASS,
              fontSize: '10px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              borderRadius: '6px',
              padding: '7px 13px',
              color: planetsOpen ? '#46e0d2' : '#cfe8e4',
              border: `1px solid ${planetsOpen ? 'rgba(70,224,210,0.5)' : 'rgba(70,224,210,0.18)'}`,
              background: planetsOpen ? 'rgba(70,224,210,0.1)' : 'rgba(6,12,18,0.72)',
            }}
          >
            &#9678; PLANETS
          </button>
        )}
      </div>

      {/* ── Left rail: vertical T·COMP ── */}
      <div style={{ position: 'fixed', left: '20px', bottom: '96px', zIndex: 40, ...GLASS, borderRadius: '8px', padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px' }}>
        <span style={{ fontSize: '8.5px', letterSpacing: '0.1em', color: '#5f7e7d', textTransform: 'uppercase' }}>T&middot;comp</span>
        <input
          className="tcomp-slider"
          type="range"
          min={MIN_TIME_COMPRESSION}
          max={MAX_TIME_COMPRESSION}
          step={1}
          value={timeScale}
          onChange={(e) => setTimeScale(parseInt(e.target.value))}
          aria-label="Time compression"
        />
        <span style={{ fontSize: '11px', color: '#9fd0cb', fontVariantNumeric: 'tabular-nums' }}>{timeScale <= 1 ? '1:1' : '\u00d7' + timeScale}</span>
      </div>

      {/* ── Right rail: 1st / 3rd VIEW toggle ── */}
      <div style={{ position: 'fixed', right: '20px', top: '50%', transform: 'translateY(-50%)', zIndex: 40, ...GLASS, borderRadius: '8px', padding: '10px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '9px', letterSpacing: '0.12em', color: '#5f7e7d', textTransform: 'uppercase' }}>View</span>
        <button
          onClick={() => setViewMode(third ? 'first' : 'third')}
          aria-label="Toggle camera view"
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '10px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            color: third ? '#ffb648' : '#46e0d2',
            background: third ? 'rgba(255,182,72,0.12)' : 'rgba(70,224,210,0.12)',
            border: `1px solid ${third ? 'rgba(255,182,72,0.5)' : 'rgba(70,224,210,0.4)'}`,
            borderRadius: '6px',
            padding: '8px 10px',
            width: '78px',
            lineHeight: 1.4,
          }}
        >
          {third ? '3rd \u00b7 ship' : '1st \u00b7 cockpit'}
        </button>
      </div>

      {/* ── Bottom: play/pause + speed slider (above the mode dock) ── */}
      <div style={{ position: 'fixed', bottom: '78px', left: '50%', transform: 'translateX(-50%)', zIndex: 40, ...GLASS, display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '6px', padding: '8px 12px' }}>
        <button
          onClick={() => setPaused(!isPaused)}
          aria-label={isPaused ? 'Play' : 'Pause'}
          style={{ width: '46px', height: '40px', border: `1.5px solid ${isPaused ? '#46e0d2' : '#ffb648'}`, background: isPaused ? 'rgba(70,224,210,0.12)' : 'rgba(255,182,72,0.12)', color: isPaused ? '#46e0d2' : '#ffb648', borderRadius: '4px', fontSize: '15px', cursor: 'pointer' }}
        >
          {isPaused ? '\u25B6' : '\u23F8'}
        </button>
        <label style={{ fontSize: '9.5px', letterSpacing: '0.12em', color: '#5f7e7d', textTransform: 'uppercase' }}>{speedMode}</label>
        <input
          className="speed-slider"
          type="range"
          min={cfg.min}
          max={cfg.max}
          step={cfg.step}
          value={beta}
          onChange={(e) => setBeta(parseFloat(e.target.value))}
          aria-label="Speed"
          style={{ width: '160px' }}
        />
        <span style={{ fontSize: '11px', color: speedMode === 'cruise' ? '#46e0d2' : '#ffb648', minWidth: '52px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
          {beta < 0.01 ? beta.toFixed(3) : beta.toFixed(2)} c
        </span>
      </div>

      {/* ── Left slide-out: grouped hypojump menu (Sol only) ── */}
      {isSol && planetsOpen && (
        <PlanetMenu
          selected={lastPick}
          planetScale={planetScale}
          setPlanetScale={setPlanetScale}
          onPick={pick}
          onClose={() => setPlanetsOpen(false)}
        />
      )}
    </>
  );
}
