import * as React from 'react';

/** A small mono uppercase tag — tinted fill + accent text, optional outline. */
export interface BadgeProps {
  children: React.ReactNode;
  tone?: 'teal' | 'warn' | 'violet' | 'alert' | 'dim';
  /** Thin accent outline. Default true. */
  outline?: boolean;
  /** Fully rounded (pill) corners. Default false (4px). */
  pill?: boolean;
  style?: React.CSSProperties;
}

export function Badge(props: BadgeProps): JSX.Element;
