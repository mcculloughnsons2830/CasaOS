import { useEffect, useRef, useState } from 'react'
import { geocode } from './api'
import type { BirthInput, GeoResult } from './types'

export default function BirthForm({ onSubmit }: { onSubmit: (b: BirthInput) => void }) {
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [unknownTime, setUnknownTime] = useState(false)
  const [placeQuery, setPlaceQuery] = useState('')
  const [results, setResults] = useState<GeoResult[]>([])
  const [selected, setSelected] = useState<GeoResult | null>(null)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (selected && placeQuery === labelOf(selected)) return
    if (placeQuery.trim().length < 2) {
      setResults([])
      return
    }
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(async () => {
      const r = await geocode(placeQuery)
      setResults(r)
      setOpen(true)
    }, 280)
    return () => {
      if (debounce.current) clearTimeout(debounce.current)
    }
  }, [placeQuery, selected])

  function choose(r: GeoResult) {
    setSelected(r)
    setPlaceQuery(labelOf(r))
    setOpen(false)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!date) return setError('Your birth date is the one thing the cosmos needs.')
    if (!selected) return setError('Pick your birth place from the list so we can find your sky.')
    onSubmit({
      name: name.trim() || undefined,
      date,
      time: unknownTime ? undefined : time || undefined,
      place: labelOf(selected),
      latitude: selected.latitude,
      longitude: selected.longitude,
      timezone: selected.timezone,
    })
  }

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-lg">
      <div className="space-y-5">
        <Field label="Your name (optional)">
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What should the stars call you?"
            maxLength={80}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Date of birth">
            <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} required />
          </Field>
          <Field label="Time of birth">
            <input
              type="time"
              className="input disabled:opacity-40"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={unknownTime}
            />
            <label className="mt-2 flex items-center gap-2 text-xs text-muted">
              <input
                type="checkbox"
                checked={unknownTime}
                onChange={(e) => setUnknownTime(e.target.checked)}
                className="accent-ember"
              />
              I don’t know my birth time
            </label>
          </Field>
        </div>

        <Field label="Place of birth">
          <div className="relative">
            <input
              className="input"
              value={placeQuery}
              onChange={(e) => {
                setPlaceQuery(e.target.value)
                setSelected(null)
              }}
              onFocus={() => results.length && setOpen(true)}
              placeholder="City, country"
              autoComplete="off"
            />
            {open && !selected && results.length > 0 && (
              <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-line bg-ink-700 shadow-panel">
                {results.map((r, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => choose(r)}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-white/5"
                    >
                      <span className="text-bone">{labelOf(r)}</span>
                      <span className="text-xs text-muted">{r.timezone}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Field>

        {error && <p className="text-sm text-ember-light">{error}</p>}

        <button type="submit" className="btn-ember w-full">
          Read my chart ✦
        </button>
        <p className="text-center text-xs text-muted">
          Your data is used only to compute your chart. Nothing is stored.
        </p>
      </div>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-ice-light">{label}</span>
      {children}
    </label>
  )
}

function labelOf(r: GeoResult): string {
  return [r.name, r.admin1, r.country].filter(Boolean).join(', ')
}
