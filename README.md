# Modular Spacetime Navigator

**▶ Play it live: https://kaizoku-ronin.github.io/Modular-Spacetime-Navigator/**

An interactive, relativistically-correct flight simulator built around MTFT's
X₀(143) black hole, extended with a real nearby-star catalog, a 3D starmap, and
hyperjumps between per-star flight systems. The **Sol** system renders the actual
planets — positions computed live from J2000 Keplerian ephemeris — at true scale.

Three modes: **Flight** (in Sol, cruise the real solar system; every other star
is a 1-AU black-hole scene), **Starmap** (3D catalog + hyperspace lanes), and
**Hyperjump** (warp transition).

Works on desktop and touch devices. **Desktop:** drag to steer, scroll or the
on-screen slider for speed, `Space` to pause, `Tab` to switch modes, `R` to
reset. **Mobile:** drag to steer, on-screen pause + speed controls, tap the bar
to switch modes, pinch the starmap to zoom.

Speed has two modes: **Cruise** (0.001–0.2c, for realistic solar-system transit)
and **Flight** (0.25–0.99c, full relativistic regime). In Sol, a **planet-size
slider** (1–50×) magnifies the otherwise true-scale — and therefore tiny —
planets so you can pick them out as you cross the system.

## Run

```bash
npm install        # public npm registry (see .npmrc)
npm run dev        # http://localhost:3000
npm run build      # production build -> dist/
npm run preview    # serve the built bundle
```

Requires Node 18+. No backend — this is a static single-player app.
(Multiplayer is **not** implemented; see `../MULTIPLAYER_DESIGN_BRIEF.md`.)

## Layout

```
src/
  canvas/          imperative canvas renderers (rAF loops)
    flightRenderer.ts    relativistic flight sim (aberration/Doppler/beaming)
    solarRenderer.ts     real Sol system drawn into the flight camera (Sol only)
    starmapRenderer.ts   3D star + lane map (orbit camera)
    jumpRenderer.ts      hyperjump warp transition
  components/      hand-rolled UI (no component library) + chart widgets
  data/
    starData.ts    loads public/{stars,lanes}.json into typed records
    solarSystem.ts J2000 Keplerian ephemeris — 8 planets + dwarfs (Sol only)
  lib/
    math3d.ts      vec3 + projection (shared with the original HTML sim)
    colors.ts      spectral colors, Doppler ramp, and the canonical CUSP_COLORS
  pages/           SimulatorPage (modes) + LorePage (worldbuilding)
public/
  stars.json       59 stars within ~20 ly (canonical)
  lanes.json       82 hyperspace lanes (recomputed from corrected coords)
```

## Physics: exact vs. tuned

The **special relativity is exact** and ported verbatim from the original sim:
aberration `cosθ' = (cosθ+β)/(1+β·cosθ)`, Doppler `D = 1/(γ(1−β·cosθ'))`,
beaming `∝ D²`, `γ = 1/√(1−β²)`, proper-time `dτ = dt/γ`, plus orbital Doppler
on the accretion disk.

**Relativistic chronometer (twin paradox).** A persistent journey clock compares
*Standard Galactic Time* (coordinate time — all the catalog stars share it,
since they're mutually at rest) against the *ship's proper time*, which runs slow
during fast flight. The drift accumulates across flights and hyperjumps and
persists across reloads (`localStorage`), so flying at 0.99c for two minutes of
galactic time leaves your ship clock ~17 s behind. See `lib/clock.ts` +
`components/Chronometer.tsx`. Reset it from the panel (it's independent of the
flight `R` reset, which only repositions you).

**The Sol system (real data).** When the current star is Sol, the flight scene
swaps the black hole for the actual solar system. Planet positions are computed
each frame from J2000 Keplerian elements plus their century rates (Standish),
solved through Kepler's equation — so the layout matches the real sky for today's
date (Earth lands at ~1.016 AU and its true heliocentric longitude). Radii are
true-scale and the Sun's color comes from a 5778 K blackbody, which is exactly
why the planets read as faint dots until you fly close or raise the size slider:
the emptiness is the point. The same exact SR optics still apply, and because you
move at a *true* fraction of c, crossing even 1 AU at 0.2c takes a realistically
long time.

**Tuned for playability (not physical), and labeled as such in code:**
- Gravity bends heading but holds your chosen cruise speed (arcade flight).
- In **Sol**, a bounded gravity *sway* gently leans the camera toward the nearest
  mass — it's a settling positional offset, never a velocity, so it can't
  accumulate into a crash.
- Per-system horizon radius scales as `cbrt(mass)`, **not** the physical
  `r_s ∝ mass`, so every system in the catalog is flyable. `GM` *is* linear in
  mass (correct). See the comment in `flightRenderer.ts → initFlightState`.

## On the MTFT "cusp" nomenclature

`cusp_class` on lanes (`planck`/`stellar`/`galactic`) is **decorative**: a
length-binning of lanes that borrows three of the four D(143) cusp names. It is
not derived modular structure. The fourth cusp, **cosmological (width 143)**, is
the system / de Sitter scale and is intentionally not a star-to-star lane class
(consistent with Paper 33 §6.1). All four cusp colors live in one place —
`lib/colors.ts → CUSP_COLORS` — and every surface (lore, cusp diagram, lane
network, flight-view rings) reads from it.

## Data provenance

Star positions/distances/magnitudes are from standard nearby-star catalogs (HYG
lineage). Cartesian coordinates are normalized so `|xyz| == distance_ly`. Binary
components intentionally share coordinates. The IAU-alias duplicate "Toliman"
(= Alpha Centauri B) has been removed.

## Licensing

This repository is **dual-licensed by component**, since it contains both
software and creative/academic content.

**Code** — everything under `src/`, the build configuration, and the application
itself — is licensed under the **GNU Affero General Public License v3.0**
(AGPL-3.0). See [`LICENSE`](./LICENSE). You're free to use, study, modify, and
self-host it; but if you distribute it *or run a modified version as a network
service*, you must make your source available under the same license.

**Content** — the worldbuilding/lore text, the design documents in `docs/`, and
the curated datasets in `public/` (`stars.json`, `lanes.json`, derived from the
HYG star database, itself CC BY-SA) — is licensed under **Creative Commons
Attribution-ShareAlike 4.0 International** (CC BY-SA 4.0). See
[`LICENSE-content`](./LICENSE-content). Reuse with attribution; derivatives
share alike.

The Modular Time Field Theory (MTFT) research this project draws on is likewise
published under CC BY-SA 4.0.

> Copyright © 2026 Roger Tano ([@Kaizoku-Ronin](https://github.com/Kaizoku-Ronin)).
> Code: AGPL-3.0. Content: CC BY-SA 4.0.

Third-party dependencies retain their own licenses (React, Vite, react-router,
lenis, lucide-react — MIT; GSAP — free for commercial use under Webflow's custom
license, not OSI-open). Your repository license does not override theirs.
