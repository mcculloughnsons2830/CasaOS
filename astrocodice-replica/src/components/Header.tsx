// © 2026 MsFitZ Society. All rights reserved. Proprietary — see LICENSE.
import { useEffect, useState } from 'react'
import Logo from './Logo'
import { LANGS, useI18n } from '../i18n'
import { useLaunch } from '../LaunchContext'

export default function Header() {
  const { t, lang, setLang } = useI18n()
  const launch = useLaunch()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { href: '#features', label: t.nav.features },
    { href: '#how', label: t.nav.how },
    { href: '#pricing', label: t.nav.pricing },
    { href: '#faq', label: t.nav.faq },
  ]

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-line bg-ink/80 backdrop-blur-xl' : 'border-b border-transparent'
      }`}
    >
      <div className="container-x flex h-16 items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted transition-colors hover:text-bone"
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={() => launch('oracle')}
            className="text-sm font-medium text-ice-light transition-colors hover:text-bone"
          >
            ◈ AENIGMA
          </button>
        </nav>

        <div className="flex items-center gap-3">
          {/* language switcher */}
          <div className="hidden items-center rounded-full border border-line bg-white/[0.03] p-0.5 sm:flex">
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                  lang === l.code ? 'bg-ice/20 text-ice-light' : 'text-muted hover:text-bone'
                }`}
                aria-pressed={lang === l.code}
              >
                {l.label}
              </button>
            ))}
          </div>

          <a href="#download" className="hidden btn-ember sm:inline-flex">
            {t.nav.cta}
          </a>

          <button
            className="grid h-10 w-10 place-items-center rounded-lg border border-line text-bone md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            <span className="text-xl">{open ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {/* mobile menu */}
      {open && (
        <div className="border-t border-line bg-ink/95 backdrop-blur-xl md:hidden">
          <div className="container-x flex flex-col gap-1 py-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-bone hover:bg-white/5"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-2 flex items-center gap-2 px-3">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`rounded-full border border-line px-3 py-1.5 text-xs font-semibold ${
                    lang === l.code ? 'bg-ice/20 text-ice-light' : 'text-muted'
                  }`}
                >
                  {l.flag} {l.label}
                </button>
              ))}
            </div>
            <a href="#download" onClick={() => setOpen(false)} className="btn-ember mt-3">
              {t.nav.cta}
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
