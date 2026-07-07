// © 2026 Joshua Reed McCullough (MsFitZ Society). All rights reserved. Proprietary — see LICENSE.
import { useState, useMemo, useEffect } from 'react'
import { ARCHETYPES, SIGNALS, DAILY_MIRROR, type Trend } from './data'
import { fetchMirror, type MirrorDraw } from '../reading/api'
import ArchetypeDetail from './ArchetypeDetail'
import SignalCard from './SignalCard'

type FeedView = 'feed' | 'archetype'

export default function FeedExperience() {
  const [view, setView] = useState<FeedView>('feed')
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)
  const [trendFilter, setTrendFilter] = useState<Trend | 'all'>('all')
  const [mirror, setMirror] = useState<MirrorDraw | null>(null)

  useEffect(() => {
    fetchMirror().then(setMirror)
  }, [])

  const filteredSignals = useMemo(() => {
    if (trendFilter === 'all') return SIGNALS
    return SIGNALS.filter((s) => s.trend === trendFilter)
  }, [trendFilter])

  const rising = ARCHETYPES.filter((a) => a.trend === 'rising')
  const falling = ARCHETYPES.filter((a) => a.trend === 'falling')

  const handleSelectArchetype = (symbol: string) => {
    setSelectedSymbol(symbol)
    setView('archetype')
  }

  const handleBackToFeed = () => {
    setView('feed')
    setSelectedSymbol(null)
  }

  if (view === 'archetype' && selectedSymbol) {
    return (
      <div className="min-h-screen bg-ink-700 text-bone">
        <div className="container-x py-8">
          <ArchetypeDetail symbol={selectedSymbol} onBack={handleBackToFeed} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink-700 text-bone">
      {/* Ticker: rising & falling archetypes */}
      <div className="border-b border-line bg-ink-800/40 sticky top-0 z-20 overflow-x-auto">
        <div className="flex gap-6 px-4 py-3 min-w-max">
          <div className="flex items-center gap-2">
            <span className="text-ice-light text-sm font-semibold">◈ SURFACING</span>
            <div className="flex gap-2">
              {rising.map((a) => (
                <button
                  key={a.symbol}
                  onClick={() => handleSelectArchetype(a.symbol)}
                  className="px-3 py-1 rounded text-xs font-mono text-ice-light bg-ice/10 hover:bg-ice/20 border border-ice/30 transition-colors"
                >
                  {a.symbol} {a.resonance}
                </button>
              ))}
            </div>
          </div>

          <div className="w-px bg-line/30" />

          <div className="flex items-center gap-2">
            <span className="text-ember-light text-sm font-semibold">◀ RECEDING</span>
            <div className="flex gap-2">
              {falling.map((a) => (
                <button
                  key={a.symbol}
                  onClick={() => handleSelectArchetype(a.symbol)}
                  className="px-3 py-1 rounded text-xs font-mono text-ember-light bg-ember/10 hover:bg-ember/20 border border-ember/30 transition-colors"
                >
                  {a.symbol} {a.resonance}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container-x py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-8">
          {/* Left: Sidebar nav */}
          <div className="space-y-6">
            <div>
              <h3 className="eyebrow text-muted/60 mb-3">THE FIELD</h3>
              <nav className="space-y-2">
                <button className="w-full text-left px-3 py-2 rounded text-sm text-bone hover:bg-ice/10 transition-colors">
                  ◆ Signal
                </button>
                <button className="w-full text-left px-3 py-2 rounded text-sm text-muted/80 hover:bg-ice/10 transition-colors">
                  ◉ Daily Mirror
                </button>
                <button className="w-full text-left px-3 py-2 rounded text-sm text-muted/80 hover:bg-ice/10 transition-colors">
                  ◈ Reflections
                </button>
              </nav>
            </div>

            <div>
              <h3 className="eyebrow text-muted/60 mb-3">FREQUENCIES</h3>
              <div className="space-y-1 text-xs">
                <button
                  onClick={() => setTrendFilter('all')}
                  className={`w-full text-left px-3 py-2 rounded transition-colors ${
                    trendFilter === 'all'
                      ? 'text-bone bg-ice/10'
                      : 'text-muted/70 hover:text-muted'
                  }`}
                >
                  All Signals
                </button>
                <button
                  onClick={() => setTrendFilter('rising')}
                  className={`w-full text-left px-3 py-2 rounded transition-colors ${
                    trendFilter === 'rising' ? 'text-ice-light bg-ice/10' : 'text-muted/70 hover:text-muted'
                  }`}
                >
                  ◈ Rising
                </button>
                <button
                  onClick={() => setTrendFilter('falling')}
                  className={`w-full text-left px-3 py-2 rounded transition-colors ${
                    trendFilter === 'falling'
                      ? 'text-ember-light bg-ember/10'
                      : 'text-muted/70 hover:text-muted'
                  }`}
                >
                  ◀ Falling
                </button>
                <button
                  onClick={() => setTrendFilter('still')}
                  className={`w-full text-left px-3 py-2 rounded transition-colors ${
                    trendFilter === 'still'
                      ? 'text-bone bg-muted/10'
                      : 'text-muted/70 hover:text-muted'
                  }`}
                >
                  ━ Still
                </button>
              </div>
            </div>
          </div>

          {/* Center: Signal feed */}
          <div className="space-y-4">
            <div className="mb-6">
              <h2 className="section-title mb-2">The Signal</h2>
              <p className="text-sm text-muted/70">
                Live resonance, shifts in the field, notes from the society.
              </p>
            </div>

            <div className="space-y-4">
              {filteredSignals.length === 0 ? (
                <div className="text-center py-12 text-muted/50">
                  <p className="text-sm">No signals in this frequency</p>
                </div>
              ) : (
                filteredSignals.map((signal) => (
                  <SignalCard
                    key={signal.id}
                    signal={signal}
                    onClick={() => {
                      if (signal.tags.length === 1) {
                        handleSelectArchetype(signal.tags[0])
                      }
                    }}
                  />
                ))
              )}
            </div>
          </div>

          {/* Right: Daily Mirror + archetypes list */}
          <div className="space-y-6">
            <div className="card bg-bone/5 border-bone/20">
              <h3 className="eyebrow text-muted/60 mb-3">Daily Mirror</h3>
              <p className="text-sm italic text-bone leading-relaxed">
                &quot;{mirror?.aphorism ?? DAILY_MIRROR}&quot;
              </p>
              {mirror && (
                <div className="mt-3 flex items-center justify-between text-xs text-muted/60">
                  <button
                    onClick={() => handleSelectArchetype(mirror.archetype)}
                    className="font-mono text-ice-light hover:text-ice transition-colors"
                  >
                    ◈ {mirror.archetype}
                  </button>
                  <span title={mirror.nature}>today&apos;s draw</span>
                </div>
              )}
            </div>

            <div>
              <h3 className="eyebrow text-muted/60 mb-3 uppercase tracking-wider">All Archetypes</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {ARCHETYPES.map((a) => (
                  <button
                    key={a.symbol}
                    onClick={() => handleSelectArchetype(a.symbol)}
                    className="w-full text-left px-3 py-2 rounded text-xs transition-colors hover:bg-ice/10 border border-transparent hover:border-ice/30"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-semibold">{a.symbol}</span>
                      <span
                        className={`font-bold ${
                          a.trend === 'rising'
                            ? 'text-ice-light'
                            : a.trend === 'falling'
                              ? 'text-ember-light'
                              : 'text-muted'
                        }`}
                      >
                        {a.resonance}
                      </span>
                    </div>
                    <div className="text-muted/60 truncate">{a.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom nav (mobile) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-ink-800 border-t border-line">
        <div className="flex gap-4 px-4 py-3 overflow-x-auto justify-center">
          <button className="px-4 py-2 rounded text-xs font-semibold text-bone bg-ice/20 border border-ice/40">
            Signal
          </button>
          <button className="px-4 py-2 rounded text-xs text-muted/70 hover:text-bone transition-colors">
            Mirror
          </button>
          <button className="px-4 py-2 rounded text-xs text-muted/70 hover:text-bone transition-colors">
            Archetypes
          </button>
        </div>
      </div>
    </div>
  )
}
