// ============================================================
// physics.ts — the simulation's physical scale, made honest.
//
// The whole sim is built on 1 AU = 100 world units (AU = 100).
// Light crosses 1 AU in  (1 AU in km) / (c in km/s)  seconds:
//     149_597_870.7 / 299_792.458  ≈  499.0 s
// so the speed of light, expressed in world units per second, is:
//
//     C_LIGHT_WU = 100 wu / 499.0 s  ≈  0.2004 wu/s
//
// The old code advanced the camera at `beta * 42` wu/s. That is
// 42 / 0.2004 ≈ 210× the speed of light — the ship was literally
// superluminal, which is incoherent for a special-relativistic sim
// (the aberration/Doppler optics are only defined for |beta| < 1).
//
// The fix: the ship's PHYSICAL speed is exactly beta·c (always < c).
// Real light travel is ~8 min per AU, which is unplayable, so we
// advance *simulated time* faster than wall-clock by an explicit,
// player-visible TIME-COMPRESSION factor. At compression = 1 the sim
// runs in true light-time (8 min/AU); higher values fast-forward the
// clock so a journey is watchable. Crucially this is applied to the
// position step AND to the coordinate/proper clocks together, so
// distance / coordinate-time = beta·c exactly — the readout and the
// motion finally agree, and the twin-paradox drift becomes real.
// ============================================================

const AU_KM = 149_597_870.7;
const C_KM_S = 299_792.458;
const WU_PER_AU = 100;

/** Seconds for light to cross 1 AU (~499 s). */
export const LIGHT_SECONDS_PER_AU = AU_KM / C_KM_S;

/** Speed of light in world units per second (~0.2004 wu/s). */
export const C_LIGHT_WU = WU_PER_AU / LIGHT_SECONDS_PER_AU;

/** Default time-compression: simulated seconds per real second. */
export const DEFAULT_TIME_COMPRESSION = 120;
export const MIN_TIME_COMPRESSION = 1; // true light-time (8 min/AU)
export const MAX_TIME_COMPRESSION = 400;

/**
 * World-units/second the camera should advance for a given physical
 * speed and time-compression. Physical speed is always beta·c (< c);
 * the compression only fast-forwards the clock, never breaks light.
 */
export function traversalSpeed(beta: number, timeScale: number): number {
  return beta * C_LIGHT_WU * timeScale;
}
