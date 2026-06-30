// Real astronomical natal-chart computation.
//
// Planetary positions come from the `astronomy-engine` library, which implements
// the same VSOP87 / NOVAS-derived models used for high-precision astronomy —
// the public-domain lineage behind NASA/JPL ephemerides. We compute geocentric
// ecliptic-of-date (true equinox) longitudes for the tropical zodiac, plus the
// Ascendant and Midheaven from local sidereal time, and use Whole-Sign houses.

import type { AstroTime, Body as TBody } from 'astronomy-engine'
import * as AstronomyNS from 'astronomy-engine'
import { DateTime } from 'luxon'

// astronomy-engine is dual-published: native ESM exposes named exports, while
// the CJS build (what tsx/esbuild resolves) puts everything under `.default`.
// This shim picks whichever is populated so the same code runs under both.
const Astronomy: any = (AstronomyNS as any).default ?? AstronomyNS
const {
  Body,
  GeoVector,
  MakeTime,
  RotateVector,
  Rotation_EQJ_ECT,
  SiderealTime,
  SphereFromVector,
} = Astronomy
import type {
  Angle,
  Aspect,
  BirthInput,
  NatalChart,
  Placement,
  PlanetName,
} from './types.js'

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
]

const BODIES: { name: PlanetName; body: TBody }[] = [
  { name: 'Sun', body: Body.Sun },
  { name: 'Moon', body: Body.Moon },
  { name: 'Mercury', body: Body.Mercury },
  { name: 'Venus', body: Body.Venus },
  { name: 'Mars', body: Body.Mars },
  { name: 'Jupiter', body: Body.Jupiter },
  { name: 'Saturn', body: Body.Saturn },
  { name: 'Uranus', body: Body.Uranus },
  { name: 'Neptune', body: Body.Neptune },
  { name: 'Pluto', body: Body.Pluto },
]

const DEG = 180 / Math.PI
const RAD = Math.PI / 180

function norm360(x: number): number {
  return ((x % 360) + 360) % 360
}

function signOf(longitude: number): { sign: string; degreeInSign: number } {
  const lon = norm360(longitude)
  const idx = Math.floor(lon / 30) % 12
  return { sign: SIGNS[idx], degreeInSign: lon - idx * 30 }
}

/** Geocentric ecliptic-of-date longitude (degrees) of a body. */
function eclipticLongitude(body: TBody, time: AstroTime): number {
  const geo = GeoVector(body, time, true) // EQJ, aberration-corrected
  const rot = Rotation_EQJ_ECT(time) // J2000 equator -> ecliptic of-date (true)
  const ecl = RotateVector(rot, geo)
  const sphere = SphereFromVector(ecl)
  return norm360(sphere.lon)
}

/** Mean obliquity of the ecliptic (degrees) for a given AstroTime. */
function meanObliquity(time: AstroTime): number {
  const T = time.tt / 36525 // Julian centuries of TT from J2000
  // IAU 1980 mean obliquity polynomial (arcseconds -> degrees).
  const seconds =
    84381.448 - 46.815 * T - 0.00059 * T * T + 0.001813 * T * T * T
  return seconds / 3600
}

/**
 * Ascendant & Midheaven from local apparent sidereal time and latitude.
 * Standard spherical-astronomy formulas (tropical, of-date).
 */
function computeAngles(
  time: AstroTime,
  latitude: number,
  longitudeEast: number,
): { ascendant: number; midheaven: number } {
  const gast = SiderealTime(time) // Greenwich apparent sidereal time, hours
  const lstDeg = norm360(gast * 15 + longitudeEast) // local sidereal time, degrees
  const ramc = lstDeg * RAD // right ascension of the MC
  const eps = meanObliquity(time) * RAD
  const lat = latitude * RAD

  // Midheaven: ecliptic longitude of the meridian.
  let mc = Math.atan2(Math.sin(ramc), Math.cos(ramc) * Math.cos(eps)) * DEG
  mc = norm360(mc)

  // Ascendant: ecliptic point rising on the eastern horizon.
  let asc =
    Math.atan2(
      Math.cos(ramc),
      -(Math.sin(ramc) * Math.cos(eps) + Math.tan(lat) * Math.sin(eps)),
    ) * DEG
  asc = norm360(asc)

  return { ascendant: asc, midheaven: mc }
}

const ASPECT_DEFS: { type: Aspect['type']; angle: number; orb: number }[] = [
  { type: 'conjunction', angle: 0, orb: 8 },
  { type: 'sextile', angle: 60, orb: 4 },
  { type: 'square', angle: 90, orb: 7 },
  { type: 'trine', angle: 120, orb: 7 },
  { type: 'opposition', angle: 180, orb: 8 },
]

function computeAspects(points: { name: string; longitude: number }[]): Aspect[] {
  const aspects: Aspect[] = []
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      let diff = Math.abs(points[i].longitude - points[j].longitude) % 360
      if (diff > 180) diff = 360 - diff
      for (const def of ASPECT_DEFS) {
        const orb = Math.abs(diff - def.angle)
        if (orb <= def.orb) {
          aspects.push({
            a: points[i].name,
            b: points[j].name,
            type: def.type,
            orb: Math.round(orb * 10) / 10,
          })
          break
        }
      }
    }
  }
  // Tightest orbs first — those matter most in interpretation.
  return aspects.sort((x, y) => x.orb - y.orb)
}

export function computeChart(input: BirthInput): NatalChart {
  const hasBirthTime = Boolean(input.time && input.time.trim())
  const [hh, mm] = (input.time || '12:00').split(':').map((n) => parseInt(n, 10))
  const [year, month, day] = input.date.split('-').map((n) => parseInt(n, 10))

  // Convert local birth time (in the birthplace's IANA zone) to UTC.
  const local = DateTime.fromObject(
    { year, month, day, hour: hh || 0, minute: mm || 0 },
    { zone: input.timezone },
  )
  if (!local.isValid) {
    throw new Error(`Invalid date/timezone: ${local.invalidReason ?? 'unknown'}`)
  }
  const utc = local.toUTC()
  const jsDate = utc.toJSDate()
  const time = MakeTime(jsDate)

  // Planetary placements.
  const placements: Placement[] = BODIES.map(({ name, body }) => {
    const longitude = eclipticLongitude(body, time)
    // Retrograde: sample the longitude a day later and check direction.
    let retrograde = false
    if (name !== 'Sun' && name !== 'Moon') {
      const later = eclipticLongitude(body, time.AddDays(1))
      let delta = later - longitude
      if (delta > 180) delta -= 360
      if (delta < -180) delta += 360
      retrograde = delta < 0
    }
    const { sign, degreeInSign } = signOf(longitude)
    return { body: name, longitude, sign, degreeInSign, house: null, retrograde }
  })

  // Angles + houses (Whole Sign) require a birth time.
  const angles: Angle[] = []
  let risingSign: string | null = null
  if (hasBirthTime) {
    const { ascendant, midheaven } = computeAngles(time, input.latitude, input.longitude)
    const ascSign = signOf(ascendant)
    const mcSign = signOf(midheaven)
    angles.push(
      { name: 'Ascendant', longitude: ascendant, sign: ascSign.sign, degreeInSign: ascSign.degreeInSign },
      { name: 'Midheaven', longitude: midheaven, sign: mcSign.sign, degreeInSign: mcSign.degreeInSign },
    )
    risingSign = ascSign.sign

    const ascSignIndex = SIGNS.indexOf(ascSign.sign)
    for (const p of placements) {
      const signIndex = SIGNS.indexOf(p.sign)
      p.house = ((signIndex - ascSignIndex + 12) % 12) + 1
    }
  }

  // Aspects across planets + angles.
  const aspectPoints = [
    ...placements.map((p) => ({ name: p.body, longitude: p.longitude })),
    ...angles.map((a) => ({ name: a.name, longitude: a.longitude })),
  ]
  const aspects = computeAspects(aspectPoints)

  const sun = placements.find((p) => p.body === 'Sun')!
  const moon = placements.find((p) => p.body === 'Moon')!

  return {
    input,
    utc: utc.toISO() ?? '',
    julianDay: time.tt + 2451545.0,
    placements,
    angles,
    aspects,
    sunSign: sun.sign,
    moonSign: moon.sign,
    risingSign,
    hasBirthTime,
  }
}
