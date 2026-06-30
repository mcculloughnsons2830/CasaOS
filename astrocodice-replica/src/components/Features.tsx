// © 2026 MsFitZ Society. All rights reserved. Proprietary — see LICENSE.
import { useI18n } from '../i18n'

export default function Features() {
  const { t } = useI18n()
  return (
    <section id="features" className="relative py-16 sm:py-24">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">{t.features.eyebrow}</span>
          <h2 className="section-title mt-5">{t.features.title}</h2>
          <p className="mt-4 text-muted">{t.features.sub}</p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {t.features.items.map((f, i) => (
            <div key={i} className="card group">
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-ember-grad text-2xl text-ink shadow-glow transition-transform group-hover:scale-110">
                {f.icon}
              </div>
              <h3 className="font-display text-lg font-semibold uppercase tracking-wide text-bone">{f.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
