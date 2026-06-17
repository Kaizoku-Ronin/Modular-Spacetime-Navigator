// ============================================================
// shipMesh.ts — Ronin-class interceptor, procedural low-poly hull
// ------------------------------------------------------------
// Renderer-AGNOSTIC geometry. No canvas, no Three, no DOM.
// Local frame: +Z = nose forward, +Y = up, +X = starboard.
//
// A Face is a polygon (tri / quad / ngon) referencing vertex
// indices + a material id. Non-planar quads facet naturally
// when fan-triangulated at draw time, which is what gives the
// chunky low-poly read. Same data feeds:
//   • shipRenderer.ts   (canvas-2D, this repo)
//   • THREE.BufferGeometry (see meshToThree in docs)
//   • Wavefront OBJ      (toOBJ, for Blender)
// ============================================================

const D = Math.PI / 180;

export interface Material {
  rgb: [number, number, number];
  emissive: boolean;
}
export interface Face {
  v: number[]; // vertex indices, CCW when viewed from outside
  m: number;   // index into MATERIAL_ORDER
  two: boolean; // two-sided (skip back-face cull): thin wings + fin
}
export interface ShipMesh {
  name: string;
  verts: number[][]; // [[x,y,z], ...] in local frame
  faces: Face[];
}

// Order is the material id space. `accent` is the per-player color slot.
export const MATERIAL_ORDER = [
  'hull',
  'hullDark',
  'canopy',
  'accent',
  'engine',
  'exhaust',
] as const;
export type MaterialName = (typeof MATERIAL_ORDER)[number];

export const MATERIALS: Record<MaterialName, Material> = {
  hull:     { rgb: [122, 136, 152], emissive: false },
  hullDark: { rgb: [66, 76, 92],    emissive: false },
  canopy:   { rgb: [96, 212, 236],  emissive: true  }, // cyan glow
  accent:   { rgb: [212, 88, 70],   emissive: false }, // default player color (ronin red)
  engine:   { rgb: [50, 56, 70],    emissive: false },
  exhaust:  { rgb: [255, 150, 70],  emissive: true  }, // warm, doppler-tintable
};

const mi = (k: MaterialName) => MATERIAL_ORDER.indexOf(k);

export function buildRonin(): ShipMesh {
  const verts: number[][] = [];
  const faces: Face[] = [];
  const V = (x: number, y: number, z: number) => {
    verts.push([x, y, z]);
    return verts.length - 1;
  };
  const F = (v: number[], mat: MaterialName, two = false) =>
    faces.push({ v, m: mi(mat), two });

  // flattened hexagon cross-section: points at L/R, flats top/bottom
  const hexAng = [0, 60, 120, 180, 240, 300].map((a) => a * D);
  const ring = (rw: number, rh: number, z: number) =>
    hexAng.map((a) => V(rw * Math.cos(a), rh * Math.sin(a), z));

  // ---- fuselage rings (aft -> fore) ----
  const rTail = ring(0.34, 0.24, -1.5);
  const rAft  = ring(0.5, 0.3, -1.05);
  const rMid  = ring(0.56, 0.33, 0.0);
  const rShdr = ring(0.48, 0.3, 0.9);
  const tip   = V(0, 0.06, 2.52); // ronin blade nose

  const band = (a: number[], b: number[], mat: MaterialName) => {
    for (let i = 0; i < 6; i++) F([a[i], a[(i + 1) % 6], b[(i + 1) % 6], b[i]], mat);
  };
  band(rTail, rAft, 'hullDark');
  band(rAft, rMid, 'hull');
  band(rMid, rShdr, 'hull');

  // nose cone: shoulder ring -> tip
  for (let i = 0; i < 6; i++) F([rShdr[i], rShdr[(i + 1) % 6], tip], 'hull');

  // tail cap (recessed plate)
  F([rTail[0], rTail[1], rTail[2], rTail[3], rTail[4], rTail[5]], 'hullDark');

  // ---- canopy (emissive low pyramid, forward third, on top) ----
  const cBL = V(-0.17, 0.235, 0.3), cBR = V(0.17, 0.235, 0.3);
  const cFL = V(-0.1, 0.215, 1.2),  cFR = V(0.1, 0.215, 1.2);
  const cAP = V(0, 0.39, 0.66);
  F([cBL, cFL, cAP], 'canopy');
  F([cFL, cFR, cAP], 'canopy');
  F([cFR, cBR, cAP], 'canopy');
  F([cBR, cBL, cAP], 'canopy');

  // ---- swept wings (thin two-sided blades, accent = player color) ----
  const wing = (s: number) => {
    const leRoot = V(s * 0.48, 0.05, 0.18);
    const teRoot = V(s * 0.44, 0.01, -0.92);
    const leTip  = V(s * 1.3, 0.02, -0.74);
    const teTip  = V(s * 1.16, -0.01, -1.06);
    const quad = s > 0
      ? [leRoot, leTip, teTip, teRoot]
      : [leRoot, teRoot, teTip, leTip];
    F(quad, 'accent', true);
  };
  wing(1);
  wing(-1);

  // ---- vertical tail fin (two-sided, accent) ----
  const fRF = V(0, 0.225, -0.44), fRB = V(0, 0.2, -1.46);
  const fTF = V(0, 0.66, -0.92),  fTT = V(0, 0.78, -1.2);
  F([fRF, fTF, fTT, fRB], 'accent', true);

  // ---- twin engine nacelles (hex prisms with emissive exhaust) ----
  const nacAng = [30, 90, 150, 210, 270, 330].map((a) => a * D);
  const nacelle = (cx: number) => {
    const r = 0.155, y0 = -0.03;
    const fr = nacAng.map((a) => V(cx + r * Math.cos(a), y0 + r * Math.sin(a), -1.28));
    const bk = nacAng.map((a) => V(cx + r * Math.cos(a), y0 + r * Math.sin(a), -2.06));
    for (let i = 0; i < 6; i++) F([fr[i], fr[(i + 1) % 6], bk[(i + 1) % 6], bk[i]], 'engine');
    F([bk[0], bk[1], bk[2], bk[3], bk[4], bk[5]], 'exhaust'); // glowing nozzle
  };
  nacelle(-0.285);
  nacelle(0.285);

  return { name: 'ronin', verts, faces };
}

// ---- Wavefront OBJ exporter (Blender / Three OBJLoader round-trip) ----
export function toOBJ(mesh: ShipMesh): string {
  let s = `# ${mesh.name} — MTFT Modular Spacetime Navigator\n`;
  for (const v of mesh.verts) s += `v ${v[0].toFixed(5)} ${v[1].toFixed(5)} ${v[2].toFixed(5)}\n`;
  let cur = -1;
  for (const f of mesh.faces) {
    if (f.m !== cur) { s += `usemtl ${MATERIAL_ORDER[f.m]}\n`; cur = f.m; }
    s += 'f ' + f.v.map((i) => i + 1).join(' ') + '\n';
  }
  return s;
}
