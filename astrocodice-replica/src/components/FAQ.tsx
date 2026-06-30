// © 2026 MsFitZ Society. All rights reserved. Proprietary — see LICENSE.
import { useState } from 'react'
import { useI18n } from '../i18n'

export default function FAQ() {
  const { t } = useI18n()
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="relative py-16 sm:py-24">
      <div className="container-x max-w-3xl">
        <div className="text-center">
          <span className="eyebrow">{t.faq.eyebrow}</span>
          <h2 className="section-title mt-5">{t.faq.title}</h2>
        </div>

        <div className="mt-12 space-y-3">
          {t.faq.items.map((item, i) => {
            const isOpen = open === i
            return (
              <div key={i} className="glass overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-display text-base font-semibold uppercase tracking-wide text-bone">
                    {item.q}
                  </span>
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line text-ember transition-transform duration-300 ${
                      isOpen ? 'rotate-45' : ''
                    }`}
                  >
                    +
                  </span>
                </button>
                <div
                  className={`grid transition-all duration-300 ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-relaxed text-muted">{item.a}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
