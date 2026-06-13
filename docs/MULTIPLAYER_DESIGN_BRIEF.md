# Multiplayer Design Brief — Working Document

Prep for the design session. The foundation is now clean and building, so this
lays out the decisions to make, with a recommended default for each and the one
constraint that's genuinely specific to *this* sim. Nothing here is built yet —
it's the agenda.

---

## 0. The shape of the problem (why it's smaller than it looks)

The game is already **instanced by star system**. Flight happens inside one
system's 1-AU scene; the starmap is a shared lobby. So "multiplayer" decomposes
into two channels with very different requirements:

| Channel | Scope | Rate | Payload |
|---|---|---|---|
| **Lobby/presence** | all players | low (~1 Hz / on-change) | which system each player is in, name, color |
| **Flight room** | players in the *same* system | high (~15 Hz) | ship kinematics |

You only ever sync high-rate flight state among the handful of players sharing
one ~1-AU room. That keeps fan-out tiny regardless of total population.

---

## 1. The relativity insight (the one constraint unique to this sim)

Aberration, Doppler, and beaming are **observer-dependent** — each client
already computes them from *its own* `β` and `fwd` (see
`flightRenderer.ts → aberrateLocal/dopplerLocal`). Therefore:

> **Sync raw kinematic state in the system's rest frame; let each client render
> remote ships through its own boost.**

Transmit per ship: `pos` (3), `fwd` (3, or 2 angles), `β` (1), `paused` (bool),
`id`. **Never** transmit "what a player sees" — no Doppler/aberration state goes
on the wire. The shared world *is* the black hole's rest frame; every player's
view is a local Lorentz transform of it. A remote ship at rest-frame position
**p** is drawn by applying *your* aberration to the direction to **p** and *your*
Doppler to its base color. This is both physically right (it's what you'd
actually see) and a big simplification (the network layer is frame-agnostic).

**v1 vs v2 decision:** v1 can place the remote ship at its rest-frame position
and apply only the *observer's* boost. Full fidelity (the remote ship's own
length contraction and time dilation *relative to you*, from the relative
velocity) is a v2 nicety. Worth deciding how far to go — the v1 version is
correct for "where/what color is that ship," just not for "how squashed is it."

---

## 2. Decisions, with a recommended default

**Authority** → *client-authoritative (each client owns its ship), v1.*
There are no competitive stakes in a co-presence sandbox, so a relay that just
rebroadcasts state is enough. Go server-authoritative only if we add collisions,
racing, or combat. → **Decide: is there any interaction beyond seeing each other
fly?**

**Transport** → *WebSocket relay, v1.*
Reliable, ordered, works everywhere, trivial server. 15 Hz of 8 floats per player
is nothing. WebRTC datachannels (lower latency, P2P, unreliable/unordered) are
the upgrade path *if* we go twitchy/competitive — but they add signaling and N²
mesh cost. → **Decide: relay now, datachannel later?**

**Remote-ship smoothing** → *dead-reckoning from `(pos, fwd, β)`.*
Ships move smoothly at constant `β` with gentle gravity bending, so extrapolating
position from velocity between 15 Hz updates hides latency cleanly; snap-correct
on each packet. Entity interpolation (render ~100 ms in the past) is the
alternative if extrapolation overshoots on sharp gravity turns. → **Decide:
extrapolate vs interpolation buffer.**

**Server / hosting** → *a minimal Node `ws` server in this repo (`/server`).*
Fits your self-hosting workflow (deploy beside the testnet on a DO/Vultr box).
Managed options (PartyKit, Colyseus, Ably, Supabase Realtime, Cloudflare Durable
Objects) trade control for zero-ops. → **Decide: self-hosted `ws` vs managed.**

**Identity / persistence** → *ephemeral session id + chosen name/color, v1.*
No accounts. If you want persistent identity, that's a natural tie-in to
`identity.py` / MoonBeam down the line. → **Decide: ephemeral vs accounts.**

**Concurrency target** → drives several of the above. → **Decide: a few friends,
or "anyone can join"?**

---

## 3. Proposed v1 slice (smallest thing worth shipping)

Co-presence only. You see other players as ships in your system, correctly
aberrated/Doppler-shifted in your frame; the starmap shows a live count of who's
in each system; join/leave is graceful. No collisions, no combat, no accounts.

Protocol sketch (JSON or a packed binary frame):
```
C→S  hello   { name, color }                         -> assigned { id }
C→S  enter   { system }                              // joins that room; leaves prior
C→S  state   { pos:[x,y,z], fwd:[x,y,z], beta, paused }   // ~15 Hz, room-scoped
S→C  roster  { system, players:[{id,name,color}] }   // on join/leave
S→C  states  { [id]: {pos,fwd,beta,paused,t} }       // room broadcast, ~15 Hz
S→C  presence{ counts: { [system]: n } }             // lobby/starmap, on-change
```

---

## 4. Where it plugs into the cleaned code

- **`src/net/` (new):** a `NetClient` (WebSocket wrapper: connect, `enter`,
  throttled `state` send, decode `states`/`roster`/`presence`) and a small
  `remotePlayers` store.
- **`SimulatorPage.tsx`:** on mode/system change call `net.enter(system)`; each
  rAF frame push local `{pos,fwd,beta,paused}` (throttled) and read the remote
  store.
- **`flightRenderer.ts`:** add `drawRemoteShips(ctx, s, remote[])` — reuse the
  existing `aberrateLocal` + `project` + `dColor` so remote ships get the *same*
  relativistic treatment as everything else. This is the only renderer change.
- **`starmapRenderer.ts`:** badge each system node with its live player count
  from `presence`. The `spawnPoint` flag already on stars is the hook.
- **`/server/` (new):** ~100-line Node `ws` server — rooms keyed by system,
  rebroadcast within a room, track per-system counts. Self-hostable.

This keeps the relativistic rendering entirely client-side (per §1) and touches
the simulation core in exactly one place (`drawRemoteShips`).

---

## 5. Open questions to settle in the session

1. Interaction model: pure co-presence, or collisions / racing / tag / combat?
   (This is the big fork — it decides authority and transport.)
2. Relativity fidelity for remote ships: observer-boost only (v1) or full
   relative-velocity contraction + clocks (v2)?
3. Hosting: bundle a `ws` server here and deploy to the VPS, or managed realtime?
4. Identity: ephemeral, or wire into your existing identity stack?
5. Concurrency: friends-scale or open? (Sets relay-vs-mesh and server choice.)
6. Does the starmap want *positions* of remote players within a system (a moving
   blip), or just a count per system?
