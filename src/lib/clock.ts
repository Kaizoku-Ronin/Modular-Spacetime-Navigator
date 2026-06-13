// ============================================================
// Journey clock — the twin paradox, made persistent.
//
// "universe" is Standard Galactic Time (coordinate time): all the
// catalog stars are mutually at rest, so they share one clock —
// the player's wall clock maps to it. "ship" is the cockpit's
// proper time, which runs slow during relativistic flight
// (dτ = dt/γ). The accumulated drift = universe − ship is how much
// LESS the ship has aged than the galaxy across the whole journey.
//
// Convention matches the in-flight HUD (properT = coordT/γ).
// Persists across flights, hyperjumps, and (via localStorage)
// reloads, so the divergence builds up over a whole journey.
// ============================================================

const STORAGE_KEY = 'msn.journeyClock.v1';

export interface JourneyClock {
  universe: number; // standard galactic / coordinate time (seconds)
  ship: number;     // ship proper time (seconds)
}

export function createClock(): JourneyClock {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const o = JSON.parse(raw);
      if (typeof o.universe === 'number' && typeof o.ship === 'number' && o.universe >= o.ship) {
        return { universe: o.universe, ship: o.ship };
      }
    }
  } catch {
    /* localStorage unavailable — fall through to a fresh clock */
  }
  return { universe: 0, ship: 0 };
}

/**
 * Advance the clock by one frame.
 * @param dt      real elapsed seconds (maps to galactic/coordinate time)
 * @param beta    current ship speed (fraction of c); used only in flight
 * @param atRest  true in starmap/jump — ship and galaxy tick together (no drift)
 */
export function tickClock(c: JourneyClock, dt: number, beta: number, atRest: boolean): void {
  c.universe += dt;
  if (atRest || beta <= 0) {
    c.ship += dt;
  } else {
    const b = Math.min(beta, 0.999999);
    const gamma = 1 / Math.sqrt(1 - b * b);
    c.ship += dt / gamma;
  }
}

export function resetClock(c: JourneyClock): void {
  c.universe = 0;
  c.ship = 0;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function saveClock(c: JourneyClock): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ universe: c.universe, ship: c.ship }));
  } catch {
    /* ignore */
  }
}

/** Format seconds as [Dd ]HH:MM:SS (day field dropped when zero). */
export function fmtClock(s: number): string {
  const neg = s < 0 ? '-' : '';
  s = Math.abs(s);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  const p2 = (n: number) => String(n).padStart(2, '0');
  const hms = `${p2(h)}:${p2(m)}:${p2(sec)}`;
  return neg + (d > 0 ? `${d}d ${hms}` : hms);
}

/** Drift phrasing, scaled to the largest sensible unit. */
export function fmtDrift(s: number): string {
  if (s < 60) return s.toFixed(1) + ' s';
  if (s < 3600) return (s / 60).toFixed(1) + ' min';
  if (s < 86400) return (s / 3600).toFixed(2) + ' hr';
  return (s / 86400).toFixed(2) + ' days';
}
