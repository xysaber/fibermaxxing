import { FOODS, type FoodItem } from '../data/foods'

export type MatchedFood = {
  food: FoodItem
  qty: number
  fiberG: number
  matchedAlias: string
}

export type ParseResult = {
  matches: MatchedFood[]
  totalFiberG: number
  totalCalories: number
  avgGlpScore: number
  unmatchedHints: string[]
}

const QTY_WORDS: Record<string, number> = {
  a: 1,
  an: 1,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  half: 0.5,
  'a half': 0.5,
}

/** Sort aliases longest-first so "chia seeds" beats "chia". */
const ALIAS_INDEX = FOODS.flatMap((food) =>
  food.aliases.map((alias) => ({ alias: alias.toLowerCase(), food })),
).sort((a, b) => b.alias.length - a.alias.length)

function extractQty(before: string): number {
  const tail = before.trim().toLowerCase().slice(-24)
  const num = tail.match(/(\d+(?:\.\d+)?)\s*(?:x|×)?\s*$/)
  if (num) return Math.min(12, parseFloat(num[1]))

  for (const [word, qty] of Object.entries(QTY_WORDS)) {
    if (new RegExp(`(?:^|\\s)${word}\\s*$`, 'i').test(tail)) return qty
  }
  return 1
}

/**
 * Lightweight client-side NL meal parser — zero API cost for MVP.
 * Handles: "I ate 2 eggs, 1 bowl of oatmeal, and an apple"
 */
export function parseMeal(input: string): ParseResult {
  const text = input.toLowerCase().replace(/[^\w\s./-]/g, ' ')
  const used = new Array(text.length).fill(false)
  const matches: MatchedFood[] = []

  for (const { alias, food } of ALIAS_INDEX) {
    let from = 0
    while (from < text.length) {
      const idx = text.indexOf(alias, from)
      if (idx === -1) break
      const end = idx + alias.length
      const overlap = used.slice(idx, end).some(Boolean)
      const boundaryOk =
        (idx === 0 || /[\s-]/.test(text[idx - 1]!)) &&
        (end >= text.length || /[\s-]/.test(text[end]!))

      if (!overlap && boundaryOk) {
        for (let i = idx; i < end; i++) used[i] = true
        const qty = extractQty(text.slice(0, idx))
        matches.push({
          food,
          qty,
          fiberG: Math.round(food.fiberG * qty * 10) / 10,
          matchedAlias: alias,
        })
      }
      from = end
    }
  }

  // Dedupe same food id — sum quantities
  const byId = new Map<string, MatchedFood>()
  for (const m of matches) {
    const prev = byId.get(m.food.id)
    if (prev) {
      prev.qty += m.qty
      prev.fiberG = Math.round(prev.food.fiberG * prev.qty * 10) / 10
    } else {
      byId.set(m.food.id, { ...m })
    }
  }
  const merged = [...byId.values()].sort((a, b) => b.fiberG - a.fiberG)

  const totalFiberG = Math.round(merged.reduce((s, m) => s + m.fiberG, 0) * 10) / 10
  const totalCalories = Math.round(merged.reduce((s, m) => s + m.food.calories * m.qty, 0))
  const weightedGlp =
    merged.length === 0
      ? 0
      : merged.reduce((s, m) => s + m.food.glpScore * m.fiberG, 0) /
        Math.max(totalFiberG, 0.1)

  const tokens = text
    .split(/\s+/)
    .filter((t) => t.length > 3 && !/^(ate|eaten|with|from|bowl|cups?|tbsp|tablespoons?|and|today|breakfast|lunch|dinner)$/.test(t))

  const unmatchedHints = tokens
    .filter((t) => !merged.some((m) => m.matchedAlias.includes(t) || t.includes(m.matchedAlias.split(' ')[0]!)))
    .slice(0, 3)

  return {
    matches: merged,
    totalFiberG,
    totalCalories,
    avgGlpScore: Math.round(weightedGlp * 10) / 10,
    unmatchedHints,
  }
}

export function fiberTarget(sex: 'female' | 'male' | 'other', mode: 'standard' | 'maxxing'): number {
  if (mode === 'maxxing') return sex === 'female' ? 40 : 50
  if (sex === 'female') return 25
  if (sex === 'male') return 38
  return 30
}
