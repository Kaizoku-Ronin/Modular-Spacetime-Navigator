# UI Kit — Simulator

An interactive recreation of the **Modular Spacetime Navigator** in-flight
overlay HUD: the dark void, a parallax starfield, and the translucent teal
instrument chrome that floats over it.

## Run

Open `index.html`. It loads the compiled design-system bundle (`_ds_bundle.js`)
and composes the core primitives over a canvas starfield.

## What's interactive

- **Mode dock (bottom):** switch **Flight ↔ Starmap**. *Jump* enables once a star
  is selected.
- **Flight mode** — the HUD is laid out around the edges to keep the view clear:
  - **Top-center:** the **CRUISE / FLIGHT** speed-mode toggle + **NORTH UP**.
  - **Left rail:** a vertical **TIME COMP** slider.
  - **Right rail:** the **1st / 3rd person VIEW** toggle.
  - **Bottom-center:** **play/pause** + the **speed slider**, just above the dock.
  - **Top-left** telemetry panel + **top-right** relativistic chronometer (ship
    time runs slow vs. galactic; the drift accumulates). Fly fast → amber
    *"near horizon."*
  - **Gear (top-right nav):** opens the **Paint & boost bay** — the ship color
    customizer (`paint-bay.html`) in a slide-in settings panel.
- **Starmap mode:** click a star node to open the slide-in **info panel** (mass,
  class, connected lanes), then **Hyperjump** — a warp flash, then you arrive.

## Files

| File | Role |
|---|---|
| `index.html` | Entry — loads React, the bundle, and the app |
| `SimApp.jsx` | The whole overlay: Nav, HUD panel, Chronometer, TopCluster, TimeCompRail, ViewToggle, SpeedDock, SettingsPanel, Starmap, StarPanel, JumpOverlay |
| `starfield.js` | Plain-canvas parallax starfield (cruise drift → flight streaks) |
| `paint-bay.html` | Ship paint / boost customizer, embedded by the settings gear |

## Components used

`HudPanel`, `DataRow`, `StatusLine`, `ModePill`, `Badge`, `SpectralBadge`,
`Slider`, `Button` — all from `window.MSNDesignSystem_6270fe`.

## Not reproduced

The real product's WebGL relativistic render (aberration / Doppler / beaming),
the true-scale Sol ephemeris, and the 3D orbit-camera starmap. This kit recreates
the **overlay chrome**, which is where the brand's UI lives; the starfield is a
lightweight 2D stand-in.
