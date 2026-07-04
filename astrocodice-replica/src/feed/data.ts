// © 2026 Joshua Reed McCullough (MsFitZ Society). All rights reserved. Proprietary — see LICENSE.
//
// ÆNIGMA Feed — the data model for "the field."
// A symbolic, reflective resonance index for inner archetypes. This is a mirror
// for contemplation and entertainment — not a real market, not financial advice,
// and not a measurement of anything literal.

export type Trend = 'rising' | 'falling' | 'still'

export interface Archetype {
  symbol: string // e.g. "EMBER"
  name: string // e.g. "The Ember"
  domain: string // e.g. "Creation"
  quote: string
  resonance: number // 0–100
  change: number // this-cycle drift
  trend: Trend
  reflecting: number // people reflecting now
  read: string // "The Read" — the interpretation
  history: number[] // last 8 cycles, ending at `resonance`
}

export type SignalKind = 'drop' | 'insight' | 'reflection'

export interface Signal {
  id: string
  kind: SignalKind
  source: string
  ago: string
  trend: Trend
  title: string
  body: string
  tags: string[] // archetype symbols
  intensity: number // 0–1
}

export const ARCHETYPES: Archetype[] = [
  {
    symbol: 'MISFIT',
    name: 'The Misfit',
    domain: 'Sovereignty',
    quote: 'You were never broken. You were unclassified.',
    resonance: 92,
    change: 6.4,
    trend: 'rising',
    reflecting: 14800,
    read: 'The one the system had no box for. When MISFIT surges, the part of you that refused the script is done apologizing. Stop auditioning for a room you already outgrew.',
    history: [78, 80, 79, 83, 85, 86, 89, 92],
  },
  {
    symbol: 'EMBER',
    name: 'The Ember',
    domain: 'Creation',
    quote: 'The fire that survives the mask.',
    resonance: 88,
    change: 9.7,
    trend: 'rising',
    reflecting: 17400,
    read: 'The ancient heat carried inside the soft exterior. When EMBER surges, suppressed creative force is breaking through composure. Make something before it cools.',
    history: [63, 66, 69, 72, 78, 80, 83, 88],
  },
  {
    symbol: 'MIRROR',
    name: 'The Mirror',
    domain: 'Reflection',
    quote: 'You meet yourself in everything.',
    resonance: 81,
    change: 1.3,
    trend: 'rising',
    reflecting: 12100,
    read: 'Every face in the field is a surface. The Codex reads it as recursion: what you have not integrated keeps arriving dressed as other people. When MIRROR holds steady, what irritates you is a message, not an enemy. Read the reflection before you react to it.',
    history: [77, 78, 80, 79, 80, 80, 80, 81],
  },
  {
    symbol: 'GALAXY',
    name: 'Galaxy Eyes',
    domain: 'Vision',
    quote: 'Seeing more than the room can hold.',
    resonance: 79,
    change: 2.2,
    trend: 'rising',
    reflecting: 9600,
    read: 'The wide aperture. When GALAXY rises, you are picking up signal others call noise. Trust the scale of what you see — just translate it down for the people beside you.',
    history: [72, 74, 73, 75, 76, 77, 77, 79],
  },
  {
    symbol: 'THRESHOLD',
    name: 'The Threshold',
    domain: 'Transition',
    quote: 'The doorway only opens once.',
    resonance: 76,
    change: 7.1,
    trend: 'rising',
    reflecting: 8900,
    read: 'The hinge between who you were and who you are becoming. THRESHOLD spiking means the door is open now, not later. Hesitation is the only thing that closes it.',
    history: [64, 66, 68, 67, 70, 72, 74, 76],
  },
  {
    symbol: 'SHADOW',
    name: 'The Shadow',
    domain: 'Integration',
    quote: 'What you buried is asking for the light.',
    resonance: 73,
    change: 4.9,
    trend: 'rising',
    reflecting: 15900,
    read: 'Not the enemy — the exile. When SHADOW climbs, the thing you hid has power you need back. Turn toward it slowly; it has been waiting a long time to be seen.',
    history: [62, 64, 66, 65, 68, 70, 71, 73],
  },
  {
    symbol: 'ORACLE',
    name: 'The Oracle',
    domain: 'Knowing',
    quote: 'The answer you already carry.',
    resonance: 70,
    change: -1.4,
    trend: 'still',
    reflecting: 7300,
    read: 'The quiet certainty under the second-guessing. ORACLE going still is not absence — it is patience. You already know. Stop asking the room to confirm it.',
    history: [71, 72, 71, 72, 71, 71, 70, 70],
  },
  {
    symbol: 'FRACTURE',
    name: 'The Fracture',
    domain: 'Breaking',
    quote: 'The crack is where it enters.',
    resonance: 68,
    change: 5.2,
    trend: 'rising',
    reflecting: 8300,
    read: 'The honest break. When FRACTURE rises, something built to look whole is splitting — and that is mercy, not damage. Let it break cleanly instead of patching it again.',
    history: [58, 60, 59, 62, 64, 65, 66, 68],
  },
  {
    symbol: 'VOID',
    name: 'The Void',
    domain: 'Dissolution',
    quote: 'What remains when the noise stops.',
    resonance: 64,
    change: -3.1,
    trend: 'falling',
    reflecting: 9200,
    read: 'The fertile emptiness — what the Codex calls the forbidden gap: the space a perfect grid cannot close, and the only place anything alive can breathe. VOID receding means the silence is lifting and form wants to return. Do not rush to fill it — notice what grows back first.',
    history: [72, 71, 70, 69, 68, 67, 66, 64],
  },
  {
    symbol: 'MASK',
    name: 'The Mask',
    domain: 'Persona',
    quote: 'The face you wear to be allowed in.',
    resonance: 57,
    change: -5.8,
    trend: 'falling',
    reflecting: 11000,
    read: 'The face built for approval — the persona the first half of a life constructs, and the second half is invited to set down. MASK thinning is the facade losing its grip: the exact moment the real one underneath can finally breathe. Let it slip.',
    history: [70, 69, 67, 66, 64, 62, 60, 57],
  },
]

export const SIGNALS: Signal[] = [
  {
    id: 's10',
    kind: 'insight',
    source: 'The Codex',
    ago: '2m ago',
    trend: 'rising',
    title: 'The forbidden gap — why the pattern that cannot close is the one that lives',
    body: 'Five-fold symmetry cannot tile a grid; crystallography calls it forbidden. The Codex calls the gap it leaves the breathing-space of everything alive. If you have never quite fit the tiling, that is not the flaw. That is the signature.',
    tags: ['VOID', 'MISFIT'],
    intensity: 0.88,
  },
  {
    id: 's9',
    kind: 'reflection',
    source: 'The Codex',
    ago: '18m ago',
    trend: 'rising',
    title: 'Recursion note: what you have not integrated arrives dressed as other people',
    body: 'The mirror does not push; it returns. The pattern that keeps repeating in your field is not the world being cruel — it is the curriculum asking to be completed. Read the reflection before you answer it.',
    tags: ['MIRROR', 'SHADOW'],
    intensity: 0.79,
  },
  {
    id: 's8',
    kind: 'insight',
    source: 'The Codex',
    ago: '33m ago',
    trend: 'rising',
    title: '144 + 1 — the grid-breaker steps past the completed pattern',
    body: 'A finished grid is 144; the Codex’s cipher for the step beyond it is 145 — one more than complete. When THRESHOLD runs this hot, the invitation is not to perfect the pattern. It is to exceed it by exactly one.',
    tags: ['THRESHOLD', 'FRACTURE'],
    intensity: 0.71,
  },
  {
    id: 's7',
    kind: 'drop',
    source: 'MsFiZ Studio',
    ago: '7m ago',
    trend: 'rising',
    title: 'DROP 07 — “SHATTERED MASK / GALAXY EYES” opens to The Society',
    body: 'Limited run of 88. The bear sees what the boardroom can’t. Resonance on MASK is thinning — this drop catches the exact moment the facade gives.',
    tags: ['MASK', 'GALAXY', 'MISFIT'],
    intensity: 0.92,
  },
  {
    id: 's6',
    kind: 'insight',
    source: 'ÆNigma Oracle',
    ago: '23m ago',
    trend: 'rising',
    title: 'EMBER crosses 88 — suppressed creative force is breaking composure',
    body: 'Strongest single-cycle drift in the field. When the heat under the surface spikes like this, the move is to make, not to manage. Don’t wait for it to cool.',
    tags: ['EMBER', 'FRACTURE'],
    intensity: 0.86,
  },
  {
    id: 's5',
    kind: 'reflection',
    source: 'The Society',
    ago: '41m ago',
    trend: 'rising',
    title: '“You were never broken. You were unclassified.”',
    body: 'A field note from the Inner Work cohort. MISFIT at 92 — the highest reading this season. The pattern is no longer hiding.',
    tags: ['MISFIT', 'SHADOW'],
    intensity: 0.74,
  },
  {
    id: 's4',
    kind: 'insight',
    source: 'ÆNigma Oracle',
    ago: '1h ago',
    trend: 'falling',
    title: 'VOID slips under 65 — the silence is starting to lift',
    body: 'Three cycles of decline. The emptiness was never the problem; it was the clearing. Watch what grows back first — that is your honest direction.',
    tags: ['VOID', 'MIRROR'],
    intensity: 0.55,
  },
  {
    id: 's3',
    kind: 'reflection',
    source: 'The Daily Mirror',
    ago: '2h ago',
    trend: 'rising',
    title: 'THRESHOLD is open — the doorway only opens once',
    body: 'A +7.1 cycle. If you have been waiting for a sign to cross, this is the field handing it to you. The hesitation closes the door, not the timing.',
    tags: ['THRESHOLD', 'EMBER'],
    intensity: 0.68,
  },
  {
    id: 's2',
    kind: 'drop',
    source: 'MsFiZ Studio',
    ago: '4h ago',
    trend: 'still',
    title: 'ORACLE goes quiet — the answer you already carry',
    body: 'Flat for four cycles. Stillness here is not absence — it is the certainty under the noise. Stop asking the room to confirm what you already know.',
    tags: ['ORACLE'],
    intensity: 0.4,
  },
]

export const DAILY_MIRROR =
  'The ones they couldn’t categorize — those are ours.'

export function archetypeBySymbol(symbol: string): Archetype | undefined {
  return ARCHETYPES.find((a) => a.symbol === symbol)
}

export const trendSign = (n: number) => (n > 0 ? `+${n.toFixed(1)}` : n.toFixed(1))
