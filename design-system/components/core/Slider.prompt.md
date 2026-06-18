The touch-friendly HUD range input — a teal gradient track that reads as a fill gauge, with a glowing round thumb. Tone recolors it (teal cruise, amber flight).

```jsx
<Slider label="cruise" min={0.001} max={0.2} step={0.001}
  value={beta} onChange={setBeta} displayValue={`${beta.toFixed(3)} c`} />
<Slider label="size" tone="warn" min={1} max={50} step={1}
  value={scale} onChange={setScale} displayValue={`${scale}x`} />
```

Provide `displayValue` pre-formatted with units. Injects its thumb/track CSS once on mount.
