// ============================================================
// Mode Switch Bar — Bottom dock for mode switching
// ============================================================

import { useAppState } from './Layout';
import type { AppMode } from './Layout';

export function ModeSwitchBar() {
  const { appMode, selectedStar, setAppMode, setShowStarPanel } = useAppState();

  const handleModeSwitch = (mode: AppMode) => {
    if (mode === 'jump') return;
    setAppMode(mode);
    if (mode === 'flight') {
      setShowStarPanel(false);
    }
  };

  const btnStyle = (active: boolean, color: string): React.CSSProperties => ({
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: '12px',
    fontWeight: 500,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    padding: '8px 14px',
    borderRadius: '8px',
    border: active ? `1px solid ${color}30` : '1px solid transparent',
    background: active ? `${color}15` : 'transparent',
    color: active ? color : '#5f7e7d',
    cursor: 'pointer',
    transition: 'all 0.25s cubic-bezier(0.22,1,0.36,1)',
  });

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(6,12,18,0.72)',
        border: '1px solid rgba(70,224,210,0.18)',
        borderRadius: '12px',
        padding: '8px 12px',
        backdropFilter: 'blur(12px)',
      }}
    >
      <button
        style={btnStyle(appMode === 'flight', '#46e0d2')}
        onClick={() => handleModeSwitch('flight')}
        onMouseEnter={(e) => {
          if (appMode !== 'flight') {
            e.currentTarget.style.background = 'rgba(70,224,210,0.08)';
            e.currentTarget.style.color = '#46e0d2';
          }
        }}
        onMouseLeave={(e) => {
          if (appMode !== 'flight') {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#5f7e7d';
          }
        }}
      >
        FLIGHT
      </button>
      <button
        style={btnStyle(appMode === 'starmap', '#9b59ff')}
        onClick={() => handleModeSwitch('starmap')}
        onMouseEnter={(e) => {
          if (appMode !== 'starmap') {
            e.currentTarget.style.background = 'rgba(155,89,255,0.08)';
            e.currentTarget.style.color = '#9b59ff';
          }
        }}
        onMouseLeave={(e) => {
          if (appMode !== 'starmap') {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#5f7e7d';
          }
        }}
      >
        STARMAP
      </button>
      <button
        style={{
          ...btnStyle(appMode === 'jump', '#ffffff'),
          opacity: selectedStar && appMode === 'starmap' ? 1 : 0.3,
          cursor: selectedStar && appMode === 'starmap' ? 'pointer' : 'not-allowed',
        }}
        disabled={!selectedStar || appMode !== 'starmap'}
        onClick={() => {
          if (selectedStar && appMode === 'starmap') {
            // Jump triggered via external handler
          }
        }}
        onMouseEnter={(e) => {
          if (selectedStar && appMode === 'starmap') {
            e.currentTarget.style.background = 'rgba(155,89,255,0.15)';
            e.currentTarget.style.color = '#9b59ff';
          }
        }}
        onMouseLeave={(e) => {
          if (selectedStar && appMode === 'starmap') {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#5f7e7d';
          }
        }}
      >
        JUMP
      </button>
    </div>
  );
}
