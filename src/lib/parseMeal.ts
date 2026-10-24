import { FOODS, type FoodItem } from '../data/foods'
import { estimateFiber, extractUnmatchedPhrases } from './estimateFiber'

export type MatchedFood = {
  food: FoodItem
  qty: number
  fiberG: number
  matchedAlias: string
  /** Curated DB hit vs category-based estimate for unknown foods */
  source: 'database' | 'estimate'
  confidence: 'high' | 'medium' | 'low'
}

export type ParseResult = {
  matches: MatchedFood[]
  totalFiberG: number
  totalCalories: number
  avgGlpScore: number
  /** Phrases we saw but could not estimate */
  unmatchedHints: string[]
  estimatedCount: number
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
  一: 1,
  二: 2,
  两: 2,
  三: 3,
  四: 4,
  五: 5,
  半: 0.5,
}

const CJK_RE = /[\u3040-\u30ff\u3400-\u9fff\uf900-\ufaff]/
const WORD_CHAR_RE = /\p{L}|\p{N}/u

/** Sort aliases longest-first so "chia seeds" / "奇亚籽" beat shorter stems. */
const ALIAS_INDEX = FOODS.flatMap((food) =>
  food.aliases.map((alias) => ({
    alias: alias.toLowerCase(),
    food,
    isCjk: CJK_RE.test(alias),
  })),
).sort((a, b) => b.alias.length - a.alias.length)

/** Keep letters in any language (Latin, CJK, etc.), digits, and light separators. */
export function normalizeMealText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[，、；;｜|]/g, ' ')
    .replace(/[^\p{L}\p{N}\s./-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function isWordChar(ch: string | undefined): boolean {
  return !!ch && WORD_CHAR_RE.test(ch)
}

function extractQty(before: string): number {
  const tail = before.trim().slice(-24)
  const num = tail.match(/(\d+(?:\.\d+)?)\s*(?:x|×|个|只|碗|份|杯|勺|匙|次)?\s*$/i)
  if (num) return Math.min(12, parseFloat(num[1]!))

  for (const [word, qty] of Object.entries(QTY_WORDS)) {
    if (new RegExp(`(?:^|\\s)${word}\\s*$`, 'i').test(tail)) return qty
    if (CJK_RE.test(word) && tail.endsWith(word)) return qty
  }
  return 1
}

function syntheticFood(est: NonNullable<ReturnType<typeof estimateFiber>>): FoodItem {
  return {
    id: `est:${est.category}:${est.label.toLowerCase()}`,
    name: est.label,
    aliases: [est.label],
    fiberG: est.fiberG,
    serving: est.serving,
    calories: est.calories,
    glpScore: est.glpScore,
  }
}

/**
 * 1) Match curated DB (high confidence)
 * 2) For leftover phrases → category estimate (medium/low confidence)
 */
export function parseMeal(input: string): ParseResult {
  const text = normalizeMealText(input)
  if (!text) {
    return {
      matches: [],
      totalFiberG: 0,
      totalCalories: 0,
      avgGlpScore: 0,
      unmatchedHints: [],
      estimatedCount: 0,
    }
  }

  const used = new Array(text.length).fill(false)
  const matches: MatchedFood[] = []

  for (const { alias, food, isCjk } of ALIAS_INDEX) {
    let from = 0
    while (from < text.length) {
      const idx = text.indexOf(alias, from)
      if (idx === -1) break
      const end = idx + alias.length
      const overlap = used.slice(idx, end).some(Boolean)

      const boundaryOk = isCjk
        ? true
        : (idx === 0 || !isWordChar(text[idx - 1])) &&
          (end >= text.length || !isWordChar(text[end]))

      if (!overlap && boundaryOk) {
        for (let i = idx; i < end; i++) used[i] = true
        const qty = extractQty(text.slice(0, idx))
        matches.push({
          food,
          qty,
          fiberG: Math.round(food.fiberG * qty * 10) / 10,
          matchedAlias: alias,
          source: 'database',
          confidence: 'high',
        })
      }
      from = end
    }
  }

  const unmatchedHints: string[] = []
  const phrases = extractUnmatchedPhrases(text, used)
  for (const phrase of phrases) {
    const est = estimateFiber(phrase)
    if (!est) {
      unmatchedHints.push(phrase)
      continue
    }
    const food = syntheticFood(est)
    matches.push({
      food,
      qty: 1,
      fiberG: est.fiberG,
      matchedAlias: phrase,
      source: 'estimate',
      confidence: est.confidence,
    })
  }

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
      : merged.reduce((s, m) => s + m.food.glpScore * m.fiberG, 0) / Math.max(totalFiberG, 0.1)

  return {
    matches: merged,
    totalFiberG,
    totalCalories,
    avgGlpScore: Math.round(weightedGlp * 10) / 10,
    unmatchedHints,
    estimatedCount: merged.filter((m) => m.source === 'estimate').length,
  }
}

export type Sex = 'female' | 'male' | 'unspecified'
export type AgeGroup = '19-50' | '51+'
export type GoalMode = 'standard' | 'maxxing'

/**
 * U.S. Adequate Intake (AI) style targets commonly cited from IOM
 * (~14g fiber per 1,000 kcal, expressed as daily grams by sex/age).
 */
export function standardFiberAi(sex: Sex, age: AgeGroup): number {
  if (sex === 'female') return age === '19-50' ? 25 : 21
  if (sex === 'male') return age === '19-50' ? 38 : 30
  // Prefer not to say → midpoint of male/female AI for that age band
  return age === '19-50' ? 30 : 25
}

/** Fibermaxxing stretch: Standard × 1.5, capped at 50g. */
export function fiberTarget(sex: Sex, age: AgeGroup, mode: GoalMode): number {
  const standard = standardFiberAi(sex, age)
  if (mode === 'standard') return standard
  return Math.min(50, Math.round(standard * 1.5))
}
