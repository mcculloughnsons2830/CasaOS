import { useI18n } from '../i18n'

export default function Pricing() {
  const { t } = useI18n()
  return (
    <section id="pricing" className="relative py-16 sm:py-24">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">{t.pricing.eyebrow}</span>
          <h2 className="section-title mt-5">{t.pricing.title}</h2>
          <p className="mt-4 text-muted">{t.pricing.sub}</p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {t.pricing.plans.map((p, i) => (
            <div
              key={i}
              className={`relative flex flex-col rounded-2xl border p-7 transition-all duration-300 ${
                p.featured
                  ? 'border-ember/50 bg-white/[0.04] shadow-glow lg:-translate-y-3'
                  : 'border-line bg-white/[0.02] hover:border-ice/40'
              }`}
            >
              {p.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-ember-grad px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ink">
                  ★ Most chosen
                </span>
              )}
              <h3 className="font-display text-xl font-bold uppercase tracking-wide text-bone">{p.name}</h3>
              <p className="mt-1 text-sm text-muted">{p.tagline}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold text-brand">{p.price}</span>
                <span className="text-sm text-muted">{p.period}</span>
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {p.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm text-bone/85">
                    <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${p.featured ? 'bg-ember' : 'bg-ice'}`} />
                    {f}
                  </li>
                ))}
              </ul>

              <a href="#download" className={`mt-7 ${p.featured ? 'btn-ember' : 'btn-ghost'}`}>
                {p.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
