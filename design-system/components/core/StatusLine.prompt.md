A glowing status dot + reassuring message, written in the cockpit's second-person voice. Drop at the foot of a HudPanel.

```jsx
<StatusLine status="cruising" />
<StatusLine status="near-horizon" />
<StatusLine status="paused" text="Paused — orbit locked" />
```

Canonical states: `cruising` / `paused` (teal) and `near-horizon` (amber). Override `text` for custom copy but keep the second-person, em-dash style.
