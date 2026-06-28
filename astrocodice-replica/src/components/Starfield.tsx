import { useMemo } from 'react'

/**
 * Decorative cosmic background — the "fire & ice" nebula of the MsFitZ brand:
 * a near-black sky with an ember-orange glow, an ice-blue glow, and twinkling stars.
 */
export default function Starfield() {
  const stars = useMemo(
    () =>
      Array.from({ length: 90 }).map((_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        delay: Math.random() * 4,
        duration: Math.random() * 3 + 2,
      })),
    [],
  )

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* base gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#0d1422_0%,_#07080c_55%,_#050507_100%)]" />

      {/* ember nebula glow (top-right, like the brand banner fire) */}
      <div className="absolute -right-40 -top-40 h-[36rem] w-[36rem] rounded-full bg-ember/20 animate-pulseGlow" />
      <div className="absolute right-10 top-24 h-72 w-72 rounded-full bg-ember-hot/10 blur-3xl" />

      {/* ice glow (bottom-left) */}
      <div className="absolute -bottom-48 -left-32 h-[34rem] w-[34rem] rounded-full bg-ice/15 animate-pulseGlow [animation-delay:2s]" />

      {/* faint scanline / grid texture */}
      <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(rgba(170,213,238,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(170,213,238,0.6)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* stars */}
      {stars.map((s) => (
        <span
          key={s.id}
          className="absolute rounded-full bg-bone animate-twinkle"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </div>
  )
}
