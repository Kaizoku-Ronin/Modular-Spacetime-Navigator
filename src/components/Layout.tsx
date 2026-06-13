// ============================================================
// Layout — Global state provider for the simulator
// Manages app mode, star selection, and shared state
// ============================================================

import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Star } from '../data/starData';

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
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
