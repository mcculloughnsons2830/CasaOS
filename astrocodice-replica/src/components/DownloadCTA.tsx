import { useI18n } from '../i18n'
import GooglePlayBadge from './GooglePlayBadge'

export default function DownloadCTA() {
  const { t } = useI18n()
  return (
    <section id="download" className="relative py-16 sm:py-24">
      <div className="container-x">
        <div className="glass relative overflow-hidden rounded-3xl px-6 py-14 text-center sm:px-12 sm:py-20">
          <div className="absolute inset-0 bg-brand-grad opacity-[0.07]" />
          <div className="absolute -top-20 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full bg-ember/25 blur-3xl animate-pulseGlow" />

          <div className="relative">
            <h2 className="headline mx-auto max-w-2xl text-4xl sm:text-5xl md:text-6xl">
              {t.cta.title}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-muted">{t.cta.sub}</p>
            <div className="mt-9 flex justify-center">
              <GooglePlayBadge label={t.cta.button} />
            </div>
            <p className="mt-6 text-xs uppercase tracking-[0.18em] text-muted/80">{t.cta.note}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
