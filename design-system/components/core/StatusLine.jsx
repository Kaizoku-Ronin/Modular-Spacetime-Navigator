import React from 'react';

const STATUS = {
  cruising:       { dot: '#46e0d2', glow: '0 0 7px #46e0d2', text: '#cfe7e6', label: 'Cruising — far from the horizon' },
  paused:         { dot: '#46e0d2', glow: '0 0 7px #46e0d2', text: '#cfe7e6', label: 'Paused — you can look around safely' },
  'near-horizon': { dot: '#ffb648', glow: '0 0 8px #ffb648', text: '#ffb648', label: 'Near horizon — shield holding' },
};

/**
 * StatusLine — a glowing status dot + reassuring message, in the cockpit's
 * second-person voice. Three canonical states; override `text` for custom copy.
 */
export function StatusLine({ status = 'cruising', text, style }) {
  const s = STATUS[status] || STATUS.cruising;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
        ...style,
      }}
    >
      <span
        style={{
          width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
          background: s.dot, boxShadow: s.glow,
          transition: 'background 0.2s, box-shadow 0.2s',
        }}
      />
      <span style={{ color: s.text, transition: 'color 0.2s' }}>{text || s.label}</span>
    </div>
  );
}
