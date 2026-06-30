// © 2026 MsFitZ Society. All rights reserved. Proprietary — see LICENSE.
import { useI18n } from '../i18n'

export default function Stats() {
  const { t } = useI18n()
  return (
    <section className="relative py-16 sm:py-20">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="section-title">
            {t.stats.title.split(',')[0]},
            <span className="text-ember"> {t.stats.title.split(',').slice(1).join(',').trim()}</span>
          </h2>
          <p className="mt-4 text-muted">{t.stats.sub}</p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-4">
          {t.stats.items.map((s, i) => (
            <div key={i} className="bg-ink px-6 py-8 text-center">
              <p className="font-display text-3xl font-bold text-brand sm:text-4xl">{s.value}</p>
              <p className="mt-2 text-sm text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
