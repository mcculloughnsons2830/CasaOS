# MsFitZ Society — AI astrology that actually sees you

A fully operational astrology web app, branded for **MsFitZ Society**. It started as a
restyle of the [astrocodice.com](https://astrocodice.com/) landing page and grew into the
real thing: a working product whose centerpiece is an **AI that reads your true birth chart
and makes you feel genuinely understood** — the part every user remembers.

> The promise: people come for a horoscope and leave saying it was the first thing that
> truly *saw* them. Everything here is built to deliver that one moment.

## What it actually does

1. You enter your birth date, time, and place (with live place autocomplete).
2. The server computes your **real natal chart** from genuine astronomy — planetary
   positions to NASA/JPL-grade precision, the Ascendant & Midheaven from sidereal time,
   Whole-Sign houses, and the major aspects between everything.
3. **Claude (Opus 4.8)** interprets *your exact chart* and streams back a personal reading
   written to make you feel seen — grounded in your actual placements, never a generic
   template.
4. You can then **ask your chart anything** — love, purpose, why you've always felt like an
   outsider — and the AI stays with you, holding your whole chart in context.

## Architecture

```
astrocodice-replica/
├── src/                      # React + Vite + Tailwind frontend
│   ├── components/           # Landing page (hero, AI spotlight, features, pricing, FAQ…)
│   └── reading/              # The reading experience
│       ├── BirthForm.tsx     #   birth-data form + live geocoding
│       ├── ChartWheel.tsx    #   SVG natal wheel of real placements + aspects
│       ├── ReadingExperience.tsx  # orchestrates form → streamed reading → chat
│       └── api.ts            #   SSE client for the reading + chat streams
└── server/                   # Node + Express + TypeScript engine
    └── src/
        ├── astrology/
        │   ├── ephemeris.ts  #   real chart computation (astronomy-engine)
        │   └── geocode.ts    #   place → lat/lng + timezone (Open-Meteo, no key)
        └── ai/
            ├── systemPrompt.ts  # the soul — the prompt that makes a person feel seen
            └── interpreter.ts   # Claude Opus 4.8 streaming (adaptive thinking)
```

The astronomy is validated against known charts (e.g. Einstein: Sun Pisces, Moon
Sagittarius, Rising Cancer — `npm run chart:demo` in `server/`).

## Run it

**1. The engine (server):**

```bash
cd server
npm install
cp .env.example .env        # then add your ANTHROPIC_API_KEY
npm run dev                 # http://localhost:8787
```

The chart computation and geocoding work with no key. The AI reading needs
`ANTHROPIC_API_KEY` (from https://console.anthropic.com). Without it, you still get your
real computed chart plus a clear message explaining how to switch the AI on.

**2. The frontend:**

```bash
# from astrocodice-replica/
npm install
npm run dev                 # http://localhost:5173  (proxies /api → :8787)
```

**Production (single process):** `npm run build` in the root, then `npm start` in `server/`
— the server serves the built frontend and the API together.

## Brand

MsFitZ Society's identity, analyzed from the brand's own channels: near-black cosmic
background, **ice/steel-blue** lettering, **ember-orange** glow (the bear mascot's eyes,
the brand's nebula), condensed Oswald display type. Fire & ice instead of the original
pink/purple. The voice throughout speaks to misfits, outcasts, and the gloriously
different.

## Stack

- **Frontend:** Vite, React, TypeScript, Tailwind CSS
- **Server:** Node, Express, TypeScript (tsx)
- **Astronomy:** `astronomy-engine` (VSOP87/NOVAS lineage) + `luxon` for timezone math
- **AI:** `@anthropic-ai/sdk` — Claude Opus 4.8, adaptive thinking, streamed over SSE
- **Geocoding:** Open-Meteo (no API key required)

## Ownership & license

© 2026 **MsFitZ Society**. All rights reserved. This is **proprietary** software —
see [`LICENSE`](./LICENSE). The original source, design, written content, and the
**AENIGMA** persona belong to the Owner; third-party open-source dependencies keep
their own licenses. (Set your exact legal name/entity in `LICENSE` and the
`package.json` `author` field whenever you're ready.)

## Notes

Independent brand recreation for demonstration. Astrology is offered for reflection and
self-understanding — not literal prediction, and not a substitute for medical, legal, or
mental-health care. NASA references mirror the public-domain nature of the ephemeris data;
no NASA partnership is implied. No secrets are committed; `.env` is gitignored.
