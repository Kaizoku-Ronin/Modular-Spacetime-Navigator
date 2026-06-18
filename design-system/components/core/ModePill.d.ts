import * as React from 'react';

/** The rounded mode indicator from the top nav — dot + mode name, colored by mode. */
export interface ModePillProps {
  mode?: 'flight' | 'starmap' | 'jump';
  style?: React.CSSProperties;
}

export function ModePill(props: ModePillProps): JSX.Element;
