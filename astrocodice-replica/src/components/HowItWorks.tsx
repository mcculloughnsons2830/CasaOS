import { useI18n } from '../i18n'

export default function HowItWorks() {
  const { t } = useI18n()
  return (
    <section id="how" className="relative py-16 sm:py-24">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">{t.how.eyebrow}</span>
          <h2 className="section-title mt-5">{t.how.title}</h2>
        </div>

        <div className="relative mt-14 grid gap-6 md:grid-cols-4">
          {/* connecting line */}
          <div className="absolute left-0 right-0 top-9 hidden h-px bg-gradient-to-r from-transparent via-ice/40 to-transparent md:block" />
          {t.how.steps.map((s) => (
            <div key={s.n} className="relative text-center md:text-left">
              <div className="mx-auto mb-5 grid h-[4.5rem] w-[4.5rem] place-items-center rounded-2xl border border-line bg-ink-700 font-display text-2xl font-bold text-ember shadow-glow md:mx-0">
                {s.n}
              </div>
              <h3 className="font-display text-lg font-semibold uppercase tracking-wide text-bone">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
