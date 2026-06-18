import * as React from 'react';

/** A star's spectral classification as a colored pill; color derived from the class letter. */
export interface SpectralBadgeProps {
  /** Spectral type string, e.g. "G2V", "M5.5V", "DA". */
  type?: string;
  style?: React.CSSProperties;
}

export function SpectralBadge(props: SpectralBadgeProps): JSX.Element;
