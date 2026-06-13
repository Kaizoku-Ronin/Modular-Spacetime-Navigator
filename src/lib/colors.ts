// ============================================================
// Color utilities — spectral type colors, lane colors, Doppler
// ============================================================

import { clamp } from './math3d';

// ============================================================
// Canonical cusp palette — SINGLE SOURCE OF TRUTH.
// The four cusps of D(143) = {1, 11, 13, 143}. Every surface
// (lore, cusp diagram, lane network, flight-view rings) reads
// from here so a cusp is the same colour everywhere.
// Hot/small -> cool/large ramp. Deliberately avoids amber so
// amber stays reserved for the HUD "near-horizon" warning.
//   width 1   planck       magenta
//   width 11  stellar      violet
//   width 13  galactic     sky blue
//   width 143 cosmological indigo   (system/de Sitter scale; not a lane class)
// ============================================================
export const CUSP_COLORS = {
  planck: '#ff5f9e',
  stellar: '#b86bff',
  galactic: '#4db6e8',
  cosmological: '#4a6cf0',
} as const;

export type CuspName = keyof typeof CUSP_COLORS;

/** Map a cusp width (1/11/13/143) to its canonical name. */
export function cuspNameForWidth(w: number): CuspName {
  return w === 1 ? 'planck' : w === 11 ? 'stellar' : w === 13 ? 'galactic' : 'cosmological';
}

const INK_DIM = '#5f7e7d';
function hexToRgb(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

/** Spectral type → RGB color mapping */
export function spectralColor(spectralType: string): [number, number, number] {
  const s = spectralType.charAt(0).toUpperCase();
  switch (s) {
    case 'O':
    case 'B':
      return [0x5a, 0x7c, 0xff];
    case 'A':
      return [0x8a, 0xa4, 0xff];
    case 'F':
      return [0xff, 0xf5, 0xe0];
    case 'G':
      return [0xff, 0xe8, 0x8a];
    case 'K':
      return [0xff, 0xaa, 0x44];
    case 'M':
      return [0xff, 0x66, 0x22];
    case 'L':
    case 'T':
    case 'Y':
      return [0x44, 0x11, 0x00];
    case 'D': // White dwarfs
      return [0xc0, 0xd8, 0xff];
    default:
      return [0xff, 0xff, 0xff];
  }
}

/** Hex color string from spectral type */
export function spectralHex(spectralType: string): string {
  const [r, g, b] = spectralColor(spectralType);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/** Lane class → RGB color (reads the canonical cusp palette) */
export function laneColor(className: string): [number, number, number] {
  const hex = (CUSP_COLORS as Record<string, string>)[className] ?? INK_DIM;
  return hexToRgb(hex);
}

/** Lane class → CSS color string (reads the canonical cusp palette) */
export function laneColorHex(className: string): string {
  return (CUSP_COLORS as Record<string, string>)[className] ?? INK_DIM;
}

/** Doppler factor → RGB color shift (exact from flight sim) */
export function dColor(D: number): [number, number, number] {
  const t = clamp(Math.log2(D) / 1.4, -1, 1);
  if (t >= 0) return [255 - 104 * t, 255 - 44 * t, 255];
  const a = -t;
  return [255, 255 - 150 * a, 255 - 212 * a];
}

/** RGB tuple to CSS string */
export function rgb([r, g, b]: [number, number, number]): string {
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}

/** RGBA string */
export function rgba([r, g, b]: [number, number, number], a: number): string {
  return `rgba(${r | 0},${g | 0},${b | 0},${a})`;
}
