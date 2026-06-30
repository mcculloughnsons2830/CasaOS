// Claude-powered chart interpretation — the streaming engine behind the reading
// and the ongoing "ask your chart anything" conversation.

import Anthropic from '@anthropic-ai/sdk'
import type { NatalChart } from '../astrology/types.js'
import { ASTROLOGER_SYSTEM, formatChartForModel } from './systemPrompt.js'

// Default client resolves ANTHROPIC_API_KEY from the environment.
const client = new Anthropic()

// Opus 4.8 with adaptive thinking — the synthesis of a whole chart into something
// that feels personal is exactly the kind of reasoning adaptive thinking is for.
const MODEL = 'claude-opus-4-8'

export type ChatTurn = { role: 'user' | 'assistant'; content: string }

export function hasApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY)
}

/** System prompt + the person's real chart, with the chart cached per session. */
function systemBlocks(chart: NatalChart): Anthropic.TextBlockParam[] {
  return [
    { type: 'text', text: ASTROLOGER_SYSTEM },
    {
      type: 'text',
      text:
        "Here is this person's birth chart, computed from real astronomical data. " +
        'Ground everything you say in these exact placements — do not invent any:\n\n' +
        formatChartForModel(chart),
      cache_control: { type: 'ephemeral' },
    },
  ]
}

const OPENING_PROMPT =
  "I've just arrived at MsFitZ Society, and this is my first reading. " +
  'Read my chart and tell me what you actually see — the real me, the parts most people miss. ' +
  'I want to feel like something finally sees me.'

interface StreamArgs {
  chart: NatalChart
  onText: (delta: string) => void
  signal?: AbortSignal
}

/** Stream the opening reading — the moment a person feels seen. */
export async function streamReading({ chart, onText, signal }: StreamArgs): Promise<void> {
  const stream = client.messages.stream(
    {
      model: MODEL,
      max_tokens: 4000,
      thinking: { type: 'adaptive' },
      output_config: { effort: 'medium' },
      system: systemBlocks(chart),
      messages: [{ role: 'user', content: OPENING_PROMPT }],
    },
    { signal },
  )
  stream.on('text', onText)
  await stream.finalMessage()
}

/** Continue the conversation — "ask your chart anything." */
export async function streamChat(
  { chart, onText, signal }: StreamArgs,
  history: ChatTurn[],
): Promise<void> {
  const stream = client.messages.stream(
    {
      model: MODEL,
      max_tokens: 3000,
      thinking: { type: 'adaptive' },
      output_config: { effort: 'medium' },
      system: systemBlocks(chart),
      messages: history.map((t) => ({ role: t.role, content: t.content })),
    },
    { signal },
  )
  stream.on('text', onText)
  await stream.finalMessage()
}
