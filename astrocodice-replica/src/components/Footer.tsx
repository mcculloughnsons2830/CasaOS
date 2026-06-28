import Logo from './Logo'
import { useI18n } from '../i18n'

export default function Footer() {
  const { t } = useI18n()
  const year = new Date().getFullYear()
  return (
    <footer className="relative border-t border-line py-14">
      <div className="container-x">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">{t.footer.tagline}</p>
            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-ice/70">{t.brandTag}</p>
          </div>

          {t.footer.cols.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-bone">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-muted transition-colors hover:text-ice-light">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-line pt-8">
          <p className="text-xs leading-relaxed text-muted/70">{t.footer.disclaimer}</p>
          <p className="mt-4 text-xs text-muted/60">
            © {year} MsFitZ Society. {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  )
}
