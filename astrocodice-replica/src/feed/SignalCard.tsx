// © 2026 Joshua Reed McCullough (MsFitZ Society). All rights reserved. Proprietary — see LICENSE.
import type { Signal } from './data'

const kindEmojis = {
  drop: '◆',
  insight: '◈',
  reflection: '◉',
}

const kindLabels = {
  drop: 'DROP',
  insight: 'INSIGHT',
  reflection: 'REFLECTION',
}

export default function SignalCard({
  signal,
  onClick,
}: {
  signal: Signal
  onClick?: () => void
}) {
  const trendColor = signal.trend === 'rising' ? 'text-ice-light' : signal.trend === 'falling' ? 'text-ember-light' : 'text-muted'
  const bgColor =
    signal.trend === 'rising'
      ? 'bg-ice/5 border-ice/20'
      : signal.trend === 'falling'
        ? 'bg-ember/5 border-ember/20'
        : 'bg-muted/5 border-muted/20'

  return (
    <div
      onClick={onClick}
      className={`card cursor-pointer transition-colors hover:bg-ice/10 ${bgColor}`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`text-lg flex-shrink-0 ${trendColor}`}>{kindEmojis[signal.kind]}</span>
          <div className="min-w-0">
            <div className="eyebrow text-muted/60">{kindLabels[signal.kind]}</div>
            <h3 className="text-sm font-semibold text-bone leading-tight line-clamp-2">{signal.title}</h3>
          </div>
        </div>
        <span className={`text-xs font-mono flex-shrink-0 ${trendColor}`}>{signal.ago}</span>
      </div>

      <p className="text-sm text-muted/80 leading-relaxed mb-3 line-clamp-3">{signal.body}</p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {signal.tags.map((tag) => (
          <span
            key={tag}
            className="inline-block px-2 py-0.5 rounded text-xs font-mono bg-ink-700/40 text-ice-light border border-ice/30 hover:bg-ice/20 cursor-pointer transition-colors"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-muted/60">
        <span>Source: {signal.source}</span>
        <div className="h-1.5 w-12 bg-ice/20 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${signal.intensity * 100}%`,
              backgroundColor: signal.trend === 'rising' ? '#6fb1d6' : signal.trend === 'falling' ? '#ff8a2b' : '#8a99a8',
            }}
          />
        </div>
      </div>
    </div>
  )
}
