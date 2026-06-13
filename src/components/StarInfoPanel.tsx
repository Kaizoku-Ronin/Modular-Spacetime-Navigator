// ============================================================
// Star Info Panel — Slide-in right panel for star details
// ============================================================

import { useAppState } from './Layout';
import { spectralHex, laneColorHex } from '../lib/colors';
import { getConnectedLanes, getLaneDestination } from '../data/starData';
import { X } from 'lucide-react';
import { useMemo } from 'react';
import type { Star, Lane } from '../data/starData';

export function StarInfoPanel({
  lanes,
  onAlign,
  onJump,
}: {
  lanes: Lane[];
  onAlign: (star: Star) => void;
  onJump: (star: Star) => void;
}) {
  const { selectedStar, setSelectedStar, setShowStarPanel, stars } = useAppState();

  const connected = useMemo(() => {
    if (!selectedStar) return [];
    return getConnectedLanes(selectedStar.id, lanes);
  }, [selectedStar, lanes]);

  if (!selectedStar) return null;

  const spColor = spectralHex(selectedStar.spectralType);
  const isMobile = window.innerWidth < 768;

  return (
    <div
      style={{
        position: 'fixed',
        top: isMobile ? 'auto' : '80px',
        bottom: isMobile ? '80px' : '80px',
        right: 0,
        width: isMobile ? '100%' : '320px',
        background: 'rgba(6,12,18,0.82)',
        borderLeft: '1px solid rgba(70,224,210,0.18)',
        backdropFilter: 'blur(16px)',
        padding: '24px',
        zIndex: 30,
        overflowY: 'auto',
        transform: 'translateX(0)',
        animation: 'slideInRight 0.4s cubic-bezier(0.22,1,0.36,1)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Close button */}
      <button
        onClick={() => {
          setSelectedStar(null);
          setShowStarPanel(false);
        }}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'none',
          border: 'none',
          color: '#5f7e7d',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          transition: 'color 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#46e0d2')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#5f7e7d')}
      >
        <X size={18} />
      </button>

      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <h2
          style={{
            fontFamily: '"Space Grotesk", system-ui, sans-serif',
            fontSize: '20px',
            fontWeight: 700,
            color: '#cfe7e6',
            letterSpacing: '-0.01em',
            lineHeight: 1.2,
            marginBottom: '8px',
          }}
        >
          {selectedStar.name}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Spectral badge */}
          <span
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '11px',
              fontWeight: 700,
              color: spColor,
              background: `${spColor}15`,
              border: `1px solid ${spColor}40`,
              borderRadius: '12px',
              padding: '3px 10px',
              letterSpacing: '0.02em',
            }}
          >
            {selectedStar.spectralType}
          </span>
          <span
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '12px',
              color: '#5f7e7d',
            }}
          >
            {selectedStar.distanceLy.toFixed(2)} ly
          </span>
        </div>
      </div>

      {/* Data rows */}
      <div style={{ marginBottom: '16px' }}>
        <DataRow label="MASS" value={`${selectedStar.mass.toFixed(3)} M\u2609`} />
        <DataRow label="TEMPERATURE" value={`${Math.round(selectedStar.temperature).toLocaleString()} K`} />
        <DataRow label="LUMINOSITY" value={`${selectedStar.luminosity.toFixed(4)} L\u2609`} />
        <DataRow label="R.A." value={selectedStar.ra || '—'} />
        <DataRow label="DECLINATION" value={selectedStar.dec || '—'} />
      </div>

      {/* Notes */}
      {selectedStar.notes && (
        <p
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '12px',
            fontStyle: 'italic',
            color: '#5f7e7d',
            lineHeight: 1.5,
            marginBottom: '16px',
          }}
        >
          {selectedStar.notes}
        </p>
      )}

      {/* Connected lanes */}
      {connected.length > 0 && (
        <div style={{ marginBottom: '20px', flex: 1 }}>
          <div
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '10px',
              fontWeight: 400,
              color: '#5f7e7d',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '10px',
              paddingBottom: '6px',
              borderBottom: '1px solid rgba(70,224,210,0.1)',
            }}
          >
            CONNECTED LANES
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {connected.map((lane) => {
              const destId = getLaneDestination(lane, selectedStar.id);
              const dest = stars[destId];
              if (!dest) return null;
              const cColor = laneColorHex(lane.class);
              return (
                <button
                  key={`${lane.from}-${lane.to}`}
                  onClick={() => {
                    setSelectedStar(dest);
                    onAlign(dest);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 8px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                    textAlign: 'left',
                    width: '100%',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(70,224,210,0.04)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: cColor,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: '12px',
                      color: '#cfe7e6',
                      flex: 1,
                    }}
                  >
                    {dest.name}
                  </span>
                  <span
                    style={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: '11px',
                      color: '#5f7e7d',
                    }}
                  >
                    {lane.distanceLy.toFixed(2)} ly
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
        <button
          onClick={() => onAlign(selectedStar)}
          style={{
            flex: 1,
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '12px',
            fontWeight: 500,
            background: 'rgba(70,224,210,0.12)',
            color: '#46e0d2',
            border: '1px solid rgba(70,224,210,0.4)',
            borderRadius: '8px',
            padding: '10px 16px',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(70,224,210,0.22)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(70,224,210,0.12)')}
        >
          ALIGN
        </button>
        <button
          onClick={() => onJump(selectedStar)}
          style={{
            flex: 1,
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '12px',
            fontWeight: 500,
            background: 'rgba(155,89,255,0.15)',
            color: '#9b59ff',
            border: '1px solid rgba(155,89,255,0.4)',
            borderRadius: '8px',
            padding: '10px 16px',
            cursor: 'pointer',
            transition: 'background 0.2s',
            animation: 'pulse-glow 1.5s infinite',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(155,89,255,0.28)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(155,89,255,0.15)')}
        >
          HYPERJUMP
        </button>
      </div>
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '5px 0',
        borderBottom: '1px solid rgba(70,224,210,0.06)',
      }}
    >
      <span
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '10px',
          fontWeight: 400,
          color: '#5f7e7d',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '12px',
          color: '#cfe7e6',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
    </div>
  );
}
