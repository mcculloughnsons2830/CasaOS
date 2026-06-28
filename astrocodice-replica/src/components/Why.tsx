import { useI18n } from '../i18n'

export default function Why() {
  const { t } = useI18n()
  return (
    <section className="relative py-16 sm:py-24">
      <div className="container-x">
        <div className="glass relative overflow-hidden rounded-3xl p-8 sm:p-14">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-ember/15 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-ice/15 blur-3xl" />

          <div className="relative grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div>
              <span className="eyebrow">{t.why.eyebrow}</span>
              <h2 className="section-title mt-5">{t.why.title}</h2>
            </div>
            <div>
              <p className="font-serif text-lg leading-relaxed text-bone/90">{t.why.body}</p>
              <ul className="mt-7 space-y-3">
                {t.why.points.map((p, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ember-grad text-[11px] text-ink">
                      ✓
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
