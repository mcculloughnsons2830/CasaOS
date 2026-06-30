// © 2026 Joshua Reed McCullough (MsFitZ Society). All rights reserved. Proprietary — see LICENSE.
/**
 * MsFitZ Society wordmark — references the brand's bear mascot with glowing
 * ember eyes, rendered in pure CSS/SVG (no copyrighted asset reproduced).
 */
export default function Logo({ className = '' }: { className?: string }) {
  return (
    <a href="#top" className={`group flex items-center gap-2.5 ${className}`}>
      <span className="relative grid h-9 w-9 place-items-center rounded-xl border border-line bg-ink-700 shadow-glow-ice">
        {/* bear face */}
        <svg viewBox="0 0 32 32" className="h-6 w-6 text-ice-light" fill="none">
          <circle cx="8" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="24" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M16 7c6 0 10 4.2 10 10.2C26 24 21.5 28 16 28S6 24 6 17.2C6 11.2 10 7 16 7Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          {/* glowing ember eyes */}
          <circle cx="12" cy="16" r="1.7" className="fill-ember" />
          <circle cx="20" cy="16" r="1.7" className="fill-ember" />
          <circle cx="16" cy="21" r="1.3" className="fill-ice-light" />
        </svg>
        <span className="absolute inset-0 rounded-xl ring-1 ring-ember/0 transition group-hover:ring-ember/40" />
      </span>
      <span className="font-display text-lg font-bold uppercase tracking-wide">
        <span className="text-bone">MsFitZ</span>{' '}
        <span className="text-ember">Society</span>
      </span>
    </a>
  )
}
