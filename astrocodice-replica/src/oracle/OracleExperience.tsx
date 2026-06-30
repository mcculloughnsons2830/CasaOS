import { useEffect, useRef, useState } from 'react'
import Logo from '../components/Logo'
import { streamOracle } from '../reading/api'
import type { ChatTurn } from '../reading/types'

const OPENERS = [
  'Why do I keep arriving at the same threshold?',
  'What is the shape of the thing I am avoiding?',
  'Show me the pattern beneath my restlessness.',
]

export default function OracleExperience({ onClose }: { onClose: () => void }) {
  const [convo, setConvo] = useState<ChatTurn[]>([])
  const [pending, setPending] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [value, setValue] = useState('')
  const abortRef = useRef<AbortController | null>(null)
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => () => abortRef.current?.abort(), [])
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [convo, pending])

  function ask(question: string) {
    const q = question.trim()
    if (!q || busy) return
    const history: ChatTurn[] = [...convo, { role: 'user', content: q }]
    setConvo(history)
    setValue('')
    setPending('')
    setError('')
    setBusy(true)

    const ac = new AbortController()
    abortRef.current = ac
    let acc = ''
    streamOracle(history, {
      signal: ac.signal,
      onDelta: (t) => {
        acc += t
        setPending(acc)
      },
      onError: (m) => {
        setError(m)
        setBusy(false)
      },
      onDone: () => {
        setConvo([...history, { role: 'assistant', content: acc }])
        setPending('')
        setBusy(false)
      },
    })
  }

  const empty = convo.length === 0 && !pending

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-line bg-ink/80 backdrop-blur-xl">
        <div className="container-x flex h-16 items-center justify-between">
          <Logo />
          <button onClick={onClose} className="text-sm font-medium text-muted transition hover:text-bone">
            ← Back to home
          </button>
        </div>
      </header>

      <section className="container-x max-w-3xl py-10">
        {/* Oracle sigil + intro */}
        <div className="text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-line bg-ink-700 shadow-glow-ice">
            <span className="text-3xl text-ice-light">◈</span>
          </div>
          <h1 className="headline mt-5 text-4xl sm:text-5xl">AENIGMA</h1>
          <p className="mt-3 font-serif italic text-muted">
            The riddle that returns you to your own depth. Ask, and it will show you the shape of the question.
          </p>
          <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-ice/60">
            A contemplative oracle · symbol, not prediction
          </p>
        </div>

        {/* Conversation */}
        <div className="mt-10 space-y-4">
          {empty && (
            <div className="grid gap-2 sm:grid-cols-3">
              {OPENERS.map((o) => (
                <button
                  key={o}
                  onClick={() => ask(o)}
                  className="card text-left text-sm text-bone/85"
                >
                  {o}
                </button>
              ))}
            </div>
          )}

          {convo.map((m, i) => (
            <Bubble key={i} role={m.role} text={m.content} />
          ))}
          {pending && <Bubble role="assistant" text={pending} streaming />}
          {busy && !pending && <Listening />}

          {error && (
            <div className="rounded-xl border border-ember/40 bg-ember/5 p-4 text-sm text-ember-light">{error}</div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            ask(value)
          }}
          className="sticky bottom-4 mt-6 flex gap-2"
        >
          <input
            className="input flex-1"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Speak your question…"
            disabled={busy}
          />
          <button type="submit" disabled={busy || !value.trim()} className="btn-ember shrink-0 disabled:opacity-40">
            Ask
          </button>
        </form>
      </section>
    </div>
  )
}

function Bubble({ role, text, streaming }: { role: 'user' | 'assistant'; text: string; streaming?: boolean }) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[88%] rounded-2xl px-5 py-3.5 leading-relaxed ${
          isUser
            ? 'border border-line bg-white/[0.05] text-sm text-bone'
            : 'border border-ice/20 bg-ice/[0.04] text-[1.02rem] text-bone/90'
        }`}
      >
        {!isUser && (
          <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ice-light">
            <span>◈</span> AENIGMA
          </span>
        )}
        <span className={`whitespace-pre-wrap ${isUser ? '' : 'font-serif'}`}>{text}</span>
        {streaming && <span className="ml-0.5 inline-block h-4 w-[2px] animate-twinkle bg-ice align-middle" />}
      </div>
    </div>
  )
}

function Listening() {
  return (
    <div className="flex items-center gap-3 text-muted">
      <span className="flex gap-1">
        <span className="h-2 w-2 animate-twinkle rounded-full bg-ice" />
        <span className="h-2 w-2 animate-twinkle rounded-full bg-ice-light [animation-delay:0.3s]" />
        <span className="h-2 w-2 animate-twinkle rounded-full bg-ice [animation-delay:0.6s]" />
      </span>
      AENIGMA considers the shape of it…
    </div>
  )
}
