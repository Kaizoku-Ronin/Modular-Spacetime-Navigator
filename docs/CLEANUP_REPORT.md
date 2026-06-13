# Cleanup Pass — Report

Cleanup of the Kimi-swarm "Modular Spacetime Navigator" before the multiplayer
design session. Every change was verified: `tsc --noEmit` exits 0 and
`vite build` succeeds.

## Headline

The swarm built a solid **single-player** foundation (faithful relativistic
physics, a real 3D starmap, accurate astronomy) but wrapped it in a large
scaffold and **did not implement multiplayer** — it existed only as a
`spawnPoint` flag and "future feature" notes. This pass removes the scaffold,
fixes the data, unifies the visual language, and gets the project building
cleanly on a normal machine so multiplayer can be designed on a clean base.

## Dead code removed

| Removed | Count | Why |
|---|---|---|
| `src/components/ui/*` (shadcn) | 53 files | Nothing in the app imported any of them — UI is hand-rolled. Verified by transitive import-graph walk from entry points (incl. `lazy()` dynamic imports). |
| `src/pages/Home.tsx` | 1 | Unrouted (`/` renders `SimulatorPage`). |
| `src/hooks/use-mobile.ts`, `src/lib/utils.ts` | 2 | Only consumed by the deleted shadcn components. |
| `components.json` | 1 | shadcn config, now moot. |

Source files: **~75 → 20**.

## Dependencies trimmed

Surviving code imports only `react, react-dom, react-router, gsap, lenis,
lucide-react`. Removed **42 unused runtime deps** (26 `@radix-ui/*`, `recharts`,
`zod`, `react-hook-form`, `cmdk`, `vaul`, `embla-carousel-react`, …). Tailwind +
PostCSS retained (the app does use Tailwind classes).

## Portability fixes (these blocked `npm install` on your machine)

- **Removed `plugin-inspect-react-code` / `inspectAttr()`** from `vite.config.ts`
  and devDeps — a Kimi-internal editor plugin not on public npm.
- **Repointed the registry**: deleted the `registry.npmmirror.com`-pinned
  lockfile, added `.npmrc` → `registry.npmjs.org`, regenerated a clean lockfile
  (0 npmmirror references). `npm install` now pulls 249 packages and builds.

## Data integrity fixes (`public/{stars,lanes}.json` is now canonical)

- **Removed the "Toliman" duplicate** (IAU proper name for Alpha Centauri B; was
  a third entry at α Cen's coordinates). **60 → 59 stars.**
- **Normalized Cartesian coordinates** so `|xyz| == distance_ly` exactly —
  residual **5.9% max → 0.001%** (rounding). Directions (RA/dec) preserved.
- **Recomputed all lanes** from the corrected coordinates. Dropped the Toliman
  phantom lanes and the degenerate 0-ly intra-binary lanes (companions at
  identical coordinates). **105 → 82 lanes** (planck 23 / stellar 27 / galactic 32).
- Removed the redundant root-level `stars.json`/`lanes.json` copies (`app/public`
  is the single source now) and the stale `info.md` note that had the
  galactic/stellar (1/11 ↔ 1/13) labels flipped vs. Paper 33.

## Visual language unified

- **One source of truth for cusp colors** — `lib/colors.ts → CUSP_COLORS`. The
  lore page, cusp diagram, lane network, and flight-view rings were each
  hardcoding *different* colors for the same cusp (cyan = "cosmological" in the
  lore but "planck" in the lanes, etc.). All four surfaces now read `CUSP_COLORS`.
- **Freed amber for one job.** Amber (`--warn`) was doing double duty as both the
  near-horizon warning *and* a cusp/lane color. Cusp palette is now a magenta →
  violet → blue → indigo ramp that avoids amber entirely.
- Deduped `LaneNetwork`'s private copies of `getSpectralColor`/`getLaneColor`
  into the shared `colors.ts` helpers.

## Documentation

- Real project `README.md` (run steps, layout, exact-vs-tuned physics, the
  honest note on decorative cusp nomenclature, data provenance).
- Documented in code the deliberate non-physical `RVIS ∝ cbrt(mass)` horizon
  scaling (was mislabeled "exact port"; `GM` is correctly linear in mass).

## Assets

- `lore-hero-bg.png` 4.5 MB → `lore-hero-bg.webp` **50 KB** (1600px, q80).
- `og-image.png` 1.2 MB → `og-image.jpg` **89 KB** (1200×630, the standard OG
  size; JPEG for broad scraper support). References updated.
- `public/` total: **5.7 MB → 180 KB**.

## Verification

```
static import-resolution scan ....... 0 unresolved, 0 missing deps
tsc --noEmit ........................ exit 0
vite build .......................... ✓ 1735 modules, 6.7s
canonical JSON schema ............... matches loader; 59 stars / 82 lanes
lockfile registry ................... 100% registry.npmjs.org
```
