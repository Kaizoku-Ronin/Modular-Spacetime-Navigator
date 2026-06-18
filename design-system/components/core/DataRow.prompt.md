One telemetry line — uppercase mono label left, tabular value right. Stack inside a HudPanel to build any readout.

```jsx
<DataRow label="Lorentz γ" value="7.09" />
<DataRow label="Time comp" value="×24" valueColor="#9fd0cb" />
<DataRow label="Outside" value="00:01:14" divider={false} />
```

Use `valueColor="#9fd0cb"` (ink-mid) for secondary/derived metrics; default teal for primary live values.
