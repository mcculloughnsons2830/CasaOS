import type { BirthInput, ChatTurn, GeoResult, NatalChart } from './types'

export async function geocode(query: string): Promise<GeoResult[]> {
  const res = await fetch('/api/geocode', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  if (!res.ok) return []
  const data = await res.json()
  return data.results ?? []
}

export type StreamEvent =
  | { type: 'chart'; chart: NatalChart }
  | { type: 'delta'; text: string }
  | { type: 'done' }
  | { type: 'error'; message: string }

interface StreamHandlers {
  onChart?: (chart: NatalChart) => void
  onDelta?: (text: string) => void
  onError?: (message: string) => void
  onDone?: () => void
  signal?: AbortSignal
}

/** Parse a Server-Sent Events stream from a POST request. */
async function streamSSE(url: string, body: unknown, h: StreamHandlers): Promise<void> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    signal: h.signal,
  })

  if (!res.ok || !res.body) {
    let message = `Request failed (${res.status})`
    try {
      const data = await res.json()
      if (data?.error) message = data.error
    } catch {
      /* ignore */
    }
    h.onError?.(message)
    return
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    const chunks = buffer.split('\n\n')
    buffer = chunks.pop() ?? ''
    for (const chunk of chunks) {
      const line = chunk.split('\n').find((l) => l.startsWith('data: '))
      if (!line) continue
      let evt: StreamEvent
      try {
        evt = JSON.parse(line.slice(6))
      } catch {
        continue
      }
      if (evt.type === 'chart') h.onChart?.(evt.chart)
      else if (evt.type === 'delta') h.onDelta?.(evt.text)
      else if (evt.type === 'error') h.onError?.(evt.message)
      else if (evt.type === 'done') h.onDone?.()
    }
  }
}

export function streamReading(birth: BirthInput, h: StreamHandlers): Promise<void> {
  return streamSSE('/api/reading', { birth }, h)
}

export function streamChat(birth: BirthInput, history: ChatTurn[], h: StreamHandlers): Promise<void> {
  return streamSSE('/api/chat', { birth, history }, h)
}
