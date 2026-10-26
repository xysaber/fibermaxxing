import type { FoodItem } from '../data/foods'
import { isRecognizedConsumable, recognizeConsumable } from './consumableLexicon'
import { CATEGORY_DEFAULTS, estimateFiber, type FiberCategory, type FiberEstimate } from './estimateFiber'
import { pickNutrientCandidate, resolveMeal, type MatchDisplayTag, type MentionQty } from './resolveMeal'

function estimateFromCategory(phrase: string, category: FiberCategory): FiberEstimate {
  const defaults = CATEGORY_DEFAULTS[category]
  return {
    label: phrase.trim() || category,
    category,
    fiberG: defaults.fiberG,
    calories: defaults.calories,
    glpScore: defaults.glpScore,
    serving: defaults.serving,
    confidence: 'low',
  }
}

/**
 * Estimate path: recipe/classifier first (whole-phrase), then lexicon (short known drinks).
 * Lexicon is substring-based — must not beat “chicken salad” / “PB&J sandwich”.
 */
function estimateForMention(phrase: string, kind: string | undefined): FiberEstimate | null {
  if (kind === 'recipe') {
    const est = estimateFiber(phrase)
    if (est) return est
    return estimateFromCategory(phrase.trim() || 'recipe', 'mixed_dish')
  }
  const est = estimateFiber(phrase)
  if (est) return est
  const recognized = recognizeConsumable(phrase)
  if (recognized?.status === 'estimable') return estimateFromCategory(phrase, recognized.category)
  return null
}

export type { MatchDisplayTag }

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
  /** Product display tag (PRD §5). UI may still map to Database/Estimated until badges ship. */
  tag: MatchDisplayTag
  assumed: boolean
  needsConfirm: boolean
  notes: string[]
}

/** Why calculate returned no match lines (for empty-state copy). */
export type EmptyMealKind = 'not_food' | 'consumable_untracked'

export type ParseResult = {
  matches: MatchedFood[]
  totalFiberG: number
  totalCalories: number
  avgGlpScore: number
  /** Phrases we saw but could not estimate */
  unmatchedHints: string[]
  /**
   * Consumable phrases recognized but still not turned into a nutrient line
   * (e.g. obscure drink). Distinct from gibberish “not food”.
   */
  recognizedUntracked: string[]
  /** Set when matches is empty — drives empty-state messaging. */
  emptyKind: EmptyMealKind | null
  estimatedCount: number
  assumedCount: number
  needsConfirmCount: number
  warnings: string[]
  /** Analytics reliability bucket — never send meal text. */
  reliability: 'reliable' | 'assumed' | 'estimated' | 'partial' | 'empty'
}

const QTY_WORDS: Record<string, number> = {
  a: 1,
  an: 1,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
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

/** Map a FoodIssue qty (or text) into a QtyHit without inventing density. */
function qtyHitFromMention(qty: MentionQty | undefined, phrase: string): QtyHit {
  if (qty) {
    const u = (qty.unit || 'serving').toLowerCase()
    if (u === 'g' || u.startsWith('gram') || u === 'kg') {
      const grams = qty.grams ?? (u === 'kg' ? qty.amount * 1000 : qty.amount)
      return { amount: grams, unit: 'g', raw: '' }
    }
    if (u === 'oz' || u.startsWith('ounce')) return { amount: qty.amount, unit: 'oz', raw: '' }
    if (u.startsWith('tbsp') || u.startsWith('table')) return { amount: qty.amount, unit: 'tbsp', raw: '' }
    if (u.startsWith('tsp') || u.startsWith('tea')) return { amount: qty.amount, unit: 'tsp', raw: '' }
    if (u.startsWith('cup')) return { amount: qty.amount, unit: 'cup', raw: '' }
    return { amount: qty.amount, unit: 'serving', raw: '' }
  }
  // Prefix qty on the issue text itself (e.g. "100g pizza", "3 milk tea")
  const head = phrase.trim()
  const prefix = head.match(
    /^(\d+(?:\.\d+)?|\d+\s*\/\s*\d+|half|one|two|three|four|five|six|seven|eight|nine|ten|a|an)\s*(g|grams?|oz|tbsp|tsp|cups?)?\s+/i,
  )
  if (prefix) {
    return extractQty(prefix[0]!)
  }
  return extractQty(phrase)
}

/**
 * Approx grams for culinary units when the food has no better cup/tbsp serving.
 * Estimate foods: category defaults are per-serving; explicit grams scale from a 100 g reference.
 */
function unitToGrams(unit: QtyHit['unit'], amount: number, food: FoodItem): { grams: number; label: string } {
  if (amount === 0) {
    return { grams: 0, label: '0' }
  }
  if (unit === 'g') {
    return { grams: amount, label: `${trimNum(amount)}g` }
  }
  if (unit === 'oz') {
    const grams = amount * 28.35
    return { grams, label: `${trimNum(amount)} oz` }
  }
  if (unit === 'tbsp') {
    // Prefer food serving when it is already a tbsp; else light density heuristic for estimates only.
    if (/\btbsp\b/i.test(food.serving)) {
      const each = food.servingG / (Number(food.serving.match(/^[\d.]+/)?.[0]) || 1)
      return { grams: amount * each, label: `${trimNum(amount)} tbsp` }
    }
    const gramsEach = food.fiber100g >= 20 ? 10 : food.fiber100g >= 8 ? 12 : 15
    return { grams: amount * gramsEach, label: `${trimNum(amount)} tbsp` }
  }
  if (unit === 'tsp') {
    if (/\btsp\b/i.test(food.serving)) {
      const each = food.servingG / (Number(food.serving.match(/^[\d.]+/)?.[0]) || 1)
      return { grams: amount * each, label: `${trimNum(amount)} tsp` }
    }
    const gramsEach = food.fiber100g >= 20 ? 3 : 5
    return { grams: amount * gramsEach, label: `${trimNum(amount)} tsp` }
  }
  if (unit === 'cup') {
    const cupG = /\bcup\b/i.test(food.serving) ? food.servingG : food.servingG > 0 ? food.servingG : 240
    return { grams: amount * cupG, label: `${trimNum(amount)} cup${amount === 1 ? '' : 's'}` }
  }
  // servings — for estimates, servingG is the modeled portion (often 100 g stand-in)
  return {
    grams: amount * (food.servingG || 100),
    label: amount === 1 ? food.serving : `${trimNum(amount)} × ${food.serving}`,
  }
}

function trimNum(n: number): string {
  return String(Math.round(n * 100) / 100)
}

function confidenceFor(meta: {
  source: MatchedFood['source']
  assumed: boolean
  needsConfirm: boolean
  estimateConfidence?: 'medium' | 'low'
}): MatchedFood['confidence'] {
  // Never mark high when identity/portion still needs confirmation.
  if (meta.needsConfirm || meta.assumed) return meta.source === 'estimate' ? 'low' : 'medium'
  if (meta.source === 'estimate') return meta.estimateConfidence ?? 'low'
  return 'high'
}

export function lineFromFood(
  food: FoodItem,
  qtyHit: QtyHit,
  matchedAlias: string,
  source: MatchedFood['source'],
  confidence: MatchedFood['confidence'],
  meta: Partial<Pick<MatchedFood, 'tag' | 'assumed' | 'needsConfirm' | 'notes'>> = {},
): MatchedFood {
  const { grams, label } = unitToGrams(qtyHit.unit, qtyHit.amount, food)
  const fiberG = Math.round(((food.fiber100g * grams) / 100) * 10) / 10
  const calories = Math.round((food.calories100g * grams) / 100)
  const qty = food.servingG > 0 ? Math.round((grams / food.servingG) * 100) / 100 : qtyHit.amount
  const assumed = meta.assumed ?? false
  const needsConfirm = meta.needsConfirm ?? false
  const tag: MatchDisplayTag =
    meta.tag ?? (source === 'estimate' ? 'estimated' : 'database')
  const resolvedConfidence = confidenceFor({
    source,
    assumed,
    needsConfirm,
    estimateConfidence: confidence === 'low' || confidence === 'medium' ? confidence : undefined,
  })
  return {
    food,
    qty,
    grams: Math.round(grams * 10) / 10,
    fiberG,
    calories,
    matchedAlias,
    unitLabel: label,
    source,
    confidence: resolvedConfidence,
    tag,
    assumed,
    needsConfirm,
    notes: meta.notes ?? [],
  }
}

/**
 * Category defaults are per-serving. Model 1 serving ≈ servingG grams so that
 * explicit gram weights scale correctly without forging fiber100g from per-serving fiber.
 */
function foodFromEstimate(phrase: string, est: NonNullable<ReturnType<typeof estimateFiber>>): FoodItem {
  const servingG = 100
  // Treat category fiber/kcal as the nutrients in one modeled serving (~100 g).
  const fiber100g = est.fiberG
  const calories100g = est.calories
  return {
    id: `estimate:${est.category}:${phrase.toLowerCase().replace(/\s+/g, '_')}`,
    name: `${est.label} (estimated)`,
    aliases: [phrase],
    fiberG: est.fiberG,
    serving: est.serving,
    servingG,
    fiber100g,
    calories: est.calories,
    calories100g,
    glpScore: est.glpScore,
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
    {
      tag: match.tag,
      assumed: match.assumed,
      needsConfirm: match.needsConfirm,
      notes: match.notes,
    },
  )
}

export function summarizeMatches(matches: MatchedFood[]): Pick<
  ParseResult,
  'totalFiberG' | 'totalCalories' | 'avgGlpScore' | 'estimatedCount' | 'assumedCount' | 'needsConfirmCount'
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
    estimatedCount: matches.filter((m) => m.source === 'estimate' || m.tag === 'estimated').length,
    assumedCount: matches.filter((m) => m.assumed || m.tag === 'assumed').length,
    needsConfirmCount: matches.filter((m) => m.needsConfirm || m.tag === 'needs_confirm').length,
  }
}

function reliabilityOf(
  matches: MatchedFood[],
  unmatchedHints: string[],
): ParseResult['reliability'] {
  if (matches.length === 0) return 'empty'
  if (unmatchedHints.length > 0) return 'partial'
  if (matches.some((m) => m.source === 'estimate' || m.tag === 'estimated')) return 'estimated'
  if (matches.some((m) => m.assumed || m.needsConfirm || m.tag === 'assumed' || m.tag === 'needs_confirm')) {
    return 'assumed'
  }
  return 'reliable'
}

function mergeOrAppend(byId: Map<string, MatchedFood>, match: MatchedFood) {
  const previous = byId.get(match.food.id)
  if (!previous) {
    byId.set(match.food.id, match)
    return
  }
  // Always accumulate grams for repeated mentions — never drop a second intake.
  const combined = updateMatchGrams(previous, previous.grams + match.grams)
  combined.confidence =
    previous.confidence === 'high' && match.confidence === 'high' ? 'high' : 'medium'
  if (combined.needsConfirm || combined.assumed) combined.confidence = 'medium'
  combined.assumed = previous.assumed || match.assumed
  combined.needsConfirm = previous.needsConfirm || match.needsConfirm
  combined.tag =
    previous.tag === 'needs_confirm' || match.tag === 'needs_confirm'
      ? 'needs_confirm'
      : previous.assumed || match.assumed
        ? 'assumed'
        : previous.tag
  combined.notes = [...previous.notes, ...match.notes]
  combined.unitLabel = `${trimNum(combined.grams)}g combined`
  byId.set(match.food.id, combined)
}

/** Resolve local food mentions; preserve the existing public result contract. */
export function parseMeal(input: string): ParseResult {
  const { resolved, issues } = resolveMeal(input)
  const byId = new Map<string, MatchedFood>()
  for (const item of resolved) {
    const match = lineFromFood(
      item.food,
      { amount: item.amount, unit: item.unit, raw: '' },
      item.original,
      'database',
      item.assumed || item.needsConfirm ? 'medium' : 'high',
      {
        tag: item.tag,
        assumed: item.assumed,
        needsConfirm: item.needsConfirm,
        notes: item.notes,
      },
    )
    mergeOrAppend(byId, match)
  }

  const unmatchedHints: string[] = []
  for (const issue of issues) {
    if (issue.kind === 'negation') {
      unmatchedHints.push(issue.text)
      continue
    }
    const phrase = issue.text
    const normalized = phrase.toLowerCase().replace(/milktea|milk-tea/g, 'milk tea')
    const qtyHit = qtyHitFromMention(issue.qty, phrase)

    // Portion/ambiguous/spelling with candidates → keep the food; preserve mention qty.
    if (issue.candidates.length > 0) {
      const picked = pickNutrientCandidate(normalized, issue.candidates)
      if (picked) {
        const match = lineFromFood(
          picked.food,
          qtyHit,
          phrase,
          'database',
          'medium',
          {
            tag: 'needs_confirm',
            assumed: true,
            needsConfirm: true,
            notes: [issue.reason],
          },
        )
        mergeOrAppend(byId, match)
        continue
      }
    }
    if (issue.kind === 'portion') {
      unmatchedHints.push(issue.text)
      continue
    }

    const est =
      issue.kind === 'recipe' || issue.kind === 'ambiguous' || issue.kind === 'spelling'
        ? estimateForMention(normalized, issue.kind)
        : null
    if (est) {
      const food = foodFromEstimate(phrase, est)
      // For estimates: serving qty scales nutrients; gram qty uses declared weight.
      const match = lineFromFood(
        food,
        qtyHit,
        phrase,
        'estimate',
        est.confidence,
        {
          tag: issue.kind === 'recipe' ? 'needs_confirm' : 'estimated',
          assumed: true,
          needsConfirm: true,
          notes: [issue.reason],
        },
      )
      mergeOrAppend(byId, match)
      continue
    }
    unmatchedHints.push(issue.text)
  }

  const matches = [...byId.values()].sort((a, b) => b.fiberG - a.fiberG)
  const warnings: string[] = []
  if (/\bwithout\b|\bw\/o\b|不含|不要|别放/.test(normalizeMealText(input))) {
    warnings.push('Negation words (e.g. “without avocado”) are only partially supported — check matched foods.')
  }
  if (matches.some((m) => m.assumed || m.needsConfirm)) {
    warnings.push('Some portions are assumed or need confirmation — totals may be approximate.')
  }

  // Leftover hints that are still edible/drinkable (lexicon), not gibberish.
  const recognizedUntracked = unmatchedHints.filter((hint) => {
    const normalized = hint.toLowerCase().replace(/milktea|milk-tea/g, 'milk tea').trim()
    return isRecognizedConsumable(normalized) || Boolean(estimateFiber(normalized))
  })
  const emptyKind: EmptyMealKind | null =
    matches.length > 0
      ? null
      : recognizedUntracked.length > 0 ||
          unmatchedHints.some((h) => isRecognizedConsumable(h) || Boolean(estimateFiber(h)))
        ? 'consumable_untracked'
        : 'not_food'

  const reliability = reliabilityOf(matches, unmatchedHints)

  return {
    matches,
    ...summarizeMatches(matches),
    unmatchedHints,
    recognizedUntracked,
    emptyKind,
    warnings,
    reliability,
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
