// MsFitZ Society API server.
//
// Endpoints:
//   POST /api/geocode  { query }                 -> place suggestions
//   POST /api/chart    { birth }                 -> computed natal chart (JSON)
//   POST /api/reading  { birth }                 -> SSE: chart event + streamed reading
//   POST /api/chat     { birth, history }         -> SSE: streamed reply
//   GET  /api/health
// In production it also serves the built frontend from ../dist.

import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import express, { type Request, type Response } from 'express'
import cors from 'cors'
import { z } from 'zod'
import { computeChart } from './astrology/ephemeris.js'
import { geocode } from './astrology/geocode.js'
import {
  hasApiKey,
  provider,
  streamChat,
  streamOracle,
  streamReading,
  type ChatTurn,
} from './ai/interpreter.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT) || 8787

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

const birthSchema = z.object({
  name: z.string().max(80).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
  time: z.string().regex(/^\d{2}:\d{2}$/).optional().or(z.literal('')),
  place: z.string().min(1).max(160),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.string().min(1).max(64),
})

const chatSchema = z.object({
  birth: birthSchema,
  history: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().min(1).max(4000) }))
    .min(1)
    .max(40),
})

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ai: hasApiKey(), provider: provider() })
})

app.post('/api/geocode', async (req, res) => {
  try {
    const query = String(req.body?.query ?? '')
    const results = await geocode(query)
    res.json({ results })
  } catch (err) {
    res.status(502).json({ error: (err as Error).message })
  }
})

app.post('/api/chart', (req, res) => {
  const parsed = birthSchema.safeParse(req.body?.birth ?? req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' })
  }
  try {
    const chart = computeChart(normalizeBirth(parsed.data))
    res.json({ chart })
  } catch (err) {
    res.status(400).json({ error: (err as Error).message })
  }
})

// --- Server-Sent Events helpers ---
function openSSE(res: Response) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  })
  res.write('retry: 2000\n\n')
}
function send(res: Response, payload: unknown) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`)
}

function normalizeBirth(b: z.infer<typeof birthSchema>) {
  return { ...b, time: b.time && b.time.length ? b.time : undefined }
}

app.post('/api/reading', async (req: Request, res: Response) => {
  const parsed = birthSchema.safeParse(req.body?.birth ?? req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' })
  }

  openSSE(res)
  const controller = new AbortController()
  req.on('close', () => controller.abort())

  try {
    const chart = computeChart(normalizeBirth(parsed.data))
    send(res, { type: 'chart', chart })

    if (!hasApiKey()) {
      send(res, {
        type: 'error',
        message:
          'The reading engine is not configured yet. Set OPENROUTER_API_KEY (or ANTHROPIC_API_KEY) in server/.env to bring the AI to life. Your real chart above was still computed from live astronomy.',
      })
      return res.end()
    }

    await streamReading(chart, {
      signal: controller.signal,
      onText: (delta) => send(res, { type: 'delta', text: delta }),
    })
    send(res, { type: 'done' })
  } catch (err) {
    if (!controller.signal.aborted) {
      send(res, { type: 'error', message: friendly(err) })
    }
  } finally {
    res.end()
  }
})

app.post('/api/chat', async (req: Request, res: Response) => {
  const parsed = chatSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' })
  }

  openSSE(res)
  const controller = new AbortController()
  req.on('close', () => controller.abort())

  try {
    if (!hasApiKey()) {
      send(res, { type: 'error', message: 'The AI is not configured. Set OPENROUTER_API_KEY or ANTHROPIC_API_KEY in server/.env.' })
      return res.end()
    }
    const chart = computeChart(normalizeBirth(parsed.data.birth))
    await streamChat(chart, parsed.data.history as ChatTurn[], {
      signal: controller.signal,
      onText: (delta) => send(res, { type: 'delta', text: delta }),
    })
    send(res, { type: 'done' })
  } catch (err) {
    if (!controller.signal.aborted) {
      send(res, { type: 'error', message: friendly(err) })
    }
  } finally {
    res.end()
  }
})

const oracleSchema = z.object({
  history: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().min(1).max(4000) }))
    .min(1)
    .max(40),
})

app.post('/api/aenigma', async (req: Request, res: Response) => {
  const parsed = oracleSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' })
  }

  openSSE(res)
  const controller = new AbortController()
  req.on('close', () => controller.abort())

  try {
    if (!hasApiKey()) {
      send(res, { type: 'error', message: 'The oracle is not configured. Set OPENROUTER_API_KEY or ANTHROPIC_API_KEY in server/.env.' })
      return res.end()
    }
    await streamOracle(parsed.data.history as ChatTurn[], {
      signal: controller.signal,
      onText: (delta) => send(res, { type: 'delta', text: delta }),
    })
    send(res, { type: 'done' })
  } catch (err) {
    if (!controller.signal.aborted) {
      send(res, { type: 'error', message: friendly(err) })
    }
  } finally {
    res.end()
  }
})

function friendly(err: unknown): string {
  const msg = (err as Error)?.message ?? 'Something went wrong.'
  if (/api[_ ]?key|authentication/i.test(msg)) {
    return 'The AI could not authenticate. Check OPENROUTER_API_KEY / ANTHROPIC_API_KEY in server/.env.'
  }
  if (/rate|overloaded|529|429/i.test(msg)) {
    return 'The stars are busy right now (rate limit). Give it a moment and try again.'
  }
  return `The reading was interrupted: ${msg}`
}

// Serve the built frontend in production (single-process deploy).
const distPath = path.resolve(__dirname, '../../dist')
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath))
  app.get(/^(?!\/api\/).*/, (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`MsFitZ Society API on http://localhost:${PORT}  (AI ${hasApiKey() ? 'ready' : 'not configured'})`)
})
