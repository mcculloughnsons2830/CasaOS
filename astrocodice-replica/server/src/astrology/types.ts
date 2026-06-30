// Shared astrology types — the shape of a computed natal chart.

export type PlanetName =
  | 'Sun'
  | 'Moon'
  | 'Mercury'
  | 'Venus'
  | 'Mars'
  | 'Jupiter'
  | 'Saturn'
  | 'Uranus'
  | 'Neptune'
  | 'Pluto'

export interface BirthInput {
  name?: string
  /** ISO date, e.g. "1994-11-08" */
  date: string
  /** 24h local time, e.g. "21:45". Optional — if missing, houses/Ascendant are not computed. */
  time?: string
  /** Free-text birth place, used for display. */
  place: string
  latitude: number
  longitude: number
  /** IANA timezone name, e.g. "America/New_York". */
  timezone: string
}

export interface Placement {
  body: PlanetName
  /** Ecliptic longitude 0–360 (tropical, of-date). */
  longitude: number
  sign: string
  /** Degrees within the sign, 0–30. */
  degreeInSign: number
  /** Whole-sign house 1–12, or null when birth time is unknown. */
  house: number | null
  retrograde: boolean
}

export interface Angle {
  name: 'Ascendant' | 'Midheaven'
  longitude: number
  sign: string
  degreeInSign: number
}

export interface Aspect {
  a: string
  b: string
  type: 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition'
  /** Orb in degrees (how far from exact). */
  orb: number
}

export interface NatalChart {
  input: BirthInput
  utc: string
  julianDay: number
  placements: Placement[]
  angles: Angle[]
  aspects: Aspect[]
  sunSign: string
  moonSign: string
  risingSign: string | null
  hasBirthTime: boolean
}
