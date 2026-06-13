// ============================================================
// LorePage — MTFT Mathematics, star catalog, and lane network
// Full scroll-driven page with GSAP ScrollTrigger + Lenis
// ============================================================

import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import CuspDiagram from '@/components/CuspDiagram';
import SpectralChart from '@/components/SpectralChart';
import { CUSP_COLORS } from '@/lib/colors';

// Lazy load heavy components
type StarNode = {
  name: string;
  spectral_type: string;
  distance_ly: number;
  mass_solar: number;
  notes: string;
  x: number;
  y: number;
  z: number;
};

type LaneEdge = {
  from: string;
  to: string;
  distanceLy: number;
  class: string;
};

const StarCatalogTable = lazy(() => import('@/components/StarCatalogTable'));
const LaneNetwork = lazy(() => import('@/components/LaneNetwork'));

gsap.registerPlugin(ScrollTrigger);

// ── Spectral helpers ───────────────────────────────────────
function getSpectralClass(type: string): string {
  const t = type.trim();
  if (t.startsWith('O') || t.startsWith('B')) return 'O/B';
  if (t.startsWith('A')) return 'A';
  if (t.startsWith('F')) return 'F';
  if (t.startsWith('G')) return 'G';
  if (t.startsWith('K')) return 'K';
  if (t.startsWith('M')) return 'M';
  if (t.startsWith('L') || t.startsWith('T') || t.startsWith('Y')) return 'L/T/Y';
  if (t.startsWith('D')) return 'WD';
  return '?';
}

// ── Counter component ──────────────────────────────────────
function AnimatedCounter({
  value,
  color,
  label,
  triggered,
}: {
  value: number;
  color: string;
  label: string;
  triggered: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (triggered && !hasAnimated.current && ref.current) {
      hasAnimated.current = true;
      const obj = { val: 0 };
      gsap.to(obj, {
        val: value,
        duration: 1.5,
        ease: 'power2.out',
        onUpdate: () => {
          if (ref.current) {
            ref.current.textContent = Math.round(obj.val).toString();
          }
        },
      });
    }
  }, [triggered, value]);

  return (
    <div style={{ textAlign: 'center' }}>
      <span
        ref={ref}
        style={{
          fontFamily: "'Space Grotesk', system-ui, sans-serif",
          fontSize: 'clamp(48px, 8vw, 80px)',
          fontWeight: 700,
          lineHeight: 1.0,
          color,
        }}
      >
        0
      </span>
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#5f7e7d',
          marginTop: 8,
        }}
      >
        {label}
      </div>
    </div>
  );
}

// ── Main Lore Page ─────────────────────────────────────────
export default function LorePage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const [stars, setStars] = useState<StarNode[]>([]);
  const [lanes, setLanes] = useState<LaneEdge[]>([]);
  const [countersTriggered, setCountersTriggered] = useState(false);

  // Apply lore-page class to html for CSS overrides
  useEffect(() => {
    document.documentElement.classList.add('lore-page');
    return () => {
      document.documentElement.classList.remove('lore-page');
    };
  }, []);

  // Fetch data
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}stars.json`)
      .then((r) => r.json())
      .then((data) => {
        const s = data.stars || data;
        setStars(s);
      })
      .catch(() => setStars([]));

    fetch(`${import.meta.env.BASE_URL}lanes.json`)
      .then((r) => {
        if (!r.ok) throw new Error('No lanes.json');
        return r.json();
      })
      .then((data) => {
        const l = data.lanes || data;
        setLanes(l);
      })
      .catch(() => {
        // Generate lanes from star positions if no lanes.json
        setLanes([]);
      });
  }, []);

  // Compute lane distribution
  const laneStats = {
    planck: lanes.filter((l) => l.class === 'planck').length,
    stellar: lanes.filter((l) => l.class === 'stellar').length,
    galactic: lanes.filter((l) => l.class === 'galactic').length,
  };

  // ── Lenis smooth scroll ─────────────────────────────────
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.08,
    });
    lenisRef.current = lenis;

    // Connect Lenis to GSAP ticker
    lenis.on('scroll', ScrollTrigger.update);
    const tickFn = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickFn);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(tickFn);
    };
  }, []);

  // ── GSAP ScrollTrigger animations ───────────────────────
  useEffect(() => {
    if (!pageRef.current) return;
    const ctx = gsap.context(() => {
      // Hero overline
      gsap.from('.hero-overline', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        delay: 0.2,
        ease: 'power2.out',
      });

      // Hero title
      gsap.from('.hero-title-line', {
        opacity: 0,
        y: 30,
        duration: 1.0,
        delay: 0.4,
        stagger: 0.12,
        ease: 'power3.out',
      });

      // Hero subtitle
      gsap.from('.hero-subtitle', {
        opacity: 0,
        y: 15,
        duration: 0.8,
        delay: 1.0,
        ease: 'power2.out',
      });

      // Scroll indicator
      gsap.from('.scroll-indicator', {
        opacity: 0,
        duration: 0.5,
        delay: 1.4,
      });

      // ── Physics section reveals ──
      gsap.from('.physics-heading', {
        scrollTrigger: {
          trigger: '.physics-heading',
          start: 'top 80%',
        },
        opacity: 0,
        y: 40,
        duration: 0.7,
        ease: 'power2.out',
      });

      gsap.from('.physics-paragraph', {
        scrollTrigger: {
          trigger: '.physics-paragraphs',
          start: 'top 75%',
        },
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
      });

      gsap.from('.formula-card', {
        scrollTrigger: {
          trigger: '.formula-cards',
          start: 'top 70%',
        },
        opacity: 0,
        x: 30,
        duration: 0.5,
        stagger: 0.12,
        ease: 'power2.out',
      });

      // ── Star catalog heading ──
      gsap.from('.catalog-heading', {
        scrollTrigger: {
          trigger: '.catalog-heading',
          start: 'top 80%',
        },
        opacity: 0,
        y: 30,
        duration: 0.6,
        ease: 'power2.out',
      });

      // ── Lane counter trigger ──
      ScrollTrigger.create({
        trigger: '.lane-counters',
        start: 'top 75%',
        onEnter: () => setCountersTriggered(true),
      });

      gsap.from('.lane-counters', {
        scrollTrigger: {
          trigger: '.lane-counters',
          start: 'top 75%',
        },
        opacity: 0,
        y: 30,
        duration: 0.6,
        ease: 'power2.out',
      });

      // ── Multiplayer section ──
      gsap.from('.multiplayer-block', {
        scrollTrigger: {
          trigger: '.multiplayer-block',
          start: 'top 75%',
        },
        opacity: 0,
        x: -20,
        duration: 0.7,
        ease: 'power2.out',
      });

      gsap.from('.multiplayer-cta', {
        scrollTrigger: {
          trigger: '.multiplayer-cta',
          start: 'top 70%',
        },
        opacity: 0,
        duration: 0.4,
        delay: 0.3,
        ease: 'power2.out',
      });

      // ── Lane legend ──
      gsap.from('.lane-legend-item', {
        scrollTrigger: {
          trigger: '.lane-legend',
          start: 'top 80%',
        },
        opacity: 0,
        duration: 0.4,
        stagger: 0.1,
        ease: 'power2.out',
      });
    }, pageRef);

    return () => ctx.revert();
  }, [stars.length, lanes.length]);

  // ── Compute spectral distribution for display ──
  const spectralCounts: Record<string, number> = {};
  stars.forEach((s) => {
    const cls = getSpectralClass(s.spectral_type);
    spectralCounts[cls] = (spectralCounts[cls] || 0) + 1;
  });

  return (
    <div ref={pageRef} style={{ background: '#03050a', minHeight: '100dvh' }}>
      {/* ── Navbar ── */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 56,
          background: 'rgba(3, 5, 10, 0.9)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(70, 224, 210, 0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          zIndex: 50,
        }}
      >
        <a
          href="#/"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: '#46e0d2',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.7'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
        >
          <span>&larr;</span>
          <span>BACK TO NAVIGATOR</span>
        </a>

        <span
          style={{
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            fontSize: 14,
            fontWeight: 500,
            color: '#5f7e7d',
            letterSpacing: '0.08em',
          }}
        >
          Modular Spacetime Navigator
        </span>

        <div style={{ width: 140 }} />
      </nav>

      {/* ── Hero Section ── */}
      <section
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          backgroundImage: `url(${import.meta.env.BASE_URL}lore-hero-bg.webp)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '0 24px',
          paddingTop: 56,
        }}
      >
        {/* Overline */}
        <div
          className="hero-overline"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            fontWeight: 400,
            color: '#46e0d2',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: 24,
          }}
        >
          X₀(143) · Modular Curve Theory
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            fontSize: 'clamp(40px, 8vw, 96px)',
            fontWeight: 700,
            color: '#cfe7e6',
            letterSpacing: '-0.03em',
            lineHeight: 1.0,
            textAlign: 'center',
            margin: 0,
          }}
        >
          <span className="hero-title-line" style={{ display: 'block' }}>
            The Mathematics
          </span>
          <span className="hero-title-line" style={{ display: 'block' }}>
            of Spacetime
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="hero-subtitle"
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 'clamp(14px, 2vw, 20px)',
            fontWeight: 300,
            color: '#5f7e7d',
            maxWidth: 560,
            textAlign: 'center',
            lineHeight: 1.6,
            marginTop: 24,
          }}
        >
          A modular curve at the heart of every star. Four cusps bridging cosmological, galactic,
          stellar, and Planck scales. Sixty real stars. One hundred and five hyperspace lanes. This
          is the geometry that connects them.
        </p>

        {/* Scroll indicator */}
        <div
          className="scroll-indicator"
          style={{
            position: 'absolute',
            bottom: 32,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div style={{ position: 'relative', width: 1, height: 40, background: 'rgba(95, 126, 125, 0.3)' }}>
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '-1.5px',
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: '#46e0d2',
                animation: 'scrollDot 2s ease-in-out infinite',
              }}
            />
          </div>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              color: '#5f7e7d',
              letterSpacing: '0.1em',
            }}
          >
            SCROLL
          </span>
        </div>
      </section>

      {/* ── Section 1: X₀(143) & The Four Cusps ── */}
      <section
        className="cusp-section"
        style={{
          padding: 'var(--space-3xl) var(--space-xl)',
          maxWidth: 1100,
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
          <h2
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 700,
              color: '#cfe7e6',
              margin: 0,
              marginBottom: 'var(--space-sm)',
            }}
          >
            X₀(143) &amp; The Four Cusps
          </h2>
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: '#5f7e7d',
              letterSpacing: '0.06em',
            }}
          >
            Divisors of 143 define the scale boundaries of spacetime
          </p>
        </div>

        {/* Cusp Diagram + Labels */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-xl)',
            flexWrap: 'wrap',
          }}
        >
          <CuspDiagram size={Math.min(400, typeof window !== 'undefined' ? window.innerWidth * 0.6 : 300)} />

          {/* Cusp labels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', minWidth: 200 }}>
            {[
              { w: 143, color: CUSP_COLORS.cosmological, label: 'Cosmological', desc: 'The boundary of observable spacetime' },
              { w: 13, color: CUSP_COLORS.galactic, label: 'Galactic', desc: 'Stellar neighborhoods and hyperspace lanes' },
              { w: 11, color: CUSP_COLORS.stellar, label: 'Stellar', desc: 'Star systems, accretion disks, flight corridors' },
              { w: 1, color: CUSP_COLORS.planck, label: 'Planck', desc: 'Event horizon, quantum gravity, singularity' },
            ].map((cusp) => (
              <div
                key={cusp.w}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 6,
                  border: `1px solid ${cusp.color}25`,
                  background: `${cusp.color}08`,
                }}
              >
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 14,
                    fontWeight: 700,
                    color: cusp.color,
                    minWidth: 36,
                  }}
                >
                  {cusp.w}
                </span>
                <div>
                  <div
                    style={{
                      fontFamily: "'Space Grotesk', system-ui, sans-serif",
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#cfe7e6',
                    }}
                  >
                    {cusp.label}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Inter', system-ui, sans-serif",
                      fontSize: 11,
                      fontWeight: 300,
                      color: '#5f7e7d',
                      lineHeight: 1.4,
                    }}
                  >
                    {cusp.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* D(143) summary */}
        <div
          style={{
            textAlign: 'center',
            marginTop: 'var(--space-2xl)',
            padding: 'var(--space-md)',
            borderRadius: 8,
            border: '1px solid rgba(70, 224, 210, 0.12)',
            background: 'rgba(70, 224, 210, 0.04)',
          }}
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 14,
              fontWeight: 700,
              color: '#46e0d2',
              letterSpacing: '0.02em',
            }}
          >
            D(143) = {'{1, 11, 13, 143}'}
          </span>
          <p
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 14,
              fontWeight: 300,
              color: '#5f7e7d',
              margin: '8px 0 0',
              lineHeight: 1.5,
            }}
          >
            The divisor structure of 143 organizes all scales of the simulator
          </p>
        </div>
      </section>

      {/* ── Section 2: Modular Spacetime Physics ── */}
      <section
        style={{
          padding: 'var(--space-3xl) var(--space-xl)',
          maxWidth: 1100,
          margin: '0 auto',
        }}
      >
        <div className="physics-heading">
          <h2
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 700,
              color: '#cfe7e6',
              margin: 0,
              marginBottom: 'var(--space-lg)',
            }}
          >
            Physics of the Simulator
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--space-xl)',
          }}
        >
          {/* Left: Text */}
          <div className="physics-paragraphs">
            {[
              {
                title: 'Special Relativity',
                text: 'The flight simulator implements exact special relativistic effects. As your velocity approaches the speed of light, three phenomena become visible: aberration of light (stars appear to crowd in front of you), Doppler shifting (stars ahead blueshift, behind redshift), and relativistic beaming (the intensity concentrates in the forward direction).',
              },
              {
                title: 'Gravity & The Black Hole',
                text: "Each star system centers on a black hole whose mass is proportional to the host star. The gravity is tuned arcade-style — it bends your heading vector but preserves your chosen cruise speed. The event horizon radius scales with mass: more massive stars have larger, more dangerous horizons. The Horizon Shield prevents you from crossing the point of no return.",
              },
              {
                title: 'Scale Mapping',
                text: 'Two scales govern the navigator. In flight mode, 1 AU equals 100 world units — your local neighborhood around the star. In the starmap, 1 light year compresses to 30 world units, letting us visualize twenty light years of real stellar data on one screen. The hyperjump bridges these scales through a cinematic warp transition.',
              },
            ].map((p) => (
              <div
                key={p.title}
                className="physics-paragraph"
                style={{ marginBottom: 'var(--space-md)' }}
              >
                <h3
                  style={{
                    fontFamily: "'Space Grotesk', system-ui, sans-serif",
                    fontSize: 16,
                    fontWeight: 500,
                    color: '#cfe7e6',
                    margin: '0 0 8px',
                  }}
                >
                  {p.title}
                </h3>
                <p
                  style={{
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: 16,
                    fontWeight: 300,
                    color: '#cfe7e6',
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  {p.text}
                </p>
              </div>
            ))}
          </div>

          {/* Right: Formula cards */}
          <div className="formula-cards" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {/* Lorentz Factor */}
            <div
              className="formula-card"
              style={{
                background: 'var(--panel)',
                border: '1px solid rgba(70, 224, 210, 0.18)',
                borderRadius: 8,
                padding: 'var(--space-md)',
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  color: '#46e0d2',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                Lorentz Factor
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 'clamp(16px, 2vw, 22px)',
                  color: '#cfe7e6',
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                γ = 1 / √(1 − β²)
              </div>
              <div
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 12,
                  color: '#5f7e7d',
                  lineHeight: 1.4,
                }}
              >
                At β=0.5, γ=1.15. At β=0.99, γ=7.09.
              </div>
            </div>

            {/* Schwarzschild Radius */}
            <div
              className="formula-card"
              style={{
                background: 'var(--panel)',
                border: '1px solid rgba(70, 224, 210, 0.18)',
                borderRadius: 8,
                padding: 'var(--space-md)',
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  color: '#ffb648',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                Schwarzschild Radius
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 'clamp(16px, 2vw, 22px)',
                  color: '#cfe7e6',
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                rₛ = 2GM/c²
              </div>
              <div
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 12,
                  color: '#5f7e7d',
                  lineHeight: 1.4,
                }}
              >
                The event horizon scales linearly with mass. Sol&apos;s black hole: rₛ ≈ 2.95 km.
              </div>
            </div>

            {/* Lane Classification */}
            <div
              className="formula-card"
              style={{
                background: 'var(--panel)',
                border: '1px solid rgba(70, 224, 210, 0.18)',
                borderRadius: 8,
                padding: 'var(--space-md)',
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  color: '#9b59ff',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                Lane Classification
              </div>
              {[
                { cls: 'planck', range: 'd < 2.0 ly', count: 46, color: '#46e0d2' },
                { cls: 'stellar', range: '2.0–3.5 ly', count: 25, color: '#ffb648' },
                { cls: 'galactic', range: '3.5–5.0 ly', count: 34, color: '#9b59ff' },
              ].map((row) => (
                <div
                  key={row.cls}
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                    color: row.color,
                    padding: '3px 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>
                    {row.cls}: {row.range}
                  </span>
                  <span>({row.count} lanes)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 3: The Star Catalog ── */}
      <section
        style={{
          padding: 'var(--space-3xl) var(--space-xl)',
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <div className="catalog-heading" style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
          <h2
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 700,
              color: '#cfe7e6',
              margin: '0 0 var(--space-xs)',
            }}
          >
            60 Nearby Stars
          </h2>
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: '#5f7e7d',
              letterSpacing: '0.06em',
            }}
          >
            Within ~20 light years of Sol · Data: HYG Database
          </p>
        </div>

        <Suspense
          fallback={
            <div
              style={{
                textAlign: 'center',
                padding: 'var(--space-xl)',
                color: '#5f7e7d',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
              }}
            >
              Loading star catalog...
            </div>
          }
        >
          <StarCatalogTable stars={stars} />
        </Suspense>

        {/* Spectral Distribution Chart */}
        <div style={{ marginTop: 'var(--space-xl)', display: 'flex', justifyContent: 'center' }}>
          <Suspense fallback={null}>
            <SpectralChart />
          </Suspense>
        </div>
      </section>

      {/* ── Section 4: Hyperspace Lane Network ── */}
      <section
        style={{
          padding: 'var(--space-3xl) var(--space-xl)',
          maxWidth: 1100,
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
          <h2
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 700,
              color: '#cfe7e6',
              margin: '0 0 var(--space-xs)',
            }}
          >
            The Lane Network
          </h2>
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: '#5f7e7d',
              letterSpacing: '0.06em',
            }}
          >
            105 hyperspace lanes connecting 60 star systems
          </p>
        </div>

        {/* Animated Counters */}
        <div
          className="lane-counters"
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'var(--space-xl)',
            marginBottom: 'var(--space-2xl)',
            flexWrap: 'wrap',
          }}
        >
          <AnimatedCounter value={60} color="#46e0d2" label="STAR SYSTEMS" triggered={countersTriggered} />
          <AnimatedCounter value={105} color="#ffb648" label="HYPERSPACE LANES" triggered={countersTriggered} />
          <AnimatedCounter value={20} color="#9b59ff" label="LIGHT YEAR RADIUS" triggered={countersTriggered} />
        </div>

        {/* Lane Network Visualization */}
        {stars.length > 0 && (
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <Suspense
              fallback={
                <div
                  style={{
                    textAlign: 'center',
                    padding: 'var(--space-xl)',
                    color: '#5f7e7d',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                  }}
                >
                  Loading network...
                </div>
              }
            >
              <LaneNetwork stars={stars} lanes={lanes} />
            </Suspense>
          </div>
        )}

        {/* Lane statistics bar chart */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'var(--space-xl)',
            flexWrap: 'wrap',
            marginBottom: 'var(--space-lg)',
          }}
        >
          {[
            { label: 'Planck', count: laneStats.planck || 46, color: '#46e0d2', desc: '< 2 LY' },
            { label: 'Stellar', count: laneStats.stellar || 25, color: '#ffb648', desc: '2–3.5 LY' },
            { label: 'Galactic', count: laneStats.galactic || 34, color: '#9b59ff', desc: '3.5–5 LY' },
          ].map((item) => (
            <div key={item.label} style={{ textAlign: 'center', minWidth: 120 }}>
              <div
                style={{
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                  fontSize: 36,
                  fontWeight: 700,
                  color: item.color,
                  lineHeight: 1.0,
                }}
              >
                {item.count}
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: '#5f7e7d',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginTop: 4,
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  color: '#5f7e7d',
                }}
              >
                {item.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div
          className="lane-legend"
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'var(--space-lg)',
            flexWrap: 'wrap',
          }}
        >
          {[
            { color: '#46e0d2', label: '< 2 LY · 46 LANES', cls: 'planck' },
            { color: '#ffb648', label: '2–3.5 LY · 25 LANES', cls: 'stellar' },
            { color: '#9b59ff', label: '3.5–5 LY · 34 LANES', cls: 'galactic' },
          ].map((item) => (
            <div
              key={item.cls}
              className="lane-legend-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 3,
                  borderRadius: 2,
                  background: item.color,
                }}
              />
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: '#5f7e7d',
                }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 5: Multiplayer Vision ── */}
      <section
        style={{
          padding: 'var(--space-3xl) var(--space-xl)',
          maxWidth: 800,
          margin: '0 auto',
        }}
      >
        <div
          className="multiplayer-block"
          style={{
            borderLeft: '3px solid #46e0d2',
            paddingLeft: 'var(--space-lg)',
          }}
        >
          <h2
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontSize: 'clamp(24px, 3vw, 40px)',
              fontWeight: 700,
              color: '#cfe7e6',
              margin: '0 0 var(--space-lg)',
            }}
          >
            Beyond the Solo Flight
          </h2>

          {[
            'Every star in the catalog is a potential spawn point. In a multiplayer future, each player would begin at their chosen home star — Sol for some, Proxima for others, Barnard\'s Star for the adventurous.',
            'Hyperspace lanes become travel corridors. You could see other pilots\' ships as glowing dots traversing the lanes between systems. Claim unvisited stars. Build outposts. The lane network is the road map of a shared galaxy.',
            'For now, the navigator is a solo instrument — but the architecture is ready. The 60 stars wait. The 105 lanes are drawn. The modular curve at the center of each system holds its cusps open.',
          ].map((text, i) => (
            <p
              key={i}
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 16,
                fontWeight: 300,
                color: '#cfe7e6',
                lineHeight: 1.7,
                margin: '0 0 var(--space-md)',
              }}
            >
              {text}
            </p>
          ))}

          <a
            href="#/"
            className="multiplayer-cta"
            style={{
              display: 'inline-block',
              marginTop: 'var(--space-md)',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              fontWeight: 500,
              color: '#46e0d2',
              background: 'rgba(70, 224, 210, 0.1)',
              border: '1px solid rgba(70, 224, 210, 0.4)',
              padding: '12px 28px',
              borderRadius: 8,
              textDecoration: 'none',
              transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(70, 224, 210, 0.2)';
              e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(70, 224, 210, 0.1)';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            LAUNCH NAVIGATOR →
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          padding: 'var(--space-lg) var(--space-xl)',
          borderTop: '1px solid rgba(70, 224, 210, 0.18)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-md)',
          maxWidth: 1100,
          margin: '0 auto',
        }}
      >
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: '#5f7e7d',
          }}
        >
          Modular Spacetime Navigator · Built on X₀(143)
        </span>
        <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
          <a
            href="#/"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              color: '#5f7e7d',
              textDecoration: 'none',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#46e0d2'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#5f7e7d'; }}
          >
            Simulator
          </a>
          <a
            href="https://github.com/astronexus/HYG-Database"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              color: '#5f7e7d',
              textDecoration: 'none',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#46e0d2'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#5f7e7d'; }}
          >
            Star Data: HYG Database
          </a>
        </div>
      </footer>
    </div>
  );
}
