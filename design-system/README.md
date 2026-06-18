# Modular Spacetime Navigator — Design System

A design system for **Modular Spacetime Navigator (MSN)** — an interactive,
relativistically-correct flight simulator built around the MTFT *X₀(143)* black
hole, extended with a real nearby-star catalog, a 3D starmap, and hyperjumps
between per-star flight systems.

> **The product in one line:** a dark-void space cockpit. You cruise the real
> Sol system, watch stars blueshift as you approach light speed, and hyperjump
> across sixty real stars — all rendered through a translucent teal instrument HUD.

This system captures that look: the near-black void, the teal/cyan readout, the
four-cusp accent ramp, the monospace telemetry voice, and the frosted-glass
panels — so any new artifact (a slide, a landing page, a mock) reads as part of
the Navigator.

---

## Sources

This system was reverse-engineered from the real product. Explore these to do a
better job extending it:

- **GitHub:** <https://github.com/Kaizoku-Ronin/Modular-Spacetime-Navigator>
- **Live app:** <https://kaizoku-ronin.github.io/Modular-Spacetime-Navigator/>
- **Local codebase:** mounted at `msn/` (React + Vite + TypeScript + Tailwind/shadcn).
  Key reads: `src/index.css` (tokens), `src/lib/colors.ts` (the canonical cusp +
  spectral palette), `src/components/*` (the HUD primitives — `HUD`, `Chronometer`,
  `FlightControls`, `ModeSwitchBar`, `Navbar`, `StarInfoPanel`), and
  `src/pages/LorePage.tsx` (the scroll-driven marketing/worldbuilding page).

> Code is AGPL-3.0; content/data/lore are CC BY-SA 4.0 (© 2026 Roger Tano,
> [@Kaizoku-Ronin](https://github.com/Kaizoku-Ronin)). Respect both when reusing.

### The product surfaces

| Surface | What it is | In this system |
|---|---|---|
| **Simulator** | Full-bleed canvas with a fixed overlay HUD. Three modes: Flight, Starmap, Hyperjump. | `ui_kits/simulator/` |
| **Lore page** | Scroll-driven worldbuilding + the MTFT mathematics, star catalog, lane network. | `ui_kits/lore/` |

---

## Content fundamentals

**Two registers, one personality.** MSN writes in two voices that share a love
of precision:

1. **The HUD voice (mono, terse, instrumental).** UPPERCASE labels, single-word
   nouns, values with units. `DISTANCE · 0.605 AU`. `LORENTZ γ · 7.09`.
   `VELOCITY · 0.200 c`. This is the cockpit talking.
2. **The lore voice (Inter light, lyrical, declarative).** Short confident
   fragments building to a point: *"A modular curve at the heart of every star.
   Four cusps bridging cosmological, galactic, stellar, and Planck scales. Sixty
   real stars. One hundred and five hyperspace lanes. This is the geometry that
   connects them."*

**Person.** Second person, directed at the pilot. The HUD reassures *you*:
*"Paused — you can look around safely."* *"Cruising — far from the horizon."*
*"Near horizon — shield holding."* Never corporate "we"; the system speaks to one
operator.

**Casing.**
- Mode + state names are **ALL CAPS**: `FLIGHT`, `STARMAP`, `JUMP`, `HYPERJUMP`,
  `CRUISE`, `ALIGN`, `NORTH UP`.
- Data labels are **UPPERCASE** mono with wide tracking: `DISTANCE`, `TIME COMP`,
  `ABOARD`, `OUTSIDE`, `CONNECTED LANES`.
- Headings are **Title Case** or sentence case in Space Grotesk: *"The Lane
  Network"*, *"Physics of the Simulator"*, *"60 Nearby Stars"*.

**Numbers & units.** Always precise, always tabular, units always present with a
thin space: `0.605 AU`, `0.200 c`, `2.95 km`, `1.016 AU`, `~17 s`, `4.37 ly`,
`5778 K`, `1.000 M☉`. Decimals scale with magnitude (`0.001`–`0.999`). Greek and
scientific glyphs are first-class: `γ` (Lorentz), `β` (velocity fraction), `τ`
(proper time), `c`, `M☉`, `L☉`, `r_s`.

**Punctuation.** Em-dashes carry the rhythm — for status, for asides, for
qualification. Middle dots (`·`) separate inline metadata: `X₀(143) · Modular
Curve Theory`. Mathematical notation is written out: `γ = 1 / √(1 − β²)`,
`rₛ = 2GM/c²`, `D(143) = {1, 11, 13, 143}`.

**Vibe.** Awe grounded in real physics. The copy is proud of being *correct*
("the special relativity is exact"), and unafraid of stillness — *"the emptiness
is the point."* It explains generously but never dumbs down. No hype, no
exclamation marks, no marketing fluff.

**Emoji:** never. The icon vocabulary is Unicode glyphs and Lucide line icons
(see Iconography).

---

## Visual foundations

**The void.** Everything sits on `--void` `#03050a` — a near-black with a faint
blue cast. There is no light theme. Backgrounds are either pure void or a
full-bleed starfield; the lore hero adds a layered illustration of concentric
rings over a faint technical grid (`assets/lore-hero-bg.webp`).

**Color.** A restrained, mostly-monochrome teal world with sparing accent.
- **Teal `#46e0d2`** is the primary — every readout value, hairline, active
  state, "safe/cruise" status. It is the color of the instrument itself.
- **Amber `#ffb648`** = the flight regime / "near-horizon" warning. Used the way
  a real cockpit uses amber: caution, elevated state, never decoration.
- **Violet `#9b59ff`** = Starmap mode + the hyperjump action (with its expanding
  pulse-glow halo).
- **Red `#ff4466`** = destructive / critical only.
- **The four cusps** (`magenta → violet → sky → indigo`) are the *thematic*
  accent ramp, mapped to the divisors of 143 (Planck → stellar → galactic →
  cosmological). **The spectral ramp** (`O/B blue → G yellow → M red → WD`)
  colors stars by type. Both live in `tokens/colors.css`, one source of truth.
- Text is never pure white — it's `--ink` `#cfe7e6` (pale cyan-white), stepping
  down through `--ink-mid` to `--ink-dim` `#5f7e7d` for labels.

**Type.** Three voices: **Space Grotesk** (display/headings, 500/700, tight
`-0.03em` tracking on big sizes), **Inter** (body, *light 300* for the airy lore
prose), **JetBrains Mono** (all telemetry, labels, badges — UPPERCASE, wide
`0.06–0.14em` tracking, `font-variant-numeric: tabular-nums`). Display sizes
fluid via `clamp()`. The mono/uppercase/tracked treatment is the single most
recognizable signal of the brand.

**The signature surface: instrument glass.** Panels are `rgba(6,12,18,0.72)`
with a single `1px` teal hairline at `0.18` alpha, a `4px` backdrop blur, and a
`4px` radius. **No drop shadows anywhere.** Depth comes from (a) layered
hairlines at decreasing alpha (`0.18 → 0.12 → 0.06`) dividing panel sections,
and (b) **glow** — a colored `box-shadow` halo on status dots, slider thumbs, and
the hyperjump CTA. Grey blur shadows are off-brand; if something needs to lift,
it glows.

**Backgrounds & scrims.** No gradients as decoration. The only gradients are
*functional*: the nav fades in from a top scrim (`rgba(3,5,10,0.8) → transparent`)
so it stays legible over the starfield, and the speed-slider track is a teal
gradient (`#1d6b66 → #46e0d2`) acting as a fill gauge. Imagery is cool, dark, and
high-contrast — deep blue-blacks with thin luminous cyan linework. No warm photos,
no grain.

**Borders & radii.** Hairlines are teal-tinted, never grey. Radii are small and
consistent: `4px` for HUD panels/badges/chips, `6px` for control groups, `8px`
(`--radius`) for cards and buttons, `12px` for the bottom mode-dock, `20px` for
pills, `50%` for status dots. Nothing is heavily rounded; the feel is precise
instrumentation, not soft consumer UI.

**Transparency & blur.** Used to keep the canvas behind the HUD visible. Three
blur levels: `4px` (corner readouts), `12px` (dock + nav), `16px` (slide-in side
panel). Panel fill alpha is `0.72`; the side panel goes to `0.82` because it
carries more text.

**Motion.** Quiet and purposeful, governed by three easings:
`--ease-ui cubic-bezier(0.22,1,0.36,1)` (default, a soft decelerate),
`--ease-snap` (overshoot), `--ease-dramatic` (hero/jump reveals).
- **Entrances:** `fadeIn`, `slideUp` (20px), `slideInRight` (panels). Lore
  sections reveal on scroll (GSAP ScrollTrigger), staggered ~0.1s.
- **Ambient loops:** the status dot `pulse` (opacity 0.4↔1, 2s), the cusp-diagram
  rings rotating at prime-numbered speeds, and the hyperjump `pulse-glow` (an
  expanding violet ring). Loops are reserved for *live/active* affordances.
- Durations: `0.15s` fast, `0.2s` base, `0.3s` UI, `0.4s` slow.

**Hover / press.**
- **Hover:** muted controls brighten from `--ink-dim` to their accent color
  (`#5f7e7d → #46e0d2`); tinted buttons deepen their fill (`teal-12 → ~teal-22`);
  table rows get a `rgba(70,224,210,0.04)` wash. Borders go from faint to accent.
- **Press / active:** the active state is shown by a tinted fill + accent border +
  accent text (e.g. the selected mode button: `${color}15` fill, `${color}30`
  border, `color` text). There is no shrink/scale-down press on most controls;
  state is communicated through color, not physics.

**Layout rules.** The simulator is a fixed overlay system: HUD top-left (`z 20`),
chronometer top-right, mode-dock + flight controls bottom-center (`z 40`),
slide-in star panel right (`z 30`), auto-hiding nav top (`z 50`). Corner panels
scale via a JS `--hud-scale` so they never collide on small viewports. The lore
page is a centered single column: `1100px` prose max-width, `100px` (`--space-3xl`)
vertical section rhythm.

---

## Iconography

**Two icon sources, no emoji, no hand-drawn brand SVGs in product copy.**

1. **Lucide** (`lucide-react`, MIT) is the line-icon set — thin, even stroke,
   rounded caps. Used in chrome: `Info`, `Settings`, `Maximize2`/`Minimize2`,
   `X` (close). When building mocks, link Lucide from CDN
   (`https://unpkg.com/lucide@latest`) and match the existing `~18–20px`,
   `~1.5px` stroke, colored `--ink-dim` shifting to `--teal` on hover.
2. **Unicode glyphs** carry most in-HUD affordances — they're typed directly in
   the mono font: `▶` play, `⏸` pause, `↻` reset, `⊥` north-up, `▾` disclosure,
   `←` back, `×` close, `▴/▾`. Astronomical + math glyphs are content, not
   decoration: `☉` (sun / M☉ / L☉), `γ β τ`, `√`, `²`, `≈`, `·`, `←/→/↑`.

**The brand mark** is the four-cusp diagram: concentric rings in
teal → amber → teal with a violet core (`assets/favicon.svg`), echoing X₀(143)'s
four cusps. The animated version (`CuspDiagram`) rotates each ring at a
prime-numbered speed. Treat the rings-over-grid motif as the brand's hero
texture (`assets/lore-hero-bg.webp`).

Rules: never substitute emoji for these glyphs; never introduce a second line-icon
family alongside Lucide; never fill Lucide icons (they are stroke-only). If a
needed icon isn't in Lucide, pick the closest Lucide glyph and keep the stroke
weight consistent.

---

## Index — what's in this system

**Foundations (`tokens/`, linked from root `styles.css`)**
- `tokens/colors.css` — void/ink/teal/status, the four cusps, spectral ramp, hairlines, semantic aliases
- `tokens/typography.css` — the three families, weights, fluid display scale, mono HUD scale, tracking
- `tokens/spacing.css` — 6-step spacing, layout widths, z-index stack
- `tokens/effects.css` — radii, hairline borders, blur levels, glow system, easing, shared keyframes
- `tokens/fonts.css` — Google Fonts import (Space Grotesk / Inter / JetBrains Mono)

**Specimen cards** (`guidelines/` — render in the Design System tab): color palettes, type specimens, spacing, glass/glow/radii, brand mark.

**Components** (`components/` — React primitives under `window.MSNDesignSystem_…`)
- `core/` — `Button`, `HudPanel`, `DataRow`, `Badge`, `ModePill`, `StatusLine`, `SpectralBadge`, `Slider`

**UI kits** (`ui_kits/`)
- `simulator/` — the in-flight overlay HUD (Flight / Starmap modes), interactive
- `lore/` — the scroll worldbuilding + mathematics page

**Templates** (`templates/` — copy-and-go starting points for consumers)
- `deck/` — `MSN Deck`: branded slide deck (title / section / content+glass-panel / big-stat / quote)

**Other**
- `assets/` — `favicon.svg` (brand mark), `lore-hero-bg.webp`, `og-image.jpg`, `data/{stars,lanes}.json`
- `SKILL.md` — Agent-Skills manifest for use in Claude Code

---

## Caveats / substitutions

- **Fonts** are loaded from Google Fonts (all three families are available there —
  no substitution). If you need offline/self-hosted use, vendor the `.woff2`
  files and swap the `@import` in `tokens/fonts.css` for `@font-face` rules.
- The simulator's 3D canvas (WebGL-ish relativistic render, starmap, warp tunnel)
  is **not** reproduced — UI kits recreate the overlay chrome over a static
  starfield, which is where the brand's UI lives.
