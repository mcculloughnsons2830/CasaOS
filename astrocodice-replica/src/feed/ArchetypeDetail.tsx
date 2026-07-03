// © 2026 Joshua Reed McCullough (MsFitZ Society). All rights reserved. Proprietary — see LICENSE.
import { useMemo } from 'react'
import { ARCHETYPES, SIGNALS } from './data'
import ResonanceChart from './ResonanceChart'
import SignalCard from './SignalCard'

const trendEmoji = { rising: '◈', falling: '◀', still: '━' }

export default function ArchetypeDetail({
  symbol,
  onBack,
}: {
  symbol: string
  onBack: () => void
}) {
  const archetype = ARCHETYPES.find((a) => a.symbol === symbol)
  const relatedSignals = useMemo(() => SIGNALS.filter((s) => s.tags.includes(symbol)), [symbol])

  if (!archetype) {
    return (
      <div className="section-title text-center py-20 text-muted">
        Archetype not found
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-line pb-6">
        <button
          onClick={onBack}
          className="text-sm text-muted/60 hover:text-ice-light transition-colors mb-4 flex items-center gap-1"
        >
          ← Back to field
        </button>

        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="eyebrow text-ice/70 mb-1">{archetype.domain}</div>
            <h1 className="headline text-4xl">{archetype.name}</h1>
            <p className="text-muted/70 italic mt-2 max-w-lg">&quot;{archetype.quote}&quot;</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-5xl font-display font-bold text-bone mb-1">{archetype.symbol}</div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card bg-ice/5 border-ice/20">
          <div className="text-xs text-muted/60 uppercase tracking-wider mb-1">Resonance Now</div>
          <div className="text-3xl font-bold text-ice-light">{archetype.resonance}</div>
          <div className={`text-xs mt-2 font-mono ${archetype.trend === 'rising' ? 'text-ice-light' : archetype.trend === 'falling' ? 'text-ember-light' : 'text-muted'}`}>
            {trendEmoji[archetype.trend]} {archetype.change > 0 ? '+' : ''}{archetype.change.toFixed(1)}
          </div>
        </div>

        <div className="card bg-ember/5 border-ember/20">
          <div className="text-xs text-muted/60 uppercase tracking-wider mb-1">Reflecting Now</div>
          <div className="text-3xl font-bold text-ember-light">{(archetype.reflecting / 1000).toFixed(1)}k</div>
          <div className="text-xs text-muted/60 mt-2">people in the field</div>
        </div>

        <div className="card bg-bone/5 border-bone/20">
          <div className="text-xs text-muted/60 uppercase tracking-wider mb-1">Trend</div>
          <div className="text-lg font-semibold text-bone capitalize mt-2">{archetype.trend}</div>
          <div className="text-xs text-muted/60 mt-2">over last 8 cycles</div>
        </div>
      </div>

      {/* Resonance chart: last 8 cycles */}
      <div className="card bg-ink-600/20 border-line">
        <h2 className="text-sm font-semibold text-bone mb-4 uppercase tracking-wider">Last 8 Cycles</h2>
        <ResonanceChart archetype={archetype} />
      </div>

      {/* The Read */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-bone uppercase tracking-wider">The Read</h2>
        <p className="text-base leading-relaxed text-muted/80 italic">&quot;{archetype.read}&quot;</p>
      </div>

      {/* Related signals */}
      {relatedSignals.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-bone uppercase tracking-wider">
            Signals Touching {archetype.symbol}
          </h2>
          <div className="space-y-3">
            {relatedSignals.map((signal) => (
              <SignalCard key={signal.id} signal={signal} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
