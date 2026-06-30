// © 2026 Joshua Reed McCullough (MsFitZ Society). All rights reserved. Proprietary — see LICENSE.
export default function GooglePlayBadge({ label }: { label: string }) {
  return (
    <a href="#download" className="btn-ember group">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d="M3.6 2.3 13 11.7l2.7-2.7L5.2 1.6a1.6 1.6 0 0 0-1.6.7Zm-.4 1.2v17l8.6-8.5L3.2 3.5Zm13.7 6.3 3.6 2.1c.9.5.9 1.7 0 2.2l-3.6 2.1-3-3 3-3.4Zm-1.2 4.2L13 16.7l2.7 2.7 7.5-4.3-.4-.2-4-2.3-2.5 2.6Z" />
      </svg>
      <span className="text-left leading-tight">
        <span className="block text-[10px] font-normal uppercase tracking-wider opacity-80">Get it on</span>
        {label}
      </span>
    </a>
  )
}
