import * as React from 'react';

/** One telemetry line: uppercase mono label + tabular value. The atom of every readout. */
export interface DataRowProps {
  label: React.ReactNode;
  value: React.ReactNode;
  /** Value text color. Default teal; use ink-mid for secondary metrics. */
  valueColor?: string;
  /** Show the faint bottom hairline. Default true. */
  divider?: boolean;
  style?: React.CSSProperties;
}

export function DataRow(props: DataRowProps): JSX.Element;
