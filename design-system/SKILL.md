---
name: msn-design
description: Use this skill to generate well-branded interfaces and assets for Modular Spacetime Navigator (MSN), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping the dark-void relativistic-flight-sim aesthetic.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy
assets out and create static HTML files for the user to view. If working on
production code, you can copy assets and read the rules here to become an expert
in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they
want to build or design, ask some questions, and act as an expert designer who
outputs HTML artifacts _or_ production code, depending on the need.

## Quick map

- `README.md` — the full design guide: content fundamentals, visual foundations, iconography, index.
- `styles.css` — link this one file; it `@import`s all tokens + fonts.
- `tokens/` — colors, typography, spacing, effects (CSS custom properties).
- `guidelines/` — foundation specimen cards (colors, type, spacing, brand).
- `components/core/` — React primitives: `Button`, `HudPanel`, `DataRow`, `Badge`, `ModePill`, `StatusLine`, `SpectralBadge`, `Slider`. Each has a `.prompt.md` with usage.
- `ui_kits/simulator/` — interactive in-flight overlay HUD.
- `ui_kits/lore/` — scroll-driven worldbuilding / marketing page.
- `assets/` — `favicon.svg` (brand mark), `lore-hero-bg.webp`, `og-image.jpg`, `data/{stars,lanes}.json`.

## The one-paragraph brief

A dark-void space cockpit. Everything sits on near-black `#03050a`. The UI is
translucent **instrument glass** — `rgba(6,12,18,0.72)` panels with a single
teal `#46e0d2` hairline and a 4px backdrop blur, **no drop shadows** (depth comes
from colored glow). Telemetry is **JetBrains Mono**, UPPERCASE, wide-tracked,
tabular numerals; headings are **Space Grotesk**; prose is **Inter light 300**.
Teal = safe/cruise, amber `#ffb648` = flight/caution, violet `#9b59ff` = jump.
Copy is second-person and precise ("Cruising — far from the horizon"), units
always present, never any emoji. The mark is four concentric rings = the four
cusps of X₀(143).
