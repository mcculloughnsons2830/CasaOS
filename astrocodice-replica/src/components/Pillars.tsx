// © 2026 Joshua Reed McCullough (MsFitZ Society). All rights reserved. Proprietary — see LICENSE.
import { useI18n } from '../i18n'

const icons = ['🛰️', '🧠', '🛡️']

export default function Pillars() {
  const { t } = useI18n()
  return (
    <section className="relative py-16 sm:py-24">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">{t.pillars.eyebrow}</span>
          <h2 className="section-title mt-5">{t.pillars.title}</h2>
          <p className="mt-4 text-muted">{t.pillars.sub}</p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {t.pillars.items.map((p, i) => (
            <div key={i} className="card">
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl border border-line bg-ink-700 text-2xl">
                {icons[i]}
              </div>
              <h3 className="font-display text-xl font-semibold uppercase tracking-wide text-bone">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
