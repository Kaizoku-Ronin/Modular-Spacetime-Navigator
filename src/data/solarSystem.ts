// ============================================================
// Solar System Data — Real Keplerian elements + ephemeris
// Ported from Sol_System_Navigator.html
//
// Planet elements: [a, e, i, L, long_peri, long_node, da, de, di, dL, dlong_peri, dlong_node]
//   in AU, degrees, degrees/century. J2000 epoch.
// Dwarf elements: osculating [a, e, i, O, w, M0, period_years]
// ============================================================

const DEG = Math.PI / 180;
const R_EARTH = 6371; // km

export interface Planet {
  name: string;
  mass: number; // kg
  R: number; // km (radius)
  col: string; // display color
  kind: 'planet' | 'dwarf' | 'star';
  ring?: boolean;
  sunDist: number; // AU, computed
  pos: number[]; // [x, y, z] in AU, computed
  path: number[][]; // orbit path points, computed
  el?: number[]; // Kepler elements for planets
  osc?: number[]; // Osculating elements for dwarfs
  pole?: number[]; // spin-axis unit vector (ecliptic frame, IAU)
}

export const SUN = {
  name: 'Sol',
  mass: 1.989e30,
  R: 696000,
  col: '#fff4e6',
  kind: 'star' as const,
  pos: [0, 0, 0],
  temp: 5778,
  sunDist: 0,
};

const PLANET_DATA = [
  {
    name: 'Mercury', mass: 3.301e23, R: 2440, col: '#9c8b7d',
    pole: [0.09138, -0.0816, 0.99247],
    el: [0.38709927, 0.20563593, 7.00497902, 252.25032350, 77.45779628, 48.33076593, 0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081],
  },
  {
    name: 'Venus', mass: 4.867e24, R: 6052, col: '#e8cda2',
    pole: [0.01869, 0.01087, 0.99977],
    el: [0.72333566, 0.00677672, 3.39467605, 181.97909950, 131.60246718, 76.67984255, 0.00000390, -0.00004107, -0.00078890, 58517.81538729, 0.00268329, -0.27769418],
  },
  {
    name: 'Earth', mass: 5.972e24, R: 6371, col: '#4a7fc0',
    pole: [0, 0.39778, 0.91748],
    el: [1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0.0, 0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0.0],
  },
  {
    name: 'Mars', mass: 6.417e23, R: 3390, col: '#c1502e',
    pole: [0.44615, -0.05551, 0.89323],
    el: [1.52371034, 0.09339410, 1.84969142, -4.55343205, -23.94362959, 49.55953891, 0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343],
  },
  {
    name: 'Jupiter', mass: 1.898e27, R: 69911, col: '#d8a978',
    pole: [-0.0146, -0.03582, 0.99925],
    el: [5.20288700, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909, -0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106],
  },
  {
    name: 'Saturn', mass: 5.683e26, R: 58232, col: '#e3c97f', ring: true,
    pole: [0.08548, 0.46244, 0.88252],
    el: [9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448, -0.00125060, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794],
  },
  {
    name: 'Uranus', mass: 8.681e25, R: 25362, col: '#a3d8e0', ring: true,
    pole: [-0.212, -0.96799, 0.13436],
    el: [19.18916464, 0.04725744, 0.77263783, 313.23810451, 170.95427630, 74.01692503, -0.00196176, -0.00004397, -0.00242939, 428.48202785, 0.40805281, 0.04240589],
  },
  {
    name: 'Neptune', mass: 1.024e26, R: 24622, col: '#3f63cf',
    pole: [0.35588, -0.30681, 0.88273],
    el: [30.06992276, 0.00859048, 1.77004347, -55.12002969, 44.96476227, 131.78422574, 0.00026291, 0.00005105, 0.00035372, 218.45945325, -0.32241464, -0.00508664],
  },
];

const DWARF_DATA = [
  { name: 'Ceres', mass: 9.39e20, R: 473, col: '#8a8276', osc: [2.7660, 0.0785, 10.587, 80.27, 73.97, 95.0, 4.604] },
  { name: 'Pluto', mass: 1.303e22, R: 1188, col: '#c9a98b', osc: [39.482, 0.2488, 17.16, 110.303, 113.763, 15.0, 247.94] },
  { name: 'Haumea', mass: 4.0e21, R: 816, col: '#d9cfc2', osc: [43.13, 0.1950, 28.21, 122.16, 239.0, 190.5, 284.0] },
  { name: 'Makemake', mass: 3.1e21, R: 715, col: '#b06a4a', osc: [45.43, 0.1590, 28.98, 79.62, 296.0, 141.0, 306.0] },
  { name: 'Eris', mass: 1.66e22, R: 1163, col: '#d8d2c4', osc: [67.86, 0.4360, 44.04, 35.95, 151.6, 194.0, 559.0] },
  { name: 'Sedna', mass: 1.0e21, R: 500, col: '#8c3a2a', osc: [506.0, 0.8550, 11.93, 144.31, 311.3, 357.6, 11400.0] },
];

// ---- Julian Date ----
export function julianDate(date: Date): number {
  const y = date.getUTCFullYear(), m = date.getUTCMonth() + 1, d = date.getUTCDate();
  const hr = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a, mm = m + 12 * a - 3;
  const jdn = d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
  return jdn + (hr - 12) / 24;
}

// ---- Kepler solve ----
function keplerSolve(Md: number, e: number): number {
  let M = ((((Md + 180) % 360) + 360) % 360 - 180) * DEG;
  let E = M + e * Math.sin(M);
  for (let i = 0; i < 12; i++) {
    E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  }
  return E;
}

// ---- Orbital elements to Cartesian ----
function o2e(a: number, e: number, i: number, O: number, w: number, E: number): number[] {
  const xp = a * (Math.cos(E) - e);
  const yp = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const wr = w * DEG, Or = O * DEG, Ir = i * DEG;
  const cw = Math.cos(wr), sw = Math.sin(wr);
  const cO = Math.cos(Or), sO = Math.sin(Or);
  const ci = Math.cos(Ir), si = Math.sin(Ir);
  return [
    (cw * cO - sw * sO * ci) * xp + (-sw * cO - cw * sO * ci) * yp,
    (cw * sO + sw * cO * ci) * xp + (-sw * sO + cw * cO * ci) * yp,
    (sw * si) * xp + (cw * si) * yp,
  ];
}

// ---- Heliocentric position ----
export function heliocentricPos(body: { el?: number[]; osc?: number[] }, JD: number): number[] {
  if (body.el) {
    const T = (JD - 2451545.0) / 36525;
    const p = body.el;
    const a = p[0] + p[6] * T;
    const e = p[1] + p[7] * T;
    const I = p[2] + p[8] * T;
    const L = p[3] + p[9] * T;
    const lp = p[4] + p[10] * T;
    const O = p[5] + p[11] * T;
    return o2e(a, e, I, O, lp - O, keplerSolve(L - lp, e));
  }
  // Dwarf planet osculating elements
  const [a, e, i, O, w, M0, per] = body.osc!;
  return o2e(a, e, i, O, w, keplerSolve(M0 + (360 / (per * 365.25)) * (JD - 2451545.0), e));
}

// ---- Orbit path (for line rendering) ----
function orbitPath(body: { el?: number[]; osc?: number[] }, JD: number): number[][] {
  let a: number, e: number, i: number, O: number, w: number;
  if (body.el) {
    const T = (JD - 2451545.0) / 36525;
    const p = body.el;
    a = p[0] + p[6] * T;
    e = p[1] + p[7] * T;
    i = p[2] + p[8] * T;
    O = p[5] + p[11] * T;
    w = (p[4] + p[10] * T) - O;
  } else {
    [a, e, i, O, w] = body.osc!;
  }
  const pts: number[][] = [];
  for (let d = 0; d <= 360; d += 5) {
    pts.push(o2e(a, e, i, O, w, keplerSolve(d, e)));
  }
  return pts;
}

// ---- Build planet objects with current positions ----
export function buildSolarSystem(date?: Date): Planet[] {
  const JD = julianDate(date || new Date());
  const planets: Planet[] = [];

  for (const pd of PLANET_DATA) {
    const pos = heliocentricPos(pd, JD);
    const path = orbitPath(pd, JD);
    const sunDist = Math.hypot(pos[0], pos[1], pos[2]);
    planets.push({
      ...pd,
      kind: 'planet',
      pos,
      path,
      sunDist,
    });
  }

  for (const dd of DWARF_DATA) {
    const pos = heliocentricPos(dd, JD);
    const path = orbitPath(dd, JD);
    const sunDist = Math.hypot(pos[0], pos[1], pos[2]);
    planets.push({
      ...dd,
      kind: 'dwarf',
      pos,
      path,
      sunDist,
    });
  }

  return planets;
}

// ---- Temperature → RGB (for sun glow) ----
export function tempToRGB(t: number): [number, number, number] {
  t /= 100;
  let r: number, g: number, b: number;
  r = t <= 66 ? 255 : 329.7 * Math.pow(t - 60, -0.1332);
  g = t <= 66 ? 99.47 * Math.log(t) - 161.1 : 288.1 * Math.pow(t - 60, -0.0755);
  b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5 * Math.log(t - 10) - 305.0;
  const cl = (x: number) => Math.max(0, Math.min(255, x)) | 0;
  return [cl(r), cl(g), cl(b)];
}

// ---- Formatting helpers ----
export function fmtDistAU(au: number): string {
  if (au < 1e-3) return (au * 149597870.7).toFixed(0) + ' km';
  return au.toFixed(au < 10 ? 4 : 2) + ' AU';
}

export function fmtMass(kg: number): string {
  const em = kg / 5.972e24;
  return em >= 0.01 ? em.toFixed(em < 10 ? 2 : 0) + ' M\u2295' : (kg / 1e21).toFixed(1) + 'e21 kg';
}

export function lightTime(au: number): string {
  const s = au * 499.0;
  if (s < 90) return s.toFixed(0) + ' s';
  if (s < 5400) return (s / 60).toFixed(1) + ' min';
  if (s < 172800) return (s / 3600).toFixed(1) + ' hr';
  return (s / 86400).toFixed(1) + ' days';
}

export function surfaceG(mass: number, R: number): string {
  const G = 6.674e-11;
  const g = G * mass / Math.pow(R * 1000, 2);
  return g.toFixed(2) + ' m/s\u00b2 (' + (g / 9.807).toFixed(2) + ' g)';
}

export { R_EARTH };
