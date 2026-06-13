// ============================================================
// Navbar — Auto-hiding top bar with mode indicator
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppState } from './Layout';
import { Info, Maximize2, Minimize2, Settings } from 'lucide-react';
import { Link } from 'react-router';

export function Navbar() {
  const { appMode } = useAppState();
  const [visible, setVisible] = useState(true);
  const [hoverTop, setHoverTop] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const resetTimer = useCallback(() => {
    setVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!hoverTop) setVisible(false);
    }, 3000);
  }, [hoverTop]);

  useEffect(() => {
    resetTimer();
    const onMove = () => resetTimer();
    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [resetTimer]);

  useEffect(() => {
    if (hoverTop) setVisible(true);
  }, [hoverTop]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const modeColor =
    appMode === 'flight'
      ? '#46e0d2'
      : appMode === 'starmap'
        ? '#9b59ff'
        : '#cfe7e6';
  const modeLabel = appMode === 'jump' ? 'HYPERJUMP' : appMode.toUpperCase();

  return (
    <nav
      onMouseEnter={() => setHoverTop(true)}
      onMouseLeave={() => setHoverTop(false)}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(to bottom, rgba(3,5,10,0.8), transparent)',
        transform: visible ? 'translateY(0)' : 'translateY(-100%)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1), opacity 0.3s',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      {/* Left — Title */}
      <div
        style={{
          fontFamily: '"Space Grotesk", system-ui, sans-serif',
          fontSize: '13px',
          fontWeight: 500,
          color: '#5f7e7d',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          display: window.innerWidth < 768 ? 'none' : 'block',
        }}
      >
        Modular Spacetime Navigator
      </div>

      {/* Center — Mode Pill */}
      <div
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '11px',
          fontWeight: 700,
          color: modeColor,
          background: 'rgba(6,12,18,0.72)',
          border: `1px solid ${modeColor}30`,
          borderRadius: '20px',
          padding: '6px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: modeColor,
            display: 'inline-block',
          }}
        />
        {modeLabel}
      </div>

      {/* Right — Icons */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Link
          to="/lore"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#5f7e7d',
            transition: 'color 0.2s',
            display: 'flex',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#46e0d2')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#5f7e7d')}
        >
          <Info size={20} />
        </Link>
        <button
          onClick={toggleFullscreen}
          style={{
            background: 'none',
            border: 'none',
            color: '#5f7e7d',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#46e0d2')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#5f7e7d')}
        >
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
        <button
          style={{
            background: 'none',
            border: 'none',
            color: '#5f7e7d',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#46e0d2')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#5f7e7d')}
        >
          <Settings size={20} />
        </button>
      </div>
    </nav>
  );
}
