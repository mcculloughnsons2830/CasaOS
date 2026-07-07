// © 2026 Joshua Reed McCullough (MsFitZ Society). All rights reserved. Proprietary — see LICENSE.
//
// The Resonance Draw — the daily mirror.
//
// An honest oracle mechanic inspired by the Codex's quantum-entropy "mirror"
// concept (see docs/codex/REGISTRY.md, entry 16): one aphorism is DRAWN at
// random each day, like pulling a card from a deck. The randomness is
// cryptographic entropy seeded per calendar day — a ritual of chance, framed
// as exactly that. It measures nothing and claims no consciousness.

import { createHash } from 'node:crypto'

export interface MirrorDraw {
  aphorism: string
  archetype: string
  /** How the mechanic works, stated in the open. */
  nature: string
  date: string
}

// Original aphorisms in the Codex register, each paired with the archetype it faces.
const DECK: Array<{ text: string; archetype: string }> = [
  { text: 'The ones they couldn’t categorize — those are ours.', archetype: 'MISFIT' },
  { text: 'What you have not integrated arrives dressed as other people.', archetype: 'MIRROR' },
  { text: 'A grid that closes perfectly has no room for breath. Your gap is the door.', archetype: 'VOID' },
  { text: 'The eye cannot see itself. That is why the world exists.', archetype: 'MIRROR' },
  { text: 'A finished pattern is 144. You are invited to be the one more.', archetype: 'THRESHOLD' },
  { text: 'The first half of a life builds the mask. The second half is allowed to set it down.', archetype: 'MASK' },
  { text: 'What steadies you may be exactly the part of you nothing measures.', archetype: 'SHADOW' },
  { text: 'The exile is not your enemy. It is your curriculum.', archetype: 'SHADOW' },
  { text: 'Structure without flow is a tomb; flow without structure is a flood. The work is the crossing.', archetype: 'ORACLE' },
  { text: 'Let it break cleanly. Mercy sometimes sounds like a crack.', archetype: 'FRACTURE' },
  { text: 'The fire that survives the mask is the only fire worth building with.', archetype: 'EMBER' },
  { text: 'You are picking up signal others call noise. Translate; do not shrink.', archetype: 'GALAXY' },
  { text: 'Stillness is not absence. Some answers hold their breath with you.', archetype: 'ORACLE' },
  { text: 'The treasure of the deep is only carried out by the few who go in.', archetype: 'THRESHOLD' },
]

/** Deterministic per-day draw: same card all day, new card at midnight UTC. */
export function dailyMirror(now = new Date()): MirrorDraw {
  const date = now.toISOString().slice(0, 10)
  const digest = createHash('sha256').update(`msfitz-resonance-draw:${date}`).digest()
  const index = digest.readUInt32BE(0) % DECK.length
  const card = DECK[index]
  return {
    aphorism: card.text,
    archetype: card.archetype,
    nature:
      'A daily draw — one card pulled by chance from the Codex deck. A ritual of reflection, not a measurement.',
    date,
  }
}
