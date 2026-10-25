import { FOODS, type FoodItem } from '../data/foods'
import { estimateFiber, extractUnmatchedPhrases } from './estimateFiber'

export type MatchedFood = {
  food: FoodItem
  /** Multiplier of the food's default serving (when unitMode === 'servings') */
  qty: number
  /** Estimated grams used for this line (when known) */
  grams: number
  fiberG: number
  calories: number
  matchedAlias: string
  unitLabel: string
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
  warnings: string[]
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
    .replace(/½/g, '1/2')
    .replace(/¼/g, '1/4')
    .replace(/¾/g, '3/4')
    .replace(/⅓/g, '1/3')
    .replace(/⅔/g, '2/3')
    .replace(/[，、；;｜|]/g, ' ')
    .replace(/[^\p{L}\p{N}\s./-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function isWordChar(ch: string | undefined): boolean {
  return !!ch && WORD_CHAR_RE.test(ch)
}

function parseNumberToken(raw: string): number | null {
  const t = raw.trim()
  if (!t) return null
  const frac = t.match(/^(\d+)\s*\/\s*(\d+)$/)
  if (frac) {
    const n = parseFloat(frac[1]!)
    const d = parseFloat(frac[2]!)
    if (d === 0) return null
    return n / d
  }
  const mixed = t.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/)
  if (mixed) {
    const whole = parseFloat(mixed[1]!)
    const n = parseFloat(mixed[2]!)
    const d = parseFloat(mixed[3]!)
    if (d === 0) return null
    return whole + n / d
  }
  const num = parseFloat(t)
  return Number.isFinite(num) ? num : null
}

type QtyHit = {
  amount: number
  unit: 'serving' | 'g' | 'oz' | 'tbsp' | 'tsp' | 'cup'
  /** Characters consumed at end of `before` (for debugging / future) */
  raw: string
}

/**
 * Parse quantity immediately before a matched food alias.
 * Supports: 1/2, 2, 100g, 1 tbsp, 2 cups, half, a/an.
 */
export function extractQty(before: string): QtyHit {
  const tail = before.trim().slice(-100)

  // Optional prep words between unit and food: "2 cups cooked lentils"
  const prep = '(?:\\s+(?:cooked|raw|boiled|dried|fresh|frozen|ripe|unsweetened|sweetened|plain|nonfat|lowfat|medium|small|large|whole|milk|slices?|bowls?|of))*'

  // weight / volume with optional unit
  const withUnit = tail.match(
    new RegExp(
      `(\\d+\\s+\\d+\\s*\\/\\s*\\d+|\\d+\\s*\\/\\s*\\d+|\\d+(?:\\.\\d+)?)\\s*(g|grams?|oz|ounces?|tbsp|tablespoons?|tsp|teaspoons?|cups?|碗|杯|勺|匙)${prep}\\s*$`,
      'i',
    ),
  )
  if (withUnit) {
    const amount = parseNumberToken(withUnit[1]!) ?? 1
    const u = withUnit[2]!.toLowerCase()
    let unit: QtyHit['unit'] = 'serving'
    if (u === 'g' || u.startsWith('gram')) unit = 'g'
    else if (u === 'oz' || u.startsWith('ounce')) unit = 'oz'
    else if (u.startsWith('tbsp') || u.startsWith('tablespoon') || u === '勺' || u === '匙') unit = 'tbsp'
    else if (u.startsWith('tsp') || u.startsWith('teaspoon')) unit = 'tsp'
    else if (u.startsWith('cup') || u === '杯' || u === '碗') unit = 'cup'
    const capped =
      unit === 'g' ? Math.min(2000, amount) : unit === 'oz' ? Math.min(40, amount) : Math.min(12, amount)
    return { amount: capped, unit, raw: withUnit[0]! }
  }

  // bare number or fraction right before food: "2 apples", "1/2 apple"
  const bare = tail.match(
    new RegExp(
      `(\\d+\\s+\\d+\\s*\\/\\s*\\d+|\\d+\\s*\\/\\s*\\d+|\\d+(?:\\.\\d+)?)\\s*(?:x|×|个|只|份|次)?${prep}\\s*$`,
      'i',
    ),
  )
  if (bare) {
    const amount = parseNumberToken(bare[1]!) ?? 1
    return { amount: Math.min(12, amount), unit: 'serving', raw: bare[0]! }
  }

  for (const [word, qty] of Object.entries(QTY_WORDS)) {
    if (new RegExp(`(?:^|\\s)${word}\\s*$`, 'i').test(tail)) {
      return { amount: qty, unit: 'serving', raw: word }
    }
    if (CJK_RE.test(word) && tail.endsWith(word)) {
      return { amount: qty, unit: 'serving', raw: word }
    }
  }

  // "a half apple" / "half an apple" handled via half word; default one serving
  return { amount: 1, unit: 'serving', raw: '' }
}

/** Approx grams for culinary units when the food has no better cup/tbsp serving. */
function unitToGrams(unit: QtyHit['unit'], amount: number, food: FoodItem): { grams: number; label: string } {
  if (unit === 'g') {
    return { grams: amount, label: `${trimNum(amount)}g` }
  }
  if (unit === 'oz') {
    const grams = amount * 28.35
    return { grams, label: `${trimNum(amount)} oz` }
  }
  if (unit === 'tbsp') {
    // Seeds/supplements are dense; veggies lighter — use fiber density as a hint
    const gramsEach = food.fiber100g >= 20 ? 10 : food.fiber100g >= 8 ? 12 : 15
    return { grams: amount * gramsEach, label: `${trimNum(amount)} tbsp` }
  }
  if (unit === 'tsp') {
    const gramsEach = food.fiber100g >= 20 ? 3 : 5
    return { grams: amount * gramsEach, label: `${trimNum(amount)} tsp` }
  }
  if (unit === 'cup') {
    // Prefer the food's own cup serving weight when the label looks like a cup
    const cupG = /^Oranges, raw, all commercial varieties$/.test(food.name) ? 180 : /\bcup\b/i.test(food.serving) ? food.servingG : food.servingG > 0 ? food.servingG : 240
    return { grams: amount * cupG, label: `${trimNum(amount)} cup${amount === 1 ? '' : 's'}` }
  }
  // servings
  return {
    grams: amount * (food.servingG || 100),
    label: amount === 1 ? food.serving : `${trimNum(amount)} × ${food.serving}`,
  }
}

function trimNum(n: number): string {
  return String(Math.round(n * 100) / 100)
}

export function lineFromFood(
  food: FoodItem,
  qtyHit: QtyHit,
  matchedAlias: string,
  source: MatchedFood['source'],
  confidence: MatchedFood['confidence'],
): MatchedFood {
  const { grams, label } = unitToGrams(qtyHit.unit, qtyHit.amount, food)
  const fiberG = Math.round(((food.fiber100g * grams) / 100) * 10) / 10
  const calories = Math.round((food.calories100g * grams) / 100)
  const qty = food.servingG > 0 ? Math.round((grams / food.servingG) * 100) / 100 : qtyHit.amount
  return {
    food,
    qty,
    grams: Math.round(grams * 10) / 10,
    fiberG,
    calories,
    matchedAlias,
    unitLabel: label,
    source,
    confidence,
  }
}

export function updateMatchGrams(match: MatchedFood, grams: number): MatchedFood {
  const g = Math.max(0, grams)
  const fiberG = Math.round(((match.food.fiber100g * g) / 100) * 10) / 10
  const calories = Math.round((match.food.calories100g * g) / 100)
  const qty = match.food.servingG > 0 ? Math.round((g / match.food.servingG) * 100) / 100 : match.qty
  return {
    ...match,
    grams: Math.round(g * 10) / 10,
    fiberG,
    calories,
    qty,
    unitLabel: `${trimNum(g)}g`,
  }
}

export function updateMatchServings(match: MatchedFood, servings: number): MatchedFood {
  const amount = Math.max(0, servings)
  return lineFromFood(
    match.food,
    { amount, unit: 'serving', raw: '' },
    match.matchedAlias,
    match.source,
    match.confidence,
  )
}

export function summarizeMatches(matches: MatchedFood[]): Pick<
  ParseResult,
  'totalFiberG' | 'totalCalories' | 'avgGlpScore' | 'estimatedCount'
> {
  const totalFiberG = Math.round(matches.reduce((s, m) => s + m.fiberG, 0) * 10) / 10
  const totalCalories = Math.round(matches.reduce((s, m) => s + m.calories, 0))
  const weightedGlp =
    matches.length === 0
      ? 0
      : matches.reduce((s, m) => s + m.food.glpScore * m.fiberG, 0) / Math.max(totalFiberG, 0.1)
  return {
    totalFiberG,
    totalCalories,
    avgGlpScore: Math.round(weightedGlp * 10) / 10,
    estimatedCount: matches.filter((m) => m.source === 'estimate').length,
  }
}

function syntheticFood(est: NonNullable<ReturnType<typeof estimateFiber>>): FoodItem {
  const servingG = 100
  return {
    id: `est:${est.category}:${est.label.toLowerCase()}`,
    name: est.label,
    aliases: [est.label],
    fiberG: est.fiberG,
    serving: est.serving,
    servingG,
    fiber100g: est.fiberG,
    calories: est.calories,
    calories100g: est.calories,
    glpScore: est.glpScore,
  }
}

function hasNegationBefore(text: string, idx: number): boolean {
  const window = text.slice(Math.max(0, idx - 24), idx)
  return /\b(without|no|hold the|hold|minus|w\/o)\s+$/i.test(window) || /不含|不要|别放\s*$/.test(window)
}

/**
 * 1) Match curated DB (high confidence)
 * 2) For leftover phrases → category estimate (medium/low confidence)
 */
export function parseMeal(input: string): ParseResult {
  const text = normalizeMealText(input)
  const warnings: string[] = []
  if (!text) {
    return {
      matches: [],
      totalFiberG: 0,
      totalCalories: 0,
      avgGlpScore: 0,
      unmatchedHints: [],
      estimatedCount: 0,
      warnings,
    }
  }

  if (/\bwithout\b|\bw\/o\b|不含|不要|别放/.test(text)) {
    warnings.push('Negation words (e.g. “without avocado”) are only partially supported — check matched foods.')
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
        if (hasNegationBefore(text, idx)) {
          // Skip negated mentions; still mark span used so estimates don't revive them
          for (let i = idx; i < end; i++) used[i] = true
        } else {
          for (let i = idx; i < end; i++) used[i] = true
          // Also consume unit/qty tokens just before so leftover phrases stay clean
          const before = text.slice(0, idx)
          let qtyHit = extractQty(before)
          if (qtyHit.raw && used.slice(idx - qtyHit.raw.length, idx).some(Boolean)) {
            qtyHit = { amount: 1, unit: 'serving', raw: '' }
          }
          if (qtyHit.raw) {
            const rawIdx = before.toLowerCase().lastIndexOf(qtyHit.raw.toLowerCase().trim())
            if (rawIdx >= 0) {
              for (let i = rawIdx; i < idx; i++) {
                if (text[i] && text[i] !== ' ') used[i] = true
              }
            }
          }
          matches.push(lineFromFood(food, qtyHit, alias, 'database', 'high'))
        }
      }
      from = end
    }
  }

  const unmatchedHints: string[] = []
  const phrases = extractUnmatchedPhrases(text, used)
  for (const phrase of phrases) {
    // Skip pure unit/qty leftovers
    if (/^(\d+\s*\/\s*\d+|\d+(?:\.\d+)?)(\s*(g|oz|cup|tbsp|tsp)s?)?$/i.test(phrase.trim())) continue
    if (/^(cooked|raw|boiled|dried|frozen|canned)$/i.test(phrase.trim())) continue

    const est = estimateFiber(phrase)
    if (!est) {
      unmatchedHints.push(phrase)
      continue
    }
    const food = syntheticFood(est)
    matches.push(lineFromFood(food, { amount: 1, unit: 'serving', raw: '' }, phrase, 'estimate', est.confidence))
  }

  const byId = new Map<string, MatchedFood>()
  for (const m of matches) {
    const prev = byId.get(m.food.id)
    if (prev) {
      const grams = prev.grams + m.grams
      const merged = updateMatchGrams(prev, grams)
      merged.matchedAlias = prev.matchedAlias
      merged.unitLabel = `${trimNum(grams)}g combined`
      byId.set(m.food.id, merged)
    } else {
      byId.set(m.food.id, { ...m })
    }
  }
  const merged = [...byId.values()].sort((a, b) => b.fiberG - a.fiberG)
  const summary = summarizeMatches(merged)

  return {
    matches: merged,
    ...summary,
    unmatchedHints,
    warnings,
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
