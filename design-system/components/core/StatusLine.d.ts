import * as React from 'react';

/** A glowing status dot + reassuring message in the cockpit's second-person voice. */
export interface StatusLineProps {
  status?: 'cruising' | 'paused' | 'near-horizon';
  /** Override the canonical message copy. */
  text?: React.ReactNode;
  style?: React.CSSProperties;
}

export function StatusLine(props: StatusLineProps): JSX.Element;
