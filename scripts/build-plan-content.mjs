/**
 * Builds worker/plan/content.json for the paid 30-day plan.
 *
 * 1. Runs every library item through parseMeal (the free calculator's engine) so gram
 *    counts in the plan match what a buyer would see if they typed the meal in.
 * 2. For each version (Standard / GLP-1 / Gentle gut), each daily-goal tier and each of
 *    the 4 weeks, picks 7 daily menus whose total lands near the tier.
 *
 * The reader picks the tier closest to the buyer's goal for that week, so the 28 days a
 * buyer sees depend on their target and starting point.
 *
 * Usage: node --import tsx scripts/build-plan-content.mjs [--check]
 *   --check  rebuild in memory and fail if content.json is stale (used in CI)
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { parseMeal } from '../src/lib/parseMeal.ts'
import { LIBRARY } from '../worker/plan/library.ts'

const OUT = new URL('../worker/plan/content.json', import.meta.url)
const TIERS = {
  std: [15, 18, 21, 24, 27, 30, 33, 36, 40, 45, 50],
  glp1: [15, 18, 21, 24, 27, 30, 35],
  gentle: [15, 18, 21, 24, 27, 30, 35],
}
const MAX_SNACKS = { std: 2, glp1: 2, gentle: 2 }
const round1 = (n) => Math.round(n * 10) / 10

// ——— 1. Gram counts ———
const meals = {}
const problems = []
for (const m of LIBRARY) {
  const items = m.items.map((it) => {
    const r = parseMeal(it.t)
    if (r.unmatchedHints.length || r.matches.length !== 1) problems.push(`${m.id}: "${it.t}" → ${r.matches.length} matches, unmatched ${r.unmatchedHints}`)
    return { ...it, g: round1(r.totalFiberG) }
  })
  const g = round1(items.reduce((s, it) => s + it.g, 0))
  meals[m.id] = { ...m, items, g }
}
if (problems.length) {
  console.error('Library items the calculator cannot match cleanly:\n' + problems.join('\n'))
  process.exit(1)
}

// ——— 2. Menus ———
function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pool(track, slot, week) {
  return Object.values(meals).filter(
    (m) => m.slot === slot && m.tracks.includes(track) && !(track === 'gentle' && m.legume && week < 3),
  )
}

function combos(track, week) {
  const B = pool(track, 'breakfast', week)
  const L = pool(track, 'lunch', week)
  const D = pool(track, 'dinner', week)
  const S = pool(track, 'snack', week)
  const snackSets = [[]]
  for (let i = 0; i < S.length; i++) {
    snackSets.push([S[i]])
    if (MAX_SNACKS[track] >= 2) for (let j = i + 1; j < S.length; j++) snackSets.push([S[i], S[j]])
  }
  const out = []
  for (const b of B) for (const l of L) for (const d of D) {
    // Gentle gut: at most one legume meal a day.
    const legumes = [b, l, d].filter((m) => m.legume).length
    if (track === 'gentle' && legumes > 1) continue
    for (const s of snackSets) {
      const total = round1(b.g + l.g + d.g + s.reduce((a, m) => a + m.g, 0))
      out.push({ b, l, d, s, total, legumes })
    }
  }
  return out
}

function pickWeek(track, tier, week, all) {
  const rand = rng(tier * 1000 + week * 7 + track.length * 131)
  const used = new Map()
  const days = []
  let prev = null
  for (let day = 0; day < 7; day++) {
    let best = null
    let bestScore = Infinity
    // If no menu reaches this tier with this version's foods (e.g. Gentle gut, week 1,
    // 35 g), fall back to the closest totals; the reader then suggests add-ons.
    const reachable = all.some((c) => c.total - tier >= -1.5 && c.total - tier <= 2.5)
    for (const c of all) {
      const diff = c.total - tier
      if (reachable && (diff < -1.5 || diff > 2.5)) continue
      if (!reachable) {
        const maxTotal = all.reduce((a, x) => Math.max(a, x.total), 0)
        if (c.total < maxTotal - 3) continue
      }
      let score = reachable ? Math.abs(diff - 0.5) * 2 : 0
      for (const m of [c.b, c.l, c.d, ...c.s]) score += (used.get(m.id) || 0) * 3
      if (prev && (c.b.id === prev.b.id || c.l.id === prev.l.id || c.d.id === prev.d.id)) score += 8
      score += c.s.length * 0.6 // prefer fewer snacks, especially on small-plate versions
      if (track !== 'std') score += c.s.length * 0.8
      score += rand() * 2.5
      if (score < bestScore) { bestScore = score; best = c }
    }
    if (!best) throw new Error(`No menu for ${track} tier ${tier} week ${week}`)
    for (const m of [best.b, best.l, best.d, ...best.s]) used.set(m.id, (used.get(m.id) || 0) + 1)
    days.push({ m: [best.b.id, best.l.id, best.d.id, ...best.s.map((s) => s.id)], g: best.total })
    prev = best
  }
  return days
}

const menus = {}
for (const [track, tiers] of Object.entries(TIERS)) {
  menus[track] = {}
  for (let week = 1; week <= 4; week++) {
    const all = combos(track, week)
    for (const tier of tiers) {
      menus[track][tier] ??= []
      menus[track][tier][week - 1] = pickWeek(track, tier, week, all)
    }
  }
}

const content = {
  version: 1,
  tiers: TIERS,
  meals: Object.fromEntries(
    Object.values(meals).map((m) => [m.id, { slot: m.slot, name: m.name, tracks: m.tracks, legume: m.legume || undefined, items: m.items.map(({ t, g, shop, cat }) => ({ t, g, shop, cat })), with: m.with, prep: m.prep, g: m.g }]),
  ),
  menus,
}
const json = JSON.stringify(content)

// Public sample for the sales page: Week 2, Day 9 of each version at the default
// settings (eats ~15 g now, target 25 g). Real menus from the plan, not a mock-up.
const SAMPLE_OUT = new URL('../src/content/plan-sample.json', import.meta.url)
const sampleTier = { std: 24, glp1: 21, gentle: 21 }
const sample = Object.fromEntries(
  Object.entries(sampleTier).map(([track, tier]) => {
    const day = menus[track][tier][1][1]
    return [track, {
      goal: track === 'std' ? 25 : 21,
      total: day.g,
      meals: day.m.map((id) => {
        const m = content.meals[id]
        return { slot: m.slot, name: m.name, items: m.items.map((i) => i.t).join(', ') + (m.with ? `, ${m.with}` : ''), g: m.g }
      }),
    }]
  }),
)
const sampleJson = JSON.stringify(sample, null, 2) + '\n'
if (process.argv.includes('--check')) {
  const cur = readFileSync(OUT, 'utf8')
  if (cur.trim() !== json || readFileSync(SAMPLE_OUT, 'utf8') !== sampleJson) { console.error('worker/plan/content.json is stale. Run: node --import tsx scripts/build-plan-content.mjs'); process.exit(1) }
  console.log('plan content up to date')
} else {
  writeFileSync(OUT, json + '\n')
  writeFileSync(SAMPLE_OUT, sampleJson)
  console.log(`wrote ${OUT.pathname} (${(json.length / 1024).toFixed(1)} KB, ${Object.keys(meals).length} meals)`)
}
