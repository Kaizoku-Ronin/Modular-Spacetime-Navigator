// ============================================================
// Layout — Global state provider for the simulator
// Manages app mode, star selection, and shared state
// ============================================================

import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Star } from '../data/starData';
import { DEFAULT_TIME_COMPRESSION } from '../lib/physics';

export type AppMode = 'flight' | 'starmap' | 'jump';

interface AppState {
  appMode: AppMode;
  currentStar: Star | null;
  selectedStar: Star | null;
  beta: number;
  isPaused: boolean;
  jumpTarget: Star | null;
  showStarPanel: boolean;
}

export type SpeedMode = 'cruise' | 'flight';

export type ViewMode = 'first' | 'third';
export type ShipColor = [number, number, number];

/**
 * A remote ship in the world (rest-frame). The renderer applies the local
 * observer's boost on draw; never transmit aberration/Doppler. `beta` is the
 * peer's OWN speed, used purely to drive its engine glow via boostFromBeta.
 */
export interface PeerShip {
  id: string;
  posAU: number[];
  fwd: number[];
  up?: number[];
  beta: number;
  hull?: ShipColor;
  accent?: ShipColor;
}

interface AppContextType extends AppState {
  setAppMode: (mode: AppMode) => void;
  setCurrentStar: (star: Star | null) => void;
  setSelectedStar: (star: Star | null) => void;
  setBeta: (v: number) => void;
  setPaused: (v: boolean) => void;
  setJumpTarget: (star: Star | null) => void;
  setShowStarPanel: (v: boolean) => void;
  triggerJump: (target: Star) => void;
  stars: Star[];
  setStars: (stars: Star[]) => void;
  speedMode: SpeedMode;
  setSpeedMode: (mode: SpeedMode) => void;
  planetScale: number;
  setPlanetScale: (v: number) => void;
  beltDensity: number;
  setBeltDensity: (v: number) => void;
  timeScale: number;
  setTimeScale: (v: number) => void;
  hypojumpTarget: string | null;
  setHypojumpTarget: (name: string | null) => void;
  orientPending: boolean;
  setOrientPending: (v: boolean) => void;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  shipHull: ShipColor;
  setShipHull: (c: ShipColor) => void;
  shipAccent: ShipColor;
  setShipAccent: (c: ShipColor) => void;
  peers: PeerShip[];
  setPeers: (p: PeerShip[]) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function useAppState(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within Layout');
  return ctx;
}

export function Layout({ children }: { children: ReactNode }) {
  const [appMode, setAppMode] = useState<AppMode>('flight');
  const [currentStar, setCurrentStar] = useState<Star | null>(null);
  const [selectedStar, setSelectedStar] = useState<Star | null>(null);
  const [beta, setBeta] = useState(0.2);
  const [isPaused, setPaused] = useState(true);
  const [jumpTarget, setJumpTarget] = useState<Star | null>(null);
  const [showStarPanel, setShowStarPanel] = useState(false);
  const [stars, setStars] = useState<Star[]>([]);
  const [speedMode, setSpeedMode] = useState<SpeedMode>('cruise');
  const [planetScale, setPlanetScale] = useState(10);
  const [beltDensity, setBeltDensity] = useState(50);
  const [timeScale, setTimeScale] = useState(DEFAULT_TIME_COMPRESSION);
  const [hypojumpTarget, setHypojumpTarget] = useState<string | null>(null);
  const [orientPending, setOrientPending] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('first');
  const [shipHull, setShipHull] = useState<ShipColor>([122, 136, 152]);
  const [shipAccent, setShipAccent] = useState<ShipColor>([212, 88, 70]);
  const [peers, setPeers] = useState<PeerShip[]>([]);

  const triggerJump = useCallback((target: Star) => {
    setJumpTarget(target);
    setAppMode('jump');
    setShowStarPanel(false);
  }, []);

  return (
    <AppContext.Provider
      value={{
        appMode,
        currentStar,
        selectedStar,
        beta,
        isPaused,
        jumpTarget,
        showStarPanel,
        setAppMode,
        setCurrentStar,
        setSelectedStar,
        setBeta,
        setPaused,
        setJumpTarget,
        setShowStarPanel,
        triggerJump,
        stars,
        setStars,
        speedMode,
        setSpeedMode,
        planetScale,
        setPlanetScale,
        beltDensity,
        setBeltDensity,
        timeScale,
        setTimeScale,
        hypojumpTarget,
        setHypojumpTarget,
        orientPending,
        setOrientPending,
        viewMode,
        setViewMode,
        shipHull,
        setShipHull,
        shipAccent,
        setShipAccent,
        peers,
        setPeers,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
