# UI Kit — Lore page

A recreation of the **Modular Spacetime Navigator** worldbuilding / marketing
page (`src/pages/LorePage.tsx`): the scroll-driven document that explains the
MTFT mathematics behind the simulator.

## Run

Open `index.html`. Self-contained (tokens via `styles.css`); no bundle required.

## Sections

1. **Hero** — full-bleed `lore-hero-bg.webp` (concentric rings over a technical
   grid), the overline `X₀(143) · Modular Curve Theory`, and the lyrical
   declarative subtitle.
2. **The Four Cusps** — the animated cusp diagram (four rings rotating at
   prime-numbered speeds) + the labeled cusp ramp + the `D(143)` summary.
3. **Physics of the Simulator** — prose + the three formula cards (Lorentz,
   Schwarzschild, lane classification), each keyed to an accent color.
4. **The Lane Network** — animated counters (60 / 105 / 20) + the star catalog
   table with colored spectral badges.

## Brand notes demonstrated

- Inter **light 300** prose, Space Grotesk display headings, mono labels.
- Scroll-reveal entrances (`translateY` + fade, `--ease-ui`), counter count-up,
  prime-speed ring rotation — the page's whole motion vocabulary, with a
  `prefers-reduced-motion` opt-out.
- Functional gradients only (the nav scrim); no decorative gradients.

## Not reproduced

The original's GSAP ScrollTrigger pinning + Lenis smooth-scroll and the live 3D
`LaneNetwork` canvas. The static reveal + count-up here stands in for them.
