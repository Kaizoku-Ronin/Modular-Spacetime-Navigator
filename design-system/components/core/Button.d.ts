import * as React from 'react';

/**
 * The cockpit action control: tinted glass fill, accent hairline, mono uppercase label.
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual + semantic tone. teal=safe, warn=flight, violet=jump, alert=destructive. */
  tone?: 'teal' | 'warn' | 'violet' | 'alert';
  /** solid = tinted fill + border; ghost = transparent, brightens on hover. */
  variant?: 'solid' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  /** Optional leading glyph or icon node. */
  icon?: React.ReactNode;
  /** Adds the violet expanding pulse-glow halo (the hyperjump CTA treatment). */
  pulse?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function Button(props: ButtonProps): JSX.Element;
