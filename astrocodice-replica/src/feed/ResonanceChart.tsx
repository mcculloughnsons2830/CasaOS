// © 2026 Joshua Reed McCullough (MsFitZ Society). All rights reserved. Proprietary — see LICENSE.
import { useMemo } from 'react'
import type { Archetype } from './data'

const WIDTH = 280
const HEIGHT = 120
const PADDING = { top: 12, right: 8, bottom: 8, left: 8 }
const CHART_WIDTH = WIDTH - PADDING.left - PADDING.right
const CHART_HEIGHT = HEIGHT - PADDING.top - PADDING.bottom

export default function ResonanceChart({ archetype }: { archetype: Archetype }) {
  const { path, color, currentVal, minVal, maxVal } = useMemo(() => {
    const data = archetype.history
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1

    // Determine color by trend
    const colors = {
      rising: '#6fb1d6', // ice
      falling: '#ff8a2b', // ember
      still: '#8a99a8', // muted
    }
    const color = colors[archetype.trend]

    // Build SVG path: area chart with line overlay
    const points = data.map((value, i) => {
      const x = (i / (data.length - 1)) * CHART_WIDTH
      const normalized = (value - min) / range
      const y = CHART_HEIGHT - normalized * CHART_HEIGHT
      return { x, y, value }
    })

    const pathStr = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ')

    // Area: path down, baseline back, close
    const areaPath =
      pathStr +
      ` L ${points[points.length - 1]?.x} ${CHART_HEIGHT}` +
      ` L ${points[0]?.x} ${CHART_HEIGHT}` +
      ' Z'

    return {
      path: areaPath,
      color,
      currentVal: data[data.length - 1],
      minVal: min,
      maxVal: max,
    }
  }, [archetype.history, archetype.trend])

  return (
    <div className="flex flex-col gap-2">
      <svg width={WIDTH} height={HEIGHT} className="w-full overflow-visible" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        {/* Grid lines (light, recessive) */}
        <line x1={PADDING.left} y1={PADDING.top + CHART_HEIGHT / 2} x2={WIDTH - PADDING.right} y2={PADDING.top + CHART_HEIGHT / 2} stroke="currentColor" strokeWidth="0.5" className="text-line opacity-30" />

        {/* Area under the curve */}
        <path d={path} fill={color} opacity="0.12" vectorEffect="non-scaling-stroke" />

        {/* Line trace */}
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          className="pointer-events-none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Current point marker */}
        {archetype.history.length > 0 && (
          <circle
            cx={WIDTH - PADDING.right - 2}
            cy={PADDING.top + (CHART_HEIGHT - ((archetype.history[archetype.history.length - 1] - minVal) / (maxVal - minVal || 1)) * CHART_HEIGHT)}
            r="2.5"
            fill={color}
            style={{ opacity: 0.8 }}
          />
        )}
      </svg>

      {/* Legend: min, current, max */}
      <div className="flex items-center justify-between px-0.5 text-xs text-muted/70">
        <span>{minVal.toFixed(0)}</span>
        <span className="font-semibold text-bone">{currentVal.toFixed(1)}</span>
        <span>{maxVal.toFixed(0)}</span>
      </div>
    </div>
  )
}
