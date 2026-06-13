// ============================================================
// 3D Math Utilities — exact port from X₀(143) flight simulator
// ============================================================

export const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const len = (a: number[]) => Math.hypot(a[0], a[1], a[2]);
export const sub = (a: number[], b: number[]) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const cross = (a: number[], b: number[]) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export function norm(a: number[]) {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
}
export const clamp = (x: number, a: number, b: number) => (x < a ? a : x > b ? b : x);

/* Rodrigues rotation of v about unit axis k by angle t */
export function rot(v: number[], k: number[], t: number) {
  const c = Math.cos(t),
    s = Math.sin(t),
    d = dot(v, k);
  return [
    v[0] * c + (k[1] * v[2] - k[2] * v[1]) * s + k[0] * d * (1 - c),
    v[1] * c + (k[2] * v[0] - k[0] * v[2]) * s + k[1] * d * (1 - c),
    v[2] * c + (k[0] * v[1] - k[1] * v[0]) * s + k[2] * d * (1 - c),
  ];
}

export function rnd(a: number, b: number) {
  return a + Math.random() * (b - a);
}
export function randDir() {
  const u = rnd(-1, 1),
    th = rnd(0, Math.PI * 2),
    s = Math.sqrt(1 - u * u);
  return [s * Math.cos(th), u, s * Math.sin(th)];
}
export function sph(lat: number, lon: number) {
  const cl = Math.cos(lat);
  return [cl * Math.cos(lon), Math.sin(lat), cl * Math.sin(lon)];
}

// Project 3D direction onto screen using camera basis
export function project(
  d: number[],
  CX: number,
  CY: number,
  FOC: number,
  right: number[],
  up: number[],
  fwd: number[]
) {
  const xc = dot(d, right),
    yc = dot(d, up),
    zc = dot(d, fwd);
  if (zc <= 0.001) return null;
  return [CX + (FOC * xc) / zc, CY - (FOC * yc) / zc, zc];
}
