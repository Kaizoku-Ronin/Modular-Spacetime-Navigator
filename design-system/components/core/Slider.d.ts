import * as React from 'react';

/** The touch-friendly HUD range input — gradient fill-gauge track, glowing thumb. */
export interface SliderProps {
  label?: React.ReactNode;
  value: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Track + thumb color. teal = cruise, warn = flight regime. */
  tone?: 'teal' | 'warn';
  /** Formatted value shown at the right (e.g. "0.200 c"). */
  displayValue?: React.ReactNode;
  width?: number;
  style?: React.CSSProperties;
}

export function Slider(props: SliderProps): JSX.Element;
