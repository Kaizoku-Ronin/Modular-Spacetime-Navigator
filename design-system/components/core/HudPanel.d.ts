import * as React from 'react';

/**
 * The signature instrument-glass surface — translucent fill, teal hairline, backdrop blur.
 */
export interface HudPanelProps {
  /** Header title (Space Grotesk, colored to match the dot). */
  title?: React.ReactNode;
  /** Show the pulsing system status dot in the header. */
  dot?: boolean;
  /** Dot + title color. Default teal. */
  dotColor?: string;
  /** Right-aligned tag pill text (e.g. "CRUISE"). */
  tag?: React.ReactNode;
  tagTone?: 'teal' | 'warn' | 'violet';
  /** Backdrop blur level: hud (4px) | dock (12px) | panel (16px). */
  blur?: 'hud' | 'dock' | 'panel';
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export function HudPanel(props: HudPanelProps): JSX.Element;
