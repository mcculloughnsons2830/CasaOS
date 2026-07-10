# ÆNIGMA (beta)

*A mirror for your consciousness.* Real-time resonance for the archetypes
moving through you — reflect, discover, unlock the hidden.

## What this is

A self-contained web app: an Express server that computes a deterministic,
date-seeded "resonance field" for 10 archetypes, plus a static single-page
app that renders it in the ÆNIGMA terminal aesthetic.

- **Every tester sees the same field on the same day** — the data is seeded
  from the date, so the field feels like a shared living market and advances
  one cycle at 00:00 UTC daily.
- **No database, no API keys.** Reflections are stored in the visitor's
  browser (localStorage) only. One npm dependency (`express`).

## Structure

```
package.json            # repo root — start script + express dependency
aenigma/
  server.js             # Express server + field engine (/api/field, /api/health)
  public/
    index.html          # app shell (topbar, ticker, sidenav, mobile tabbar)
    style.css           # dark terminal theme, responsive, validated chart palette
    app.js              # SPA router + views (Signal, Mirror, detail, Reflect, Pulses, Society)
```

## Run locally

```bash
npm install
npm start          # http://localhost:3000  (PORT env var overrides)
```

## Deploy (Railway)

Connect the repo to a Railway service. Nixpacks detects Node, runs
`npm install` and `npm start`; the server binds `0.0.0.0:$PORT`. Generate a
public domain under Service → Settings → Networking.

## The field engine

- `seriesFor()` in `server.js` runs a seeded random walk (xmur3 → mulberry32
  PRNG) with mean reversion from a fixed epoch (2026-01-01), so history is
  stable and tomorrow extends it by one cycle.
- States: rising (Δ > +0.8), falling (Δ < −0.8), else still — always shown
  with an arrow + text, never color alone.
- Feed, Daily Mirror quote, drops, and pulses are all derived from the same
  daily seed.

## Roadmap candidates (post-beta)

- Claude API-powered Reflection reads (personalized, not templated)
- Accounts + server-side reflections (opt-in)
- Society membership tiers; MsFiZ Studio drop pages
- Push/email pulses

## Disclaimer

The field is simulated. ÆNIGMA is for self-reflection and entertainment —
not medical or psychological advice.
