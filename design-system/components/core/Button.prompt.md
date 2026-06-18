Tonal HUD action button — tinted glass fill, accent hairline, mono uppercase label. Use for any cockpit action; the tone carries meaning.

```jsx
<Button tone="teal">Align</Button>
<Button tone="violet" pulse icon="⇒">Hyperjump</Button>
<Button tone="warn" variant="ghost" size="sm">Flight</Button>
```

- `tone`: `teal` (safe/confirm), `warn` (flight/caution), `violet` (jump), `alert` (destructive)
- `variant`: `solid` (default, tinted fill) or `ghost` (transparent, brightens on hover)
- `size`: `sm` | `md` | `lg`
- `pulse`: adds the violet expanding halo used on the primary hyperjump CTA
- `icon`: leading Unicode glyph (▶ ↻ ⊥) or Lucide node
