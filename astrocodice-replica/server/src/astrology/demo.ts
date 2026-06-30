// © 2026 MsFitZ Society. All rights reserved. Proprietary — see LICENSE.
// Validation harness — compute a known chart and print it.
// Albert Einstein: 1879-03-14, 11:30, Ulm, Germany.
// Reference (astro databases): Sun Pisces, Moon Sagittarius, Ascendant Cancer.
import { computeChart } from './ephemeris.js'

const chart = computeChart({
  name: 'Albert Einstein',
  date: '1879-03-14',
  time: '11:30',
  place: 'Ulm, Germany',
  latitude: 48.4011,
  longitude: 9.9876,
  timezone: 'Europe/Berlin',
})

console.log('UTC:', chart.utc)
console.log('Sun:', chart.sunSign, '| Moon:', chart.moonSign, '| Rising:', chart.risingSign)
console.log('\nPlacements:')
for (const p of chart.placements) {
  console.log(
    `  ${p.body.padEnd(8)} ${p.sign.padEnd(12)} ${p.degreeInSign.toFixed(2)}°` +
      (p.house ? ` house ${p.house}` : '') +
      (p.retrograde ? ' ℞' : ''),
  )
}
console.log('\nAngles:')
for (const a of chart.angles) {
  console.log(`  ${a.name.padEnd(10)} ${a.sign} ${a.degreeInSign.toFixed(2)}°`)
}
console.log('\nTightest aspects:')
for (const a of chart.aspects.slice(0, 8)) {
  console.log(`  ${a.a} ${a.type} ${a.b} (orb ${a.orb}°)`)
}
