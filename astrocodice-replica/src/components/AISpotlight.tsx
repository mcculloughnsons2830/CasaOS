import { useI18n } from '../i18n'
import { useLaunch } from '../LaunchContext'

export default function AISpotlight() {
  const { t } = useI18n()
  const launch = useLaunch()

  return (
    <section id="ai" className="relative py-16 sm:py-24">
      <div className="container-x">
        <div className="glass relative overflow-hidden rounded-3xl p-8 sm:p-12">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-ember/20 blur-3xl animate-pulseGlow" />
          <div className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-ice/15 blur-3xl" />

          <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <span className="eyebrow">{t.ai.eyebrow}</span>
              <h2 className="section-title mt-5">
                {t.ai.title.split('—')[0]}
                {t.ai.title.includes('—') && <span className="text-ember">—{t.ai.title.split('—')[1]}</span>}
              </h2>
              <p className="mt-5 max-w-xl text-muted">{t.ai.body}</p>
              <ul className="mt-7 space-y-3">
                {t.ai.points.map((p, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-bone/90">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ember-grad text-[11px] text-ink">
                      ✦
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
              <button onClick={launch} className="btn-ember mt-8">
                {t.ai.cta} ✦
              </button>
            </div>

            {/* A glimpse of the experience: a "seen" reading moment */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-brand-grad opacity-20 blur-2xl" />
              <div className="glass relative rounded-2xl p-6">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-ember-grad text-ink">✷</span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-ice-light">MsFitZ AI</span>
                </div>
                <p className="mt-4 font-serif text-[1.05rem] leading-relaxed text-bone/90">
                  With your Moon in Scorpio sitting quietly in the 8th, you’ve always felt things at a depth other
                  people back away from. That wasn’t too much. It was the instrument you came here with.
                </p>
                <div className="mt-5 border-t border-line pt-4">
                  <p className="font-display text-sm italic text-ember">{t.ai.quote}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
