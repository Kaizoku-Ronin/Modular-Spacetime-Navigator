Frosted instrument-glass panel — the container for every HUD readout. Translucent fill, single teal hairline, backdrop blur. Optional header with a pulsing dot, title, and tag pill.

```jsx
<HudPanel title="Sol System" dot tag="CRUISE">
  <DataRow label="Distance" value="0.605 AU" />
  <DataRow label="Velocity" value="0.200 c" />
</HudPanel>
```

- `dot` + `dotColor`: pulsing system status indicator
- `tag` + `tagTone`: right-aligned mode tag (CRUISE / FLIGHT)
- `blur`: `hud` (4px corner readouts), `dock` (12px), `panel` (16px side panel)
