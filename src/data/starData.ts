// ============================================================
// Star data types and loader
// ============================================================

export interface Star {
  id: number;
  name: string;
  spectralType: string;
  ra: string;
  dec: string;
  distanceLy: number;
  mass: number;
  temperature: number;
  luminosity: number;
  color: string;
  notes: string;
  x: number;
  y: number;
  z: number;
  spawnPoint: boolean;
}

export interface StarJSON {
  stars: Array<{
    name: string;
    spectral_type: string;
    distance_ly: number;
    x: number;
    y: number;
    z: number;
    apparent_mag: number;
    mass_solar: number;
    notes?: string;
  }>;
}

export interface LaneJSON {
  lanes: Array<{
    from: string;
    to: string;
    distance_ly: number;
    cusp_class: string;
  }>;
  metadata?: {
    total_stars: number;
    total_lanes: number;
  };
}

export interface Lane {
  from: number; // star index
  to: number;   // star index
  fromName: string;
  toName: string;
  distanceLy: number;
  class: 'planck' | 'stellar' | 'galactic';
}

let starsCache: Star[] | null = null;
let lanesCache: Lane[] | null = null;

const LY = 30; // world units per light-year

export async function loadStars(): Promise<Star[]> {
  if (starsCache) return starsCache;
  const res = await fetch(`${import.meta.env.BASE_URL}stars.json`);
  if (!res.ok) throw new Error('Failed to load stars.json');
  const data: StarJSON = await res.json();

  // Convert from raw JSON format to our Star type
  starsCache = data.stars.map((s, i) => ({
    id: i,
    name: s.name,
    spectralType: s.spectral_type,
    ra: '',
    dec: '',
    distanceLy: s.distance_ly,
    mass: s.mass_solar,
    temperature: estimateTemperature(s.spectral_type),
    luminosity: estimateLuminosity(s.spectral_type, s.mass_solar),
    color: spectralColorFromType(s.spectral_type),
    notes: s.notes || '',
    x: s.x * LY,
    y: s.y * LY,
    z: s.z * LY,
    spawnPoint: true,
  }));
  return starsCache;
}

export async function loadLanes(stars: Star[]): Promise<Lane[]> {
  if (lanesCache) return lanesCache;
  const res = await fetch(`${import.meta.env.BASE_URL}lanes.json`);
  if (!res.ok) throw new Error('Failed to load lanes.json');
  const data: LaneJSON = await res.json();

  const starNameToId = new Map(stars.map((s) => [s.name, s.id]));

  lanesCache = data.lanes
    .map((l) => {
      const fromId = starNameToId.get(l.from);
      const toId = starNameToId.get(l.to);
      if (fromId === undefined || toId === undefined) return null;
      return {
        from: fromId,
        to: toId,
        fromName: l.from,
        toName: l.to,
        distanceLy: l.distance_ly,
        class: l.cusp_class as 'planck' | 'stellar' | 'galactic',
      };
    })
    .filter((l): l is Lane => l !== null);
  return lanesCache;
}

export function getConnectedLanes(starId: number, lanes: Lane[]): Lane[] {
  return lanes.filter((l) => l.from === starId || l.to === starId);
}

export function getLaneDestination(lane: Lane, fromStarId: number): number {
  return lane.from === fromStarId ? lane.to : lane.from;
}

// -- helpers --

function spectralColorFromType(sp: string): string {
  const c = sp.charAt(0).toUpperCase();
  const map: Record<string, string> = {
    O: '#5a7cff',
    B: '#5a7cff',
    A: '#8aa4ff',
    F: '#fff5e0',
    G: '#ffe88a',
    K: '#ffaa44',
    M: '#ff6622',
    L: '#441100',
    T: '#441100',
    Y: '#441100',
    D: '#c0d8ff',
  };
  return map[c] || '#ffffff';
}

function estimateTemperature(sp: string): number {
  // Approximate temperature from spectral type
  const c = sp.charAt(0).toUpperCase();
  const tmap: Record<string, number> = {
    O: 35000,
    B: 20000,
    A: 8500,
    F: 6500,
    G: 5700,
    K: 4400,
    M: 3100,
    L: 2200,
    T: 1300,
    Y: 500,
    D: 15000,
  };
  return tmap[c] || 3000;
}

function estimateLuminosity(sp: string, mass: number): number {
  const c = sp.charAt(0).toUpperCase();
  if (c === 'D') return 0.001;
  if (c === 'L' || c === 'T' || c === 'Y') return 0.0001 * mass;
  // Rough mass-luminosity
  return Math.pow(mass, 3.5);
}
