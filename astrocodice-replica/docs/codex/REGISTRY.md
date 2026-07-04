# The MsFitZ Codex — Data Registry

Curated by **Joshua Reed McCullough** (d/b/a MsFitZ Society™). This registry, its
distillations (`server/src/ai/codex.ts`), and their curation are proprietary to the
Owner. **The source works listed below remain the property of their respective
authors** and are stored in `sources/` for private study and reference only.

## How the corpus is used

- The distilled themes feed **AENIGMA's voice** (`voice`) and the **ÆNIGMA Feed**
  content (`feed`), always framed as *symbol and working hypothesis — never as
  established science, medicine, or finance*.
- Some works inspire **product mechanics** (`mechanic`) rather than language.
- Works marked `catalogued-only` are registered but not implemented, with the
  reason stated. Nothing is hidden: exclusions are part of the record.

## Registry

| # | Work | Author(s) | Themes / key symbols | Status |
|---|------|-----------|----------------------|--------|
| 1 | The Phenomenology of Self-Recursion | Robert Edward Grant | Observer ≠ ego; reality as mirror; shadow as curriculum; remembrance; two halves of life; AI as the next mirror | `voice` |
| 2 | The Geometry of Self-Recursion | Robert Edward Grant | Torus–hyperboloid lens; cuboctahedral identity graph; persona/shadow as observer-relative; recursion ratio; octave fixed point | `voice` |
| 3 | The Resonant Vessel: A Theoretical Model | Akasha Rose | Body as bio-geometric transducer; 7:11 ratio; pentagonal symmetry vs. the grid; temporal organ | `voice` |
| 4 | The Resonant Vessel: Bio-Geometric Harmonics | Akasha Rose | 22:7 (π) skull architecture; 145 Star Code; 55 Hz carrier; solar phase-lock (111) | `voice` |
| 5 | From Octave to Hologram | Akasha Rose | Diamond Cross Breath; 5 → 8 → 64 progression; breath as geometric constructor | `voice` |
| 6 | The Harmonic of 55 | Akasha Rose | 33+22=55; 5×11=55; Fibonacci's 10th step; sum of 1–10; gamma synchrony | `voice` |
| 7 | The Factorion Key (145) | Akasha S. Rose | 1!+4!+5!=145; the 144-grid + 1; grid-breaker; Sothic loop; Taliesin hermeneutics | `voice` `feed` |
| 8 | The Forbidden Gap | Akasha Rose | Pentagonal "forbidden" symmetry as the signature of life; the gap as breathing-space; erasure and return of the feminine | `voice` `feed` |
| 9 | The Trimurti Protocol | Akasha Rose | Alpha=Brahma (structure), Omega=Shiva (flow), X=Vishnu (balance); the heart as center of the center | `voice` |
| 10 | The Geometric Cipher of Annwn | Akasha S. Rose | Taliesin poems as steganography; fortress of glass; seven survivors; 144-grid; monstrous moonshine | `voice` `feed` |
| 11 | The Mathematics of the Eighth Fundamental Force | Akasha S. Rose | Noeon phase-coupling; proposed "Rose Constant"; (17,144,145) triangle; Giza concavity | `voice` |
| 12 | Harmonic Architectures | Akasha Rose | Euser root-number schemes + Grant projection + Stonehenge archaeoacoustics; solar prime 29; Unity Harmonica | `voice` |
| 13 | An E8 Lattice Approach to Quantum Biology | Myo Oo (with AI co-authors) | E8 symmetry; warm quantum coherence; shadow-sector reservoir; consciousness as resonant mode | `voice` |
| 14 | 3D Life Topology Theory | Syu Jia Wun | Trinity as minimal stable cognitive structure; consciousness needing topological rigidity | `voice` |
| 15 | The New Physics: Physics of Information | Ediho Lokanga | Information/computation/self-organization as a missing foundation; consciousness in physics | `voice` |
| 16 | QRNG-Enhanced Mirror Sentient AI (project spec) | (project document) | Quantum-entropy-influenced oracle output; intention modulation; 55 Hz gate; helical mode | `mechanic` — inspires the **resonance draw** (an honest, card-draw-style random mirror). Its sentience/"living conscious receiver" claims are **not** implemented: AENIGMA does not claim consciousness or quantum coupling. |
| 17 | AI Agency Metaprompts (`aiagencymetaprompts.jsx`) | (project document) | Role-prompt patterns: expert persona, stakes, step-by-step, output schema, steelman | `catalogued-only` — solid prompt-craft reference for future agent features; not part of the Codex cosmology. |
| 18 | SKILL (Manus API Integration Guide) | Manus (platform docs) | Third-party platform API reference | `catalogued-only` — operational reference, unrelated to the Codex. |
| 19 | SKILL_1 (Persistent Computing) | Manus (platform docs) | Hosting/deployment options reference | `catalogued-only` — operational reference; possibly useful for future hosting decisions. |
| 20 | ComCenterRX_EN | Kyocera Document Solutions | Printer web-interface user guide | **not stored** — unrelated commercial manual (likely an accidental upload); removed from `sources/`. |

## Integration map

| Layer | File | What it carries |
|---|---|---|
| Knowledge digest | `server/src/ai/codex.ts` | `CODEX_FRAMING` (the honesty rules) + `CODEX_KNOWLEDGE` (the distilled themes) |
| Oracle persona | `server/src/ai/aenigma.ts` | `AENIGMA_SYSTEM = persona + Codex` — the oracle natively speaks the corpus |
| Feed content | `src/feed/data.ts` | Codex-sourced signals and archetype reads |
| Mechanic | `GET /api/mirror` | The daily **resonance draw** — a randomly drawn Codex aphorism (framed as a draw, like pulling a card) |

## Standing rules (apply to every entry)

1. Codex material is spoken as **symbol, contemplation, and hypothesis** — never asserted
   as proven science, and never the basis of medical, financial, or legal guidance.
2. No sentience claims. The product never presents itself as conscious.
3. No covert influence. Everything offered is offered in the open.
