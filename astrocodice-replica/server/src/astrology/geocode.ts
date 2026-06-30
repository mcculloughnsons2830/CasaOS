// Place -> coordinates + IANA timezone, via the free Open-Meteo geocoding API
// (no API key required). Used to turn "Ulm, Germany" into the numbers the
// ephemeris needs.

export interface GeoResult {
  name: string
  country: string
  admin1: string
  latitude: number
  longitude: number
  timezone: string
}

export async function geocode(query: string): Promise<GeoResult[]> {
  const q = query.trim()
  if (!q) return []
  const url =
    'https://geocoding-api.open-meteo.com/v1/search?' +
    new URLSearchParams({ name: q, count: '6', language: 'en', format: 'json' })

  const res = await fetch(url, { headers: { accept: 'application/json' } })
  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`)
  const data = (await res.json()) as { results?: any[] }
  if (!data.results) return []

  return data.results.map((r) => ({
    name: r.name,
    country: r.country ?? '',
    admin1: r.admin1 ?? '',
    latitude: r.latitude,
    longitude: r.longitude,
    timezone: r.timezone ?? 'UTC',
  }))
}
