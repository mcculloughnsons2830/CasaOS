// © 2026 Joshua Reed McCullough (MsFitZ Society). All rights reserved. Proprietary — see LICENSE.
// Frontend mirror of the server's chart shape.

export type PlanetName =
  | 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars'
  | 'Jupiter' | 'Saturn' | 'Uranus' | 'Neptune' | 'Pluto'

export interface Placement {
  body: PlanetName
  longitude: number
  sign: string
  degreeInSign: number
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
  orb: number
}

export interface NatalChart {
  input: {
    name?: string
    date: string
    time?: string
    place: string
    latitude: number
    longitude: number
    timezone: string
  }
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

export interface BirthInput {
  name?: string
  date: string
  time?: string
  place: string
  latitude: number
  longitude: number
  timezone: string
}

export interface GeoResult {
  name: string
  country: string
  admin1: string
  latitude: number
  longitude: number
  timezone: string
}

export type ChatTurn = { role: 'user' | 'assistant'; content: string }

export const PLANET_GLYPHS: Record<string, string> = {
  Sun: '☉', Moon: '☾', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
  Ascendant: 'Asc', Midheaven: 'MC',
}

export const SIGN_GLYPHS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
}
