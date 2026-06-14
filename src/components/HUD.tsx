// ============================================================
// HUD Overlay — Flight mode telemetry display
// ============================================================

import { useAppState } from './Layout';

interface HUDData {
  distance: string;
  velocity: string;
  gamma: string;
  properTime: string;
  coordTime: string;
  status: 'near-horizon' | 'paused' | 'cruising';
}

export function HUD({ hudData }: { hudData: HUDData }) {
  const { currentStar } = useAppState();

  const statusConfig = {
    'near-horizon': {
      dotColor: '#ffb648',
      dotShadow: '0 0 8px #ffb648',
      text: 'Near horizon \u2014 shield holding',
      textColor: '#ffb648',
    },
    paused: {
      dotColor: '#46e0d2',
      dotShadow: '0 0 7px #46e0d2',
      text: 'Paused \u2014 you can look around safely',
      textColor: '#cfe7e6',
    },
    cruising: {
      dotColor: '#46e0d2',
      dotShadow: '0 0 7px #46e0d2',
      text: 'Cruising \u2014 far from the horizon',
      textColor: '#cfe7e6',
    },
  };

  const sc = statusConfig[hudData.status];
  const systemName = currentStar?.name?.toUpperCase() || 'SOL';

  return (
    <div
      className="hud-panel"
      style={{
        position: 'fixed',
        top: '60px',
        left: '20px',
        zIndex: 20,
        background: 'rgba(6,12,18,0.72)',
        border: '1px solid rgba(70,224,210,0.18)',
        borderRadius: '4px',
        padding: '14px 16px',
        backdropFilter: 'blur(4px)',
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '11px',
        lineHeight: 1.6,
        letterSpacing: '0.04em',
        minWidth: '220px',
      }}
    >
      {/* System Indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '10px',
          paddingBottom: '8px',
          borderBottom: '1px solid rgba(70,224,210,0.12)',
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#46e0d2',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
        <span
          style={{
            fontFamily: '"Space Grotesk", system-ui, sans-serif',
            fontSize: '13px',
            fontWeight: 500,
            color: '#46e0d2',
            letterSpacing: '0.04em',
          }}
        >
          {systemName} SYSTEM
        </span>
      </div>

      {/* Data rows */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '18px', marginBottom: '3px' }}>
        <span style={{ color: '#5f7e7d', textTransform: 'uppercase', fontSize: '9.5px', letterSpacing: '0.12em' }}>
          Distance
        </span>
        <span style={{ color: '#46e0d2', fontVariantNumeric: 'tabular-nums' }}>{hudData.distance}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '18px', marginBottom: '3px' }}>
        <span style={{ color: '#5f7e7d', textTransform: 'uppercase', fontSize: '9.5px', letterSpacing: '0.12em' }}>
          Velocity
        </span>
        <span style={{ color: '#46e0d2', fontVariantNumeric: 'tabular-nums' }}>{hudData.velocity}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '18px', marginBottom: '3px' }}>
        <span style={{ color: '#5f7e7d', textTransform: 'uppercase', fontSize: '9.5px', letterSpacing: '0.12em' }}>
          Lorentz &gamma;
        </span>
        <span style={{ color: '#46e0d2', fontVariantNumeric: 'tabular-nums' }}>{hudData.gamma}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '18px', marginBottom: '3px' }}>
        <span style={{ color: '#5f7e7d', textTransform: 'uppercase', fontSize: '9.5px', letterSpacing: '0.12em' }}>
          Aboard
        </span>
        <span style={{ color: '#46e0d2', fontVariantNumeric: 'tabular-nums' }}>{hudData.properTime}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '18px', marginBottom: '3px' }}>
        <span style={{ color: '#5f7e7d', textTransform: 'uppercase', fontSize: '9.5px', letterSpacing: '0.12em' }}>
          Outside
        </span>
        <span style={{ color: '#46e0d2', fontVariantNumeric: 'tabular-nums' }}>{hudData.coordTime}</span>
      </div>

      {/* Status */}
      <div
        style={{
          marginTop: '10px',
          paddingTop: '8px',
          borderTop: '1px solid rgba(70,224,210,0.12)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '10px',
        }}
      >
        <span
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: sc.dotColor,
            boxShadow: sc.dotShadow,
            transition: 'background 0.2s, box-shadow 0.2s',
            flexShrink: 0,
          }}
        />
        <span style={{ color: sc.textColor, transition: 'color 0.2s' }}>{sc.text}</span>
      </div>
    </div>
  );
}
