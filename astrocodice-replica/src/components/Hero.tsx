// © 2026 Joshua Reed McCullough (MsFitZ Society). All rights reserved. Proprietary — see LICENSE.
import { useI18n } from '../i18n'
import { useLaunch } from '../LaunchContext'

export default function Hero() {
  const { t } = useI18n()
  const launch = useLaunch()

  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="container-x grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Copy */}
        <div className="animate-riseIn">
          <span className="eyebrow">
            <span className="h-2 w-2 rounded-full bg-ember shadow-glow" />
            {t.hero.badge}
          </span>

          <h1 className="headline mt-6 text-5xl sm:text-6xl md:text-7xl">
            {t.hero.title1}
            <br />
            <span className="text-ember">{t.hero.titleAccent}</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{t.hero.sub}</p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <button onClick={() => launch('reading')} className="btn-ember">
              {t.hero.readingCta} ✦
            </button>
            <button onClick={() => launch('oracle')} className="btn-ghost">
              ◈ Consult AENIGMA
            </button>
          </div>

          <p className="mt-6 text-xs uppercase tracking-[0.18em] text-muted/80">{t.hero.trust}</p>
        </div>

        {/* Chart card visual */}
        <div className="relative mx-auto w-full max-w-sm animate-float">
          <div className="absolute -inset-6 rounded-[2rem] bg-brand-grad opacity-20 blur-2xl" />
          <div className="glass relative overflow-hidden rounded-[1.75rem] p-6 shadow-panel">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-ice-light">{t.hero.cardName}</p>
                <p className="mt-1 text-sm text-muted">{t.hero.cardSign}</p>
              </div>
              <span className="grid h-9 w-9 place-items-center rounded-full border border-line text-ember">✦</span>
            </div>

            <ZodiacWheel />

            <div className="mt-5 space-y-3">
              <div className="rounded-xl border border-line bg-white/[0.03] p-3">
                <p className="text-sm text-bone">{t.hero.cardLine1}</p>
              </div>
              <div className="rounded-xl border border-line bg-white/[0.03] p-3">
                <p className="text-sm text-muted">{t.hero.cardLine2}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ZodiacWheel() {
  const planets = ['☉', '☾', '☿', '♀', '♂', '♃', '♄', '♅', '♆', '♇', '☊', '⚷']
  const R = 96
  return (
    <div className="relative mx-auto mt-6 grid h-56 w-56 place-items-center">
      <div className="absolute inset-0 rounded-full border border-line" />
      <div className="absolute inset-4 rounded-full border border-line/70" />
      <div className="absolute inset-10 rounded-full border border-dashed border-ice/30" />
      {/* aspect lines */}
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full opacity-60">
        <polygon points="100,18 168,140 32,140" fill="none" stroke="url(#g)" strokeWidth="1" />
        <line x1="22" y1="80" x2="178" y2="120" stroke="url(#g)" strokeWidth="1" />
        <defs>
          <linearGradient id="g" x1="0" x2="1">
            <stop offset="0" stopColor="#6fb1d6" />
            <stop offset="1" stopColor="#ff8a2b" />
          </linearGradient>
        </defs>
      </svg>
      {planets.map((p, i) => {
        const a = (i / planets.length) * Math.PI * 2 - Math.PI / 2
        return (
          <span
            key={i}
            className="absolute grid h-7 w-7 place-items-center rounded-full border border-line bg-ink-700 text-sm text-ice-light"
            style={{
              transform: `translate(${Math.cos(a) * R}px, ${Math.sin(a) * R}px)`,
            }}
          >
            {p}
          </span>
        )
      })}
      <span className="grid h-12 w-12 place-items-center rounded-full bg-ember-grad text-lg text-ink shadow-glow">
        ✷
      </span>
    </div>
  )
}
