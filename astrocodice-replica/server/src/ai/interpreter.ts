// Claude-powered chart interpretation — the streaming engine behind the reading
// and the ongoing "ask your chart anything" conversation.
//
// Two providers are supported, chosen by environment:
//   - ANTHROPIC_API_KEY  -> Anthropic SDK directly (Claude Opus 4.8, adaptive thinking)
//   - OPENROUTER_API_KEY -> OpenRouter (OpenAI-compatible gateway), model via OPENROUTER_MODEL
// Keys are read only from the environment — never hard-coded or committed.

import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import type { NatalChart } from '../astrology/types.js'
import { ASTROLOGER_SYSTEM, formatChartForModel } from './systemPrompt.js'

export type ChatTurn = { role: 'user' | 'assistant'; content: string }

type Provider = 'anthropic' | 'openrouter' | 'none'

export function provider(): Provider {
  if (process.env.OPENROUTER_API_KEY) return 'openrouter'
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic'
  return 'none'
}

export function hasApiKey(): boolean {
  return provider() !== 'none'
}

// Anthropic: Opus 4.8 with adaptive thinking — the synthesis of a whole chart
// into something that feels personal is exactly what adaptive thinking is for.
const ANTHROPIC_MODEL = 'claude-opus-4-8'

// Lazily construct clients so the server boots with only one provider configured.
let _anthropic: Anthropic | null = null
function anthropic(): Anthropic {
  if (!_anthropic) _anthropic = new Anthropic()
  return _anthropic
}
let _openrouter: OpenAI | null = null
function openrouter(): OpenAI {
  if (!_openrouter) {
    _openrouter = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': process.env.PUBLIC_URL || 'https://msfitz.society',
        'X-Title': 'MsFitZ Society',
      },
    })
  }
  return _openrouter
}

/** The system prompt + the person's real chart, as one string. */
function systemText(chart: NatalChart): string {
  return (
    ASTROLOGER_SYSTEM +
    "\n\nHere is this person's birth chart, computed from real astronomical data. " +
    'Ground everything you say in these exact placements — do not invent any:\n\n' +
    formatChartForModel(chart)
  )
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

async function run(
  { chart, onText, signal }: StreamArgs,
  messages: ChatTurn[],
  maxTokens: number,
): Promise<void> {
  const sys = systemText(chart)

  if (provider() === 'anthropic') {
    const stream = anthropic().messages.stream(
      {
        model: ANTHROPIC_MODEL,
        max_tokens: maxTokens,
        thinking: { type: 'adaptive' },
        output_config: { effort: 'medium' },
        system: [
          { type: 'text', text: ASTROLOGER_SYSTEM },
          {
            type: 'text',
            text: sys.slice(ASTROLOGER_SYSTEM.length),
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      },
      { signal },
    )
    stream.on('text', onText)
    await stream.finalMessage()
    return
  }

  // OpenRouter (OpenAI-compatible streaming).
  const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-3.7-sonnet'
  const stream = await openrouter().chat.completions.create(
    {
      model,
      max_tokens: maxTokens,
      stream: true,
      messages: [{ role: 'system', content: sys }, ...messages],
    },
    { signal },
  )
  for await (const part of stream) {
    const delta = part.choices?.[0]?.delta?.content
    if (delta) onText(delta)
  }
}

/** Stream the opening reading — the moment a person feels seen. */
export function streamReading(args: StreamArgs): Promise<void> {
  return run(args, [{ role: 'user', content: OPENING_PROMPT }], 4000)
}

/** Continue the conversation — "ask your chart anything." */
export function streamChat(args: StreamArgs, history: ChatTurn[]): Promise<void> {
  return run(args, history, 3000)
}
