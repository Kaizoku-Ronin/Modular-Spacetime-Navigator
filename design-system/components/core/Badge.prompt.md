Small mono uppercase tag — tinted fill + accent text. For lane classes, counts, mode tags, or any short status label.

```jsx
<Badge tone="teal">Cruise</Badge>
<Badge tone="violet" pill>105 lanes</Badge>
<Badge tone="dim" outline={false}>HYG</Badge>
```

- `tone`: teal / warn / violet / alert / dim
- `pill`: fully rounded; `outline`: toggle the thin accent border
- For star spectral types use the dedicated `SpectralBadge` instead.
