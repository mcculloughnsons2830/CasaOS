// © 2026 MsFitZ Society. All rights reserved. Proprietary — see LICENSE.
import type { NatalChart } from './types'
import { PLANET_GLYPHS, SIGN_GLYPHS } from './types'

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
]

const ASPECT_COLOR: Record<string, string> = {
  conjunction: '#ffb066',
  sextile: '#7db4d6',
  trine: '#6fb1d6',
  square: '#ff6a18',
  opposition: '#e8590c',
}

// Ecliptic longitude -> screen angle. 0° Aries at the left, increasing counter-clockwise.
function angleFor(longitude: number): number {
  return (180 - longitude) * (Math.PI / 180)
}
function pointAt(cx: number, cy: number, r: number, longitude: number) {
  const a = angleFor(longitude)
  return { x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) }
}

export default function ChartWheel({ chart }: { chart: NatalChart }) {
  const size = 360
  const cx = size / 2
  const cy = size / 2
  const rOuter = 172
  const rSign = 156
  const rPlanet = 120
  const rAspect = 96

  const points = [
    ...chart.placements.map((p) => ({ name: p.body, longitude: p.longitude })),
    ...chart.angles.map((a) => ({ name: a.name, longitude: a.longitude })),
  ]
  const longOf = (n: string) => points.find((p) => p.name === n)?.longitude

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-auto w-full max-w-[360px]">
      <defs>
        <radialGradient id="wheelGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#11151f" />
          <stop offset="100%" stopColor="#07080c" />
        </radialGradient>
      </defs>

      <circle cx={cx} cy={cy} r={rOuter} fill="url(#wheelGlow)" stroke="rgba(170,213,238,0.18)" />
      <circle cx={cx} cy={cy} r={rSign - 4} fill="none" stroke="rgba(170,213,238,0.12)" />
      <circle cx={cx} cy={cy} r={rPlanet + 12} fill="none" stroke="rgba(170,213,238,0.10)" />
      <circle cx={cx} cy={cy} r={rAspect} fill="none" stroke="rgba(255,138,43,0.14)" />

      {/* sign sectors + glyphs */}
      {SIGNS.map((sign, i) => {
        const start = pointAt(cx, cy, rOuter, i * 30)
        const sx = cx + rSign * Math.cos(angleFor(i * 30 + 15))
        const sy = cy - rSign * Math.sin(angleFor(i * 30 + 15))
        return (
          <g key={sign}>
            <line x1={cx} y1={cy} x2={start.x} y2={start.y} stroke="rgba(170,213,238,0.08)" />
            <text
              x={sx}
              y={sy}
              fill="#a9d5ee"
              fontSize="13"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {SIGN_GLYPHS[sign]}
            </text>
          </g>
        )
      })}

      {/* aspect lines */}
      {chart.aspects.slice(0, 18).map((asp, i) => {
        const la = longOf(asp.a)
        const lb = longOf(asp.b)
        if (la == null || lb == null) return null
        const pa = pointAt(cx, cy, rAspect, la)
        const pb = pointAt(cx, cy, rAspect, lb)
        return (
          <line
            key={i}
            x1={pa.x}
            y1={pa.y}
            x2={pb.x}
            y2={pb.y}
            stroke={ASPECT_COLOR[asp.type]}
            strokeWidth={asp.type === 'conjunction' ? 0 : 1}
            strokeOpacity={0.5}
          />
        )
      })}

      {/* angles (Asc / MC) */}
      {chart.angles.map((a) => {
        const p = pointAt(cx, cy, rOuter, a.longitude)
        return (
          <g key={a.name}>
            <line x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,138,43,0.5)" strokeWidth={1.2} />
            <text x={p.x} y={p.y} fill="#ff8a2b" fontSize="10" textAnchor="middle" dominantBaseline="central">
              {PLANET_GLYPHS[a.name]}
            </text>
          </g>
        )
      })}

      {/* planets */}
      {chart.placements.map((p) => {
        const pt = pointAt(cx, cy, rPlanet, p.longitude)
        return (
          <g key={p.body}>
            <circle cx={pt.x} cy={pt.y} r={12} fill="#11151f" stroke="rgba(170,213,238,0.3)" />
            <text x={pt.x} y={pt.y} fill="#eef2f6" fontSize="13" textAnchor="middle" dominantBaseline="central">
              {PLANET_GLYPHS[p.body]}
            </text>
          </g>
        )
      })}

      <circle cx={cx} cy={cy} r={3} fill="#ff8a2b" />
    </svg>
  )
}
