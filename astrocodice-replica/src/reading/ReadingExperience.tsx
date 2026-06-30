import { useEffect, useRef, useState } from 'react'
import { streamChat, streamReading } from './api'
import BirthForm from './BirthForm'
import ChartWheel from './ChartWheel'
import Logo from '../components/Logo'
import type { BirthInput, ChatTurn, NatalChart } from './types'
import { PLANET_GLYPHS, SIGN_GLYPHS } from './types'

type Step = 'form' | 'reading'

export default function ReadingExperience({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>('form')
  const [birth, setBirth] = useState<BirthInput | null>(null)
  const [chart, setChart] = useState<NatalChart | null>(null)
  const [reading, setReading] = useState('')
  const [readingDone, setReadingDone] = useState(false)
  const [error, setError] = useState('')
  const [convo, setConvo] = useState<ChatTurn[]>([])
  const [pendingReply, setPendingReply] = useState('')
  const [busy, setBusy] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => () => abortRef.current?.abort(), [])

  function start(b: BirthInput) {
    setBirth(b)
    setStep('reading')
    setReading('')
    setReadingDone(false)
    setError('')
    setConvo([])
    setBusy(true)

    const ac = new AbortController()
    abortRef.current = ac
    let acc = ''
    streamReading(b, {
      signal: ac.signal,
      onChart: setChart,
      onDelta: (t) => {
        acc += t
        setReading(acc)
      },
      onError: (m) => {
        setError(m)
        setBusy(false)
      },
      onDone: () => {
        setReadingDone(true)
        setBusy(false)
        setConvo([
          { role: 'user', content: 'Read my chart and tell me what you actually see.' },
          { role: 'assistant', content: acc },
        ])
      },
    })
  }

  function ask(question: string) {
    if (!birth || busy) return
    const history: ChatTurn[] = [...convo, { role: 'user', content: question }]
    setConvo(history)
    setPendingReply('')
    setBusy(true)

    const ac = new AbortController()
    abortRef.current = ac
    let acc = ''
    streamChat(birth, history, {
      signal: ac.signal,
      onDelta: (t) => {
        acc += t
        setPendingReply(acc)
      },
      onError: (m) => {
        setError(m)
        setBusy(false)
      },
      onDone: () => {
        setConvo([...history, { role: 'assistant', content: acc }])
        setPendingReply('')
        setBusy(false)
      },
    })
  }

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

      {step === 'form' && (
        <section className="container-x py-16 sm:py-24">
          <div className="mx-auto max-w-lg text-center">
            <span className="eyebrow">The Reading</span>
            <h1 className="headline mt-5 text-4xl sm:text-5xl">
              Let’s find <span className="text-ember">the real you</span>
            </h1>
            <p className="mt-4 text-muted">
              Tell us when and where you arrived. We’ll compute your true sky from live astronomy — then the
              MsFitZ AI will read it back to you like someone who finally gets it.
            </p>
          </div>
          <div className="mt-12">
            <BirthForm onSubmit={start} />
          </div>
        </section>
      )}

      {step === 'reading' && (
        <section className="container-x grid gap-10 py-12 lg:grid-cols-[minmax(0,360px)_1fr]">
          {/* Chart column */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            {chart ? (
              <>
                <div className="glass p-5">
                  <ChartWheel chart={chart} />
                </div>
                <ChartSummary chart={chart} />
              </>
            ) : (
              <div className="glass grid h-[360px] place-items-center text-muted">Computing your sky…</div>
            )}
          </aside>

          {/* Reading + chat column */}
          <div>
            <span className="eyebrow">
              <span className="h-2 w-2 rounded-full bg-ember shadow-glow" />
              {chart?.input.name ? `${chart.input.name}, this is your chart` : 'Your reading'}
            </span>

            <div className="mt-6 glass p-6 sm:p-8">
              {reading ? (
                <Prose text={reading} streaming={!readingDone && busy} />
              ) : busy ? (
                <ThinkingDots label="The AI is reading your sky" />
              ) : null}

              {error && (
                <div className="mt-4 rounded-xl border border-ember/40 bg-ember/5 p-4 text-sm text-ember-light">
                  {error}
                </div>
              )}
            </div>

            {/* Conversation */}
            {convo.length > 2 && (
              <div className="mt-6 space-y-4">
                {convo.slice(2).map((m, i) => (
                  <Bubble key={i} role={m.role} text={m.content} />
                ))}
              </div>
            )}
            {pendingReply && <Bubble role="assistant" text={pendingReply} streaming />}

            {readingDone && (
              <ChatBox busy={busy} onAsk={ask} />
            )}
          </div>
        </section>
      )}
    </div>
  )
}

function Prose({ text, streaming }: { text: string; streaming?: boolean }) {
  const paras = text.split(/\n{2,}/).filter(Boolean)
  return (
    <div className="space-y-4">
      {paras.map((p, i) => (
        <p key={i} className="font-serif text-[1.05rem] leading-relaxed text-bone/90">
          {p}
          {streaming && i === paras.length - 1 && <span className="ml-0.5 inline-block h-5 w-[2px] animate-twinkle bg-ember align-middle" />}
        </p>
      ))}
    </div>
  )
}

function Bubble({ role, text, streaming }: { role: 'user' | 'assistant'; text: string; streaming?: boolean }) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser ? 'border border-line bg-white/[0.05] text-bone' : 'border border-ice/20 bg-ice/[0.04] text-bone/90'
        }`}
      >
        {!isUser && <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ice-light">MsFitZ AI</span>}
        <span className="whitespace-pre-wrap font-serif">{text}</span>
        {streaming && <span className="ml-0.5 inline-block h-4 w-[2px] animate-twinkle bg-ember align-middle" />}
      </div>
    </div>
  )
}

function ChatBox({ busy, onAsk }: { busy: boolean; onAsk: (q: string) => void }) {
  const [value, setValue] = useState('')
  const suggestions = ['Why do I feel like an outsider?', 'What about love for me?', 'What am I here to do?']
  function submit(e: React.FormEvent) {
    e.preventDefault()
    const q = value.trim()
    if (!q || busy) return
    onAsk(q)
    setValue('')
  }
  return (
    <div className="mt-7">
      <div className="mb-3 flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            disabled={busy}
            onClick={() => onAsk(s)}
            className="rounded-full border border-line bg-white/[0.03] px-3 py-1.5 text-xs text-muted transition hover:border-ice/40 hover:text-bone disabled:opacity-40"
          >
            {s}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="flex gap-2">
        <input
          className="input flex-1"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ask your chart anything…"
          disabled={busy}
        />
        <button type="submit" disabled={busy || !value.trim()} className="btn-ember shrink-0 disabled:opacity-40">
          Ask
        </button>
      </form>
    </div>
  )
}

function ThinkingDots({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-muted">
      <span className="flex gap-1">
        <span className="h-2 w-2 animate-twinkle rounded-full bg-ember" />
        <span className="h-2 w-2 animate-twinkle rounded-full bg-ice [animation-delay:0.3s]" />
        <span className="h-2 w-2 animate-twinkle rounded-full bg-ember [animation-delay:0.6s]" />
      </span>
      {label}…
    </div>
  )
}

function ChartSummary({ chart }: { chart: NatalChart }) {
  return (
    <div className="mt-5 glass p-5">
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          ['Sun', chart.sunSign],
          ['Moon', chart.moonSign],
          ['Rising', chart.risingSign ?? '—'],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-line bg-white/[0.02] p-3">
            <div className="text-lg text-ice-light">{SIGN_GLYPHS[v as string] ?? '✦'}</div>
            <div className="mt-1 text-[10px] uppercase tracking-wider text-muted">{k}</div>
            <div className="text-xs text-bone">{v}</div>
          </div>
        ))}
      </div>

      <ul className="mt-4 space-y-1.5">
        {chart.placements.map((p) => (
          <li key={p.body} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-bone/85">
              <span className="w-5 text-center text-ice-light">{PLANET_GLYPHS[p.body]}</span>
              {p.body}
            </span>
            <span className="text-muted">
              {p.sign} {p.degreeInSign.toFixed(0)}°{p.retrograde ? ' ℞' : ''}
              {p.house ? <span className="ml-1 text-ice/60">· h{p.house}</span> : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
