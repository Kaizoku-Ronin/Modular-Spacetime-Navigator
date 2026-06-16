// ============================================================
// SimulatorPage — Main page: canvas + all overlays
// Manages the rendering loop, mode switching, and input
// Now with solar system rendering for Sol!
// ============================================================

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAppState } from '../components/Layout';
import type { SpeedMode } from '../components/Layout';
import { Navbar } from '../components/Navbar';
import { ModeSwitchBar } from '../components/ModeSwitchBar';
import { HUD } from '../components/HUD';
import { StarInfoPanel } from '../components/StarInfoPanel';
import { JumpOverlay } from '../components/JumpOverlay';
import { createFlightState, initFlightState, resize as resizeFlight, resetFlight, renderFlight, stepFlight, getFlightHUD, yaw, pitch } from '../canvas/flightRenderer';
import { createStarmapState, resizeStarmap, renderStarmap, updateStarmap, findStarAtMouse, findLaneAtMouse, getStarmapHUD } from '../canvas/starmapRenderer';
import { createJumpState, resetJump, renderJump, updateJump, isJumpComplete, getJumpProgress } from '../canvas/jumpRenderer';
import { createSolarState, renderSolarSystem, applySolarGravity, getSolarHUD } from '../canvas/solarRenderer';
import type { SolarState } from '../canvas/solarRenderer';
import { buildSolarSystem } from '../data/solarSystem';
import type { Planet } from '../data/solarSystem';
import { loadStars, loadLanes } from '../data/starData';
import type { Star, Lane } from '../data/starData';
import { Chronometer } from '../components/Chronometer';
import { FlightControls } from '../components/FlightControls';
import { createClock, tickClock, resetClock, saveClock } from '../lib/clock';

const RS = 0.58; // render scale (flight)

// Speed mode configuration
const SPEED_RANGES: Record<SpeedMode, { min: number; max: number }> = {
  cruise: { min: 0.001, max: 0.2 },
  flight: { min: 0.25, max: 0.99 },
};

export function SimulatorPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flightRef = useRef(createFlightState());
  const starmapRef = useRef(createStarmapState());
  const jumpRef = useRef(createJumpState());
  const solarRef = useRef<SolarState>(createSolarState());
  const rafRef = useRef(0);
  const lastTimeRef = useRef(0);
  const clockRef = useRef(createClock());
  const lastSaveRef = useRef(0);
  // Keep planets in a ref so they're accessible in the rAF loop
  const planetsRef = useRef<Planet[]>([]);

  const {
    appMode,
    setAppMode,
    currentStar,
    setCurrentStar,
    selectedStar,
    setSelectedStar,
    beta,
    setBeta,
    isPaused,
    setPaused,
    jumpTarget,
    setJumpTarget,
    showStarPanel,
    setShowStarPanel,
    stars,
    setStars,
    speedMode,
    planetScale,
  } = useAppState();

  const [lanes, setLanes] = useState<Lane[]>([]);
  const [hudData, setHudData] = useState(getFlightHUD(flightRef.current));
  const [starmapHud, setStarmapHud] = useState({ scaleText: '', countText: '' });
  const [jumpActive, setJumpActive] = useState(false);
  const [chrono, setChrono] = useState({
    universe: clockRef.current.universe,
    ship: clockRef.current.ship,
    gamma: 1,
    flying: false,
  });

  // Load star data
  useEffect(() => {
    loadStars().then((s) => {
      setStars(s);
      if (!currentStar) setCurrentStar(s[0]); // Sol
      loadLanes(s).then(setLanes);
    });
  }, []);

  // Initialize flight state + solar system when current star changes
  useEffect(() => {
    if (currentStar && stars.length > 0) {
      initFlightState(flightRef.current, currentStar);

      // Check if we're in the Sol system
      const isSol = currentStar.name === 'Sol';
      flightRef.current.isSolar = isSol;

      if (isSol) {
        // Build real solar system
        const planets = buildSolarSystem();
        planetsRef.current = planets;
        solarRef.current.planets = planets;
        solarRef.current.initialized = true;
      } else {
        solarRef.current.initialized = false;
        planetsRef.current = [];
      }
    }
  }, [currentStar, stars.length]);

  // Sync beta and paused to flight state
  useEffect(() => {
    flightRef.current.beta = beta;
  }, [beta]);

  useEffect(() => {
    flightRef.current.paused = isPaused;
  }, [isPaused]);

  // Canvas sizing
  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    resizeFlight(flightRef.current, w, h);
    resizeStarmap(starmapRef.current, w, h);
  }, []);

  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [resize]);

  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    lastTimeRef.current = performance.now();

    function loop(now: number) {
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;

      // Journey clock
      {
        const flying = appMode === 'flight';
        const frozen = flying && flightRef.current.paused;
        if (!frozen) {
          tickClock(clockRef.current, dt, flying ? flightRef.current.beta : 0, !flying);
        }
        const g = flying ? 1 / Math.sqrt(1 - flightRef.current.beta * flightRef.current.beta) : 1;
        setChrono({ universe: clockRef.current.universe, ship: clockRef.current.ship, gamma: g, flying: flying && !frozen });
        if (now - lastSaveRef.current > 2000) {
          saveClock(clockRef.current);
          lastSaveRef.current = now;
        }
      }

      const dpr = window.devicePixelRatio || 1;
      const w = canvas!.width / dpr;
      const h = canvas!.height / dpr;

      ctx!.save();
      ctx!.scale(dpr / RS, dpr / RS);

      switch (appMode) {
        case 'flight': {
          const fs = flightRef.current;

          if (!fs.paused) {
            stepFlight(fs, dt);

            // Apply solar gravity sway when in Sol system
            if (fs.isSolar && planetsRef.current.length > 0) {
              applySolarGravity(fs, solarRef.current, dt, planetsRef.current);
            }
          }

          // Render: use solar HUD when in Sol, regular HUD otherwise
          if (fs.isSolar) {
            renderFlight(ctx!, fs, (ctx2, s) => {
              renderSolarSystem(ctx2, s, solarRef.current, planetScale, dt);
            });
            setHudData(getSolarHUD(fs, solarRef.current));
          } else {
            renderFlight(ctx!, fs);
            setHudData(getFlightHUD(fs));
          }
          break;
        }
        case 'starmap': {
          const ss = starmapRef.current;
          updateStarmap(ss, dt);
          ctx!.restore();
          ctx!.save();
          ctx!.scale(dpr, dpr);
          renderStarmap(ctx!, ss, stars, lanes);
          setStarmapHud(getStarmapHUD(ss));
          break;
        }
        case 'jump': {
          const js = jumpRef.current;
          updateJump(js, dt);
          ctx!.restore();
          ctx!.save();
          ctx!.scale(dpr, dpr);
          renderJump(ctx!, js, w, h);
          setJumpActive(true);

          if (isJumpComplete(js)) {
            if (jumpTarget) {
              setCurrentStar(jumpTarget);
              initFlightState(flightRef.current, jumpTarget);
            }
            setAppMode('flight');
            setJumpTarget(null);
            resetJump(jumpRef.current);
            setJumpActive(false);
          }
          break;
        }
      }

      ctx!.restore();
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [appMode, stars, lanes, jumpTarget, setCurrentStar, setAppMode, setJumpTarget, planetScale, speedMode]);

  // Keyboard controls
  useEffect(() => {
    const cfg = SPEED_RANGES[speedMode];
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();

      if (k === ' ' && appMode === 'flight') {
        e.preventDefault();
        setPaused(!isPaused);
      } else if (k === 'r' && appMode === 'flight') {
        resetFlight(flightRef.current);
      } else if ((k === 'a' || k === 'arrowleft') && appMode === 'flight') {
        yaw(flightRef.current, 0.05);
      } else if ((k === 'd' || k === 'arrowright') && appMode === 'flight') {
        yaw(flightRef.current, -0.05);
      } else if ((k === 'w' || k === 'arrowup') && appMode === 'flight') {
        if (e.shiftKey) {
          pitch(flightRef.current, 0.05);
        } else {
          const nb = Math.min(cfg.max, beta + (cfg.max - cfg.min) * 0.05);
          const clamped = Math.max(cfg.min, nb);
          setBeta(clamped);
          flightRef.current.beta = clamped;
        }
      } else if ((k === 's' || k === 'arrowdown') && appMode === 'flight') {
        if (e.shiftKey) {
          pitch(flightRef.current, -0.05);
        } else {
          const nb = Math.max(cfg.min, beta - (cfg.max - cfg.min) * 0.05);
          setBeta(nb);
          flightRef.current.beta = nb;
        }
      } else if (k === 'tab') {
        e.preventDefault();
        if (appMode === 'flight') {
          setAppMode('starmap');
        } else {
          setAppMode('flight');
        }
      } else if (k === '1') {
        setAppMode('flight');
      } else if (k === '2') {
        setAppMode('starmap');
      } else if ((k === '3' || k === 'j') && appMode === 'starmap' && selectedStar) {
        setJumpTarget(selectedStar);
        setAppMode('jump');
        setShowStarPanel(false);
      } else if (k === 'escape') {
        setSelectedStar(null);
        setShowStarPanel(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [appMode, selectedStar, beta, isPaused, setAppMode, setPaused, setBeta, setSelectedStar, setShowStarPanel, setJumpTarget, speedMode]);

  // Mouse/touch handlers for starmap
  const dragRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const pinchRef = useRef<number | null>(null);

  const touchDist = (e: React.TouchEvent) =>
    Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
  const handleTouchStart = (e: React.TouchEvent) => {
    if (appMode === 'starmap' && e.touches.length === 2) {
      pinchRef.current = touchDist(e);
      dragRef.current = false;
      starmapRef.current.autoRotate = false;
      starmapRef.current.idleTime = 0;
    }
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (appMode === 'starmap' && e.touches.length === 2 && pinchRef.current != null) {
      const d = touchDist(e);
      starmapRef.current.distanceTarget = Math.max(
        100,
        Math.min(1200, starmapRef.current.distanceTarget + (pinchRef.current - d) * 1.5)
      );
      pinchRef.current = d;
    }
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) pinchRef.current = null;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (appMode === 'starmap') {
      dragRef.current = true;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
      starmapRef.current.autoRotate = false;
      starmapRef.current.idleTime = 0;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (appMode === 'starmap') {
      dragRef.current = false;
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;
      if (Math.hypot(dx, dy) < 5) {
        const starId = findStarAtMouse(e.clientX, e.clientY, starmapRef.current, stars);
        if (starId !== null) {
          setSelectedStar(stars[starId]);
          setShowStarPanel(true);
        } else {
          const laneIdx = findLaneAtMouse(e.clientX, e.clientY, starmapRef.current, stars, lanes);
          if (laneIdx === null) {
            setSelectedStar(null);
            setShowStarPanel(false);
          }
        }
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (appMode === 'starmap' && dragRef.current) {
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
      starmapRef.current.azimuthTarget -= dx * 0.004;
      starmapRef.current.polarTarget = Math.max(
        0.1,
        Math.min(Math.PI - 0.1, starmapRef.current.polarTarget - dy * 0.004)
      );
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (appMode === 'flight') {
      e.preventDefault();
      const cfg = SPEED_RANGES[speedMode];
      const delta = e.deltaY < 0 ? 0.02 : -0.02;
      const nb = Math.max(cfg.min, Math.min(cfg.max, beta + delta));
      setBeta(nb);
      flightRef.current.beta = nb;
    } else if (appMode === 'starmap') {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 40 : -40;
      starmapRef.current.distanceTarget = Math.max(
        100,
        Math.min(1200, starmapRef.current.distanceTarget + delta)
      );
      starmapRef.current.autoRotate = false;
      starmapRef.current.idleTime = 0;
    }
  };

  // Flight mode pointer drag
  const flightDragRef = useRef(false);

  const handleFlightPointerDown = (e: React.PointerEvent) => {
    if (appMode === 'flight') {
      flightDragRef.current = true;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleFlightPointerMove = (e: React.PointerEvent) => {
    if (appMode === 'flight' && flightDragRef.current) {
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
      yaw(flightRef.current, -dx * 0.0026);
      pitch(flightRef.current, -dy * 0.0026);
    }
  };

  const handleFlightPointerUp = () => {
    flightDragRef.current = false;
  };

  const alignStar = useCallback(
    (star: Star) => {
      starmapRef.current.targetXTarget = star.x;
      starmapRef.current.targetYTarget = star.y;
      starmapRef.current.targetZTarget = star.z;
      starmapRef.current.distanceTarget = 200;
    },
    []
  );

  const triggerJump = useCallback(
    (target: Star) => {
      setJumpTarget(target);
      setAppMode('jump');
      setShowStarPanel(false);
    },
    [setJumpTarget, setAppMode, setShowStarPanel]
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#03050a', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          cursor:
            appMode === 'flight'
              ? 'crosshair'
              : appMode === 'starmap'
                ? 'grab'
                : 'default',
          imageRendering: 'pixelated',
          touchAction: 'none',
        }}
        onPointerDown={(e) => {
          handlePointerDown(e);
          handleFlightPointerDown(e);
        }}
        onPointerUp={(e) => {
          handlePointerUp(e);
          handleFlightPointerUp();
        }}
        onPointerMove={(e) => {
          handlePointerMove(e);
          handleFlightPointerMove(e);
        }}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      <Navbar />

      {appMode === 'flight' && <HUD hudData={hudData} />}
      {appMode === 'flight' && <Chronometer data={chrono} onReset={() => resetClock(clockRef.current)} />}
      {appMode === 'flight' && <FlightControls />}

      {appMode === 'starmap' && (
        <>
          <div
            style={{
              position: 'fixed',
              bottom: '80px',
              left: '20px',
              zIndex: 20,
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '11px',
              color: '#5f7e7d',
              lineHeight: 1.6,
              pointerEvents: 'none',
            }}
          >
            <div>{starmapHud.scaleText}</div>
            <div>{starmapHud.countText}</div>
          </div>

          {showStarPanel && selectedStar && (
            <StarInfoPanel
              lanes={lanes}
              onAlign={alignStar}
              onJump={triggerJump}
            />
          )}
        </>
      )}

      {appMode === 'jump' && (
        <JumpOverlay active={jumpActive} progress={getJumpProgress(jumpRef.current)} />
      )}

      <ModeSwitchBar />
    </div>
  );
}
