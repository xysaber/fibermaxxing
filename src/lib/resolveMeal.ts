import { FOODS, type FoodItem } from '../data/foods'

export type PortionUnit = 'serving' | 'g' | 'oz' | 'tbsp' | 'tsp' | 'cup'
export type MatchDisplayTag = 'database' | 'assumed' | 'needs_confirm' | 'estimated'
export type PortionDimension = 'mass' | 'volume' | 'count' | 'serving'

export type MentionQty = {
  amount: number
  unit: PortionUnit | string
  grams?: number
}

export type FoodIssue = {
  id: string
  text: string
  reason: string
  candidates: FoodItem[]
  /** Recipe / ambiguous / spelling — UI may treat as needs_confirm */
  kind?: 'recipe' | 'ambiguous' | 'spelling' | 'portion' | 'negation'
  /** Parsed quantity for this mention — estimate/candidate paths must not invent 1 serving */
  qty?: MentionQty
}
export type ResolvedFood = {
  food: FoodItem
  original: string
  amount: number
  unit: PortionUnit
  assumed: boolean
  needsConfirm: boolean
  tag: MatchDisplayTag
  notes: string[]
  candidates?: FoodItem[]
}

type Concept = { names: string[]; id: string; count?: number; cup?: number; tbsp?: number; tsp?: number }
// Reviewed everyday concepts are separate from generated USDA aliases. IDs retain
// the original nutrient density; optional weights describe explicit household portions.
const CONCEPTS: Concept[] = [
  { names: ['apple'], id: 'curated:apple' },
  { names: ['avocado', 'avo'], id: 'curated:avocado' },
  { names: ['egg'], id: 'curated:egg' },
  { names: ['fried egg'], id: '173423' },
  { names: ['poached egg'], id: '172186' },
  { names: ['oatmeal', 'cooked oatmeal', 'oat porridge', 'porridge'], id: 'curated:oatmeal', cup: 234 },
  { names: ['oat', 'rolled oat', 'dry oat'], id: 'curated:oats', cup: 80 },
  { names: ['psyllium', 'psyllium husk'], id: 'curated:psyllium', tbsp: 9, tsp: 3 },
  { names: ['inulin', 'inulin powder'], id: 'curated:inulin', tsp: 5 },
  { names: ['sourdough', 'sourdough bread', 'sourdough toast'], id: 'curated:sourdough' },
  { names: ['orange', 'raw orange'], id: '169097', count: 131, cup: 180 },
  { names: ['tomato', 'raw tomato'], id: '170457', count: 123, cup: 180 },
  { names: ['black bean', 'cooked black bean'], id: '173735', cup: 172 },
  { names: ['chickpea', 'garbanzo bean', 'cooked chickpea'], id: '173757', cup: 164 },
  { names: ['quinoa', 'cooked quinoa'], id: '168917', cup: 185 },
  { names: ['pear', 'raw pear'], id: '169118', count: 178, cup: 140 },
  { names: ['almond'], id: '170567', count: 1.2, cup: 95 },
  { names: ['flaxseed', 'flax seed', 'ground flaxseed'], id: '169414', tbsp: 10, tsp: 3.3 },
  { names: ['spinach', 'raw spinach'], id: '168462', cup: 30 },
  { names: ['carrot', 'raw carrot'], id: '170393', count: 61, cup: 110 },
  { names: ['boiled carrot', 'cooked carrot', 'carrot boiled'], id: '170394', cup: 78 },
  { names: ['peanut butter', 'smooth peanut butter'], id: '172470', tbsp: 16, tsp: 5.3, cup: 258 },
  { names: ['almond butter'], id: '168588', tbsp: 16, tsp: 5.3, cup: 250 },
  { names: ['banana', 'raw banana'], id: '173944', count: 118, cup: 150 },
  { names: ['chia', 'chia seed'], id: '170554', tbsp: 10, tsp: 3 },
  { names: ['lentil', 'cooked lentil'], id: '172421', cup: 198 },
  { names: ['raw lentil', 'lentil raw', 'dry lentil', 'uncooked lentil'], id: '172420', cup: 192 },
  { names: ['whole wheat bread', 'whole wheat toast'], id: '172689' },
  { names: ['blueberry', 'raw blueberry'], id: '171711', cup: 148 },
  { names: ['frozen blueberry', 'blueberry frozen'], id: '173950', cup: 155 },
  { names: ['raspberry'], id: '167755', cup: 123 },
  { names: ['strawberry'], id: '167762', count: 12, cup: 144 },
  { names: ['brown rice', 'cooked brown rice'], id: '169704', cup: 202 },
  { names: ['broccoli', 'cooked broccoli'], id: '169967', cup: 78 },
  { names: ['raw broccoli', 'broccoli raw'], id: '170379', cup: 91 },
  { names: ['cabbage', 'cooked cabbage', 'boiled cabbage'], id: '168514', cup: 75 },
  { names: ['raw cabbage'], id: '169335', cup: 35 },
  { names: ['hummus'], id: '174289', cup: 246, tbsp: 15.375, tsp: 5.125 },
  { names: ['plain nonfat greek yogurt', 'nonfat greek yogurt', 'yogurt greek plain nonfat'], id: '170894' },
  { names: ['plain lowfat greek yogurt', 'lowfat greek yogurt', 'yogurt greek plain lowfat'], id: '170903' },
  { names: ['whole milk greek yogurt', 'yogurt greek plain whole milk'], id: '171304' },
  // Plain “milk” defaults to whole fluid milk — not buttermilk/chocolate/dried.
  { names: ['milk', 'whole milk', 'whole fluid milk'], id: '171265', cup: 244 },
  { names: ['2% milk', '2 percent milk', 'reduced fat milk'], id: '170870', cup: 245 },
  { names: ['1% milk', '1 percent milk', 'lowfat milk', 'low fat milk'], id: '173441', cup: 244 },
  { names: ['skim milk', 'nonfat milk', 'fat free milk', 'fatfree milk'], id: '169868', cup: 247 },
  // Meat chicken only — never meatless/fried unless the user said so.
  { names: ['chicken', 'grilled chicken', 'roasted chicken', 'baked chicken', 'chicken grilled', 'chicken roasted'], id: '172395', cup: 140 },
  { names: ['chicken breast', 'grilled chicken breast', 'chicken breast grilled', 'roasted chicken breast'], id: '171140' },
  { names: ['fried chicken', 'chicken fried'], id: '171053', cup: 140 },
]

const FORMS: Record<string, string> = {
  tomatoes: 'tomato', tomatos: 'tomato', potatoes: 'potato', blueberries: 'blueberry',
  raspberries: 'raspberry', strawberries: 'strawberry', berries: 'berry',
  milktea: 'milk tea', 'milk-tea': 'milk tea', yoghurt: 'yogurt',
  'fat free': 'nonfat', 'low fat': 'lowfat',
}
export function normalizeFoodPhrase(value: string): string {
  let s = value.toLowerCase().replace(/[’']/g, '').replace(/-/g, ' ').replace(/\s+/g, ' ').trim()
  for (const [from, to] of Object.entries(FORMS)) s = s.replace(new RegExp(`\\b${from}\\b`, 'g'), to)
  return s.split(' ').map(w => w.length > 3 && w.endsWith('s') && !w.endsWith('ss') && !/^(couscous|asparagus|hummus|citrus)$/.test(w) ? w.slice(0, -1) : w).join(' ')
}

const byId = new Map(FOODS.map(f => [f.id, f]))
const concepts = CONCEPTS.flatMap(c => {
  const original = byId.get(c.id)
  if (!original) throw new Error(`Missing reviewed food ID: ${c.id}`)
  const g = c.count ?? original.servingG
  const food = { ...original, servingG: g, serving: c.count ? '1 medium (edible portion)' : original.serving,
    fiberG: Math.round(original.fiber100g * g / 10) / 10, calories: Math.round(original.calories100g * g / 100) }
  return [{ ...c, food, names: c.names.map(normalizeFoodPhrase) }]
})
const headIndex = FOODS.map(food => ({ food, head: normalizeFoodPhrase(food.name.split(',')[0]!) }))
const RECIPE = /\b(milk tea|bubble tea|boba|smoothie|pudding|salad|soup|pizza|sandwich|burrito|curry|wrap|burger)\b/
// Preparation describes a food; it is not part of the food's identity.
// Plain heat methods may use a genuinely generic cooked reference, but never
// erase ingredient changes (breaded, meatless) or substitute raw/specific forms.
const HEAT_METHOD = /\b(?:grilled|roasted|baked|boiled|steamed|poached)\b/
const IDENTITY_PREPARATION = /\b(?:hard boiled|soft boiled|grilled|roasted|baked|boiled|steamed|poached|cooked|raw|frozen)\b/g
const SPECIFIC_METHOD = /\b(?:grilled|roasted|baked|boiled|steamed|poached|fried|scrambled|braised|breaded)\b/
function genericCooked(food: FoodItem): boolean {
  const name = normalizeFoodPhrase(food.name)
  return /\bcooked\b/.test(name) && !SPECIFIC_METHOD.test(name) && !/\b(?:meatless|vegan|raw|uncooked)\b/.test(name)
}
/** Extra forms that must not be selected unless the user gave evidence. */
const EVIDENCE_REQUIRED = [
  /\b(meatless|vegan|vegetarian|plant based)\b/,
  /\b(fried|deep fried)\b/,
  /\bbreaded\b/,
  /\b(dry|dried|dehydrated|uncooked)\b/,
  /\bsweetened\b/,
  /\bcanned\b/,
  /\bsmoked\b/,
  /\bflavored\b/,
  /\b(kimchi|pickled|fermented)\b/,
  /\b(roll|deli|tenders?)\b/,
  /\bfrozen\b/,
]
function compatible(text: string, food: FoodItem, opts: { curated?: boolean } = {}): boolean {
  const name = normalizeFoodPhrase(food.name)
  for (const attr of EVIDENCE_REQUIRED) {
    if (attr.test(name) && !attr.test(text)) {
      // USDA seed/nut rows are often labeled “dried”; curated concepts already chose that row.
      if (opts.curated && /\b(dry|dried|dehydrated|uncooked)\b/.test(attr.source)) continue
      return false
    }
    if (attr.test(text) && !attr.test(name)) return false
  }
  // Bidirectional raw ↔ cooked: never mix when the user was explicit.
  if (/\braw\b/.test(text) && /\b(cooked|boiled|steamed|fried|roasted|baked)\b/.test(name) && !/\braw\b/.test(name)) {
    return false
  }
  if (/\braw\b/.test(name) && !/\braw\b/.test(text) && (/\bcooked\b/.test(text) || HEAT_METHOD.test(text) || /\bfried\b/.test(text))) {
    return false
  }
  if ((/\bcooked\b/.test(text) || HEAT_METHOD.test(text)) && /\b(raw|uncooked|dry)\b/.test(name)) return false
  // Heat methods are a family: grilled may use roasted/generic cooked; never fried.
  if (HEAT_METHOD.test(text)) {
    if (/\bfried\b|\bbreaded\b|\bmeatless\b|\broll\b|\bdeli\b/.test(name)) return false
    if (genericCooked(food) || HEAT_METHOD.test(name) || /\bcooked\b/.test(name)) {
      /* ok */
    } else if (!/\bcooked\b/.test(name)) {
      return false
    }
  }
  if (/\bnonfat\b/.test(text) && !/\bnonfat\b/.test(name)) return false
  if (/\blowfat\b/.test(text) && !/\blowfat\b/.test(name)) return false
  return true
}

/** Product forms that usually are NOT what a bare everyday word means. */
const SPECIALTY_FORM =
  /\b(chocolate|buttermilk|canned|evaporated|condensed|dried|dehydrated|dry|frozen|sweetened|flavored|imitation|filled|malted|goat|sheep|buffalo|human|low sodium|calcium fortified|meatless|breaded|fried|smoked|salted|pickled|fermented|kimchi|powder|instant|eggnog|shake|dessert|pudding|soup|gravy|sauce|substitute|nondairy|sticks?|cured|pastrami|bologna|glutinous|wild|hash brown|scalloped|mashed|ready to eat|restaurant|fast food|uncle bens|parboiled|separable fat|breakfast strips|nuggets?|patty|patties|crumb|stuffing|flour|bran|germ|peel|roll|deli)\b/
/** Preparation / grade words allowed on a default everyday row. */
const PREP_OK = new Set([
  'raw', 'cooked', 'boiled', 'baked', 'fluid', 'plain', 'fresh', 'mature', 'seed', 'seeds',
  'whole', 'white', 'brown', 'enriched', 'unenriched', 'regular', 'commercial', 'varieties',
  'all', 'flesh', 'skin', 'and', 'or', 'with', 'without', 'salt', 'added', 'vitamin', 'vitamins',
  'a', 'd', 'includes', 'foods', 'for', 'usda', 'food', 'distribution', 'program', 'the', 'of',
  'from', 'home', 'prepared', 'long', 'grain', 'medium', 'short', 'grain', 'milkfat', 'fat',
  'content', 'unspecified', 'ground', 'retail', 'cuts', 'edible', 'portion', 'broiler', 'fryers',
  'breast', 'skinless', 'boneless', 'meat', 'only', 'roasting',
])
/** Common default varieties when the query is only the commodity head. */
const COMMON_VARIETY: Record<string, RegExp> = {
  milk: /\b(whole|fluid).*\b(fluid|whole)\b|\bwhole,?\s*3\.25|\bfluid,?\s*whole\b/i,
  cheese: /\b(cheddar|mozzarella|swiss|american|colby)\b/i,
  bread: /\b(white|wheat|whole wheat)\b/i,
  rice: /\bwhite\b.*\b(cooked|raw)\b|\bcooked\b.*\bwhite\b/i,
  beef: /\bground\b/i,
  pork: /\bfresh\b|\bground\b/i,
  potato: /\bflesh and skin\b|\bboiled\b|\bbaked\b/i,
  yogurt: /\bplain\b/i,
  onion: /\braw\b/i,
  garlic: /\braw\b/i,
  tofu: /\bfirm|regular\b/i,
}
const SCORE_GAP = 8

/**
 * Rank nutrient rows for a mention. Prefer the simplest everyday form;
 * penalize specialty modifiers the user did not say. Never used to invent
 * a match from unrelated foods — only to order an existing candidate set.
 */
export function rankNutrientCandidates(
  query: string,
  foods: FoodItem[],
): { food: FoodItem; score: number }[] {
  const q = normalizeFoodPhrase(query)
  const qTokens = new Set(q.split(/\s+/).filter(Boolean))
  const headKey = q.split(/\s+/)[0] ?? q
  const varietyBonus = COMMON_VARIETY[headKey]
  return foods
    .map(food => {
      const rawName = food.name
      const name = normalizeFoodPhrase(rawName)
      const head = normalizeFoodPhrase(rawName.split(',')[0] ?? rawName)
      const parts = rawName.split(',').map(p => p.trim())
      let score = 0
      if (name === q) score += 100
      if (head === q) score += 35

      // Prefer commodity + light preparation (1–3 comma segments), not long specialty titles.
      const extraParts = Math.max(0, parts.length - 1)
      score -= Math.max(0, extraParts - 2) * 6

      if (SPECIALTY_FORM.test(name) && !SPECIALTY_FORM.test(q)) score -= 45

      // Unexplained contentful tokens beyond the query.
      let unexplained = 0
      for (const token of name.split(/[,\s]+/).filter(Boolean)) {
        if (qTokens.has(token) || PREP_OK.has(token) || token.length <= 1) continue
        if (/^\d/.test(token)) continue
        unexplained += 1
        if (SPECIALTY_FORM.test(token)) score -= 20
      }
      score -= unexplained * 8
      if (unexplained === 0) score += 18
      else if (unexplained === 1) score += 8

      // Everyday preparation cues.
      if (/\b(raw|fluid|plain|cooked|boiled)\b/.test(name) && !SPECIALTY_FORM.test(name)) score += 12
      if (varietyBonus?.test(rawName) && !SPECIALTY_FORM.test(name)) score += 28

      // Milk: fluid whole beats dry powder even if both say “whole”.
      if (/\bmilk\b/.test(q)) {
        if (/\bfluid\b/.test(name) && /\bwhole\b/.test(name)) score += 20
        if (/\b(dry|dried|powder)\b/.test(name)) score -= 40
      }

      if (/\bcup\b|\bmedium\b|\begg\b|\bslice\b/i.test(food.serving)) score += 2
      return { food, score }
    })
    .sort((a, b) => b.score - a.score || a.food.name.length - b.food.name.length)
}

/** Pick a row from candidates; multi-hit → best row + needsConfirm (do not discard). */
export function pickNutrientCandidate(
  query: string,
  foods: FoodItem[],
): { food: FoodItem; needsConfirm: boolean; candidates: FoodItem[] } | null {
  if (!foods.length) return null
  const ranked = rankNutrientCandidates(query, foods)
  const best = ranked[0]
  if (!best) return null
  // Reject specialty garbage when score is deeply negative and a clearer row exists — or alone.
  if (best.score < -20 && foods.length === 1) return null
  const second = ranked[1]
  const clear = !second || best.score - second.score >= SCORE_GAP
  // Auto-adopt only when score is not a specialty dump.
  if (best.score < 0 && !clear) {
    return {
      food: best.food,
      needsConfirm: true,
      candidates: ranked.slice(0, 6).map(r => r.food),
    }
  }
  return {
    food: best.food,
    needsConfirm: foods.length > 1 || !clear,
    candidates: ranked.slice(0, 6).map(r => r.food),
  }
}

function number(raw: string): number {
  const parts = raw.trim().split(/\s+/)
  const last = parts.pop()!
  const fraction = last.split('/')
  const value = fraction.length === 2 ? Number(fraction[0]) / Number(fraction[1]) : Number(last)
  return value + (parts.length ? Number(parts[0]) : 0)
}
const NUMBER = '(?:\\d+\\s+\\d+\\/\\d+|\\d+\\/\\d+|\\d+(?:\\.\\d+)?|half an?\\b|half\\b|one\\b|two\\b|three\\b|four\\b|five\\b|six\\b|seven\\b|eight\\b|nine\\b|ten\\b|an?\\b)'
const QUANTITY = new RegExp(`^(${NUMBER})\\s*(?:(kg|grams?|g|ounces?|oz|tablespoons?|tbsp|teaspoons?|tsp|cups?|slices?|bowls?|servings?|ml|liters?|l)(?![a-z]))?(?=\\s|$|[a-z])\\s*(?:of\\s+)?`, 'i')
const WORD_NUMBERS: Record<string, number> = {
  half: .5, one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  a: 1, an: 1, 'half a': .5, 'half an': .5,
}

/** Protect multi-word foods / sandwiches before clause splitting. */
const COMPOUND_PHRASES = [
  'peanut butter and jelly sandwich',
  'peanut butter jelly sandwich',
  'pb and j sandwich',
  'pb&j sandwich',
  'peanut butter',
  'almond butter',
  'almond milk',
  'vegetable oil',
  'chicken salad',
  'egg salad',
  'tuna salad',
  'milk tea',
  'bubble tea',
  'green tea',
  'greek yogurt',
  'peanut butter sandwich',
]

function protectCompounds(text: string): { text: string; map: Map<string, string> } {
  const map = new Map<string, string>()
  let out = text
  let i = 0
  for (const phrase of COMPOUND_PHRASES) {
    const re = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    out = out.replace(re, (match) => {
      const key = `__cmp${i++}__`
      map.set(key, match)
      return key
    })
  }
  return { text: out, map }
}

function restoreCompounds(text: string, map: Map<string, string>): string {
  let out = text
  for (const [key, value] of map) out = out.replaceAll(key, value)
  return out
}

/**
 * Split meal text into food mentions. Protects compounds, decimals, and binds
 * “without X” only to the immediate object (not later “and …” foods).
 */
function splitMentions(text: string): { clause: string; negated: boolean }[] {
  const { text: protectedText, map } = protectCompounds(text)
  // Split on list separators; do not treat decimal points as boundaries.
  const parts: string[] = []
  const seps: string[] = []
  const splitRe = /[,;\n+，；、]|(?<!\d)\.(?!\d)|\b(?:and|with|plus|topped with|alongside|without|no|hold the|minus)\b/gi
  let last = 0
  for (const m of protectedText.matchAll(splitRe)) {
    parts.push(protectedText.slice(last, m.index))
    seps.push(m[0]!)
    last = (m.index ?? 0) + m[0]!.length
  }
  parts.push(protectedText.slice(last))

  const mentions: { clause: string; negated: boolean }[] = []
  let negateNext = false
  for (let i = 0; i < parts.length; i++) {
    const raw = restoreCompounds(parts[i]!.trim(), map)
    if (i > 0) {
      const sep = seps[i - 1]!.toLowerCase().trim()
      // “without skin” / “no sauce” only excludes the immediate next token.
      if (/^without$|^no$|^hold the$|^minus$/.test(sep)) negateNext = true
      else negateNext = false
    }
    if (!raw) {
      negateNext = false
      continue
    }
    mentions.push({ clause: raw, negated: negateNext })
    negateNext = false
  }
  return mentions
}

function pieceWeightG(food: FoodItem, concept?: (typeof concepts)[number]): number | undefined {
  if (concept?.count != null) return concept.count
  if (/^1 (medium|large|small|egg)\b/i.test(food.serving)) return food.servingG
  if (/^1 slice\b/i.test(food.serving)) return food.servingG
  return undefined
}

function servingIsCupSized(food: FoodItem): boolean {
  return /\bcup\b/i.test(food.serving)
}

/** Local food mentions: separators survive until quantity and negation binding. */
export function resolveMeal(input: string): { resolved: ResolvedFood[]; issues: FoodIssue[] } {
  const resolved: ResolvedFood[] = []
  const issues: FoodIssue[] = []
  // Keep newlines as list separators; only collapse horizontal whitespace.
  let text = input.toLowerCase().replace(/½/g, '1/2').replace(/¼/g, '1/4').replace(/¾/g, '3/4')
    .replace(/\b(?:i (?:ate|had|eat|drank|drink|had drunk)|for (?:breakfast|lunch|dinner)|breakfast:|lunch:|dinner:)\s*/g, '')
    .replace(/\b(?:today|yesterday|tonight|this morning|this evening|now)\b/g, ' ')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .trim()

  // Whole-clause negation: “I did not eat an apple”
  if (/\b(?:did not|didn't|didnt|do not|don't|dont)\s+(?:eat|have|drink|ate)\b/.test(input.toLowerCase())) {
    const rest = text
      .replace(/\b(?:did not|didn't|didnt|do not|don't|dont)\s+(?:eat|have|drink|ate)\s*/g, '')
      .trim()
    if (rest) {
      issues.push({
        id: 'mention-neg',
        text: rest,
        reason: 'Negated — this food was not eaten.',
        candidates: [],
        kind: 'negation',
      })
    }
    return { resolved, issues }
  }

  const mentions = splitMentions(text)
  mentions.forEach((mention, i) => {
    const original = mention.clause.trim()
    if (!original) return
    if (mention.negated) {
      // Modifier-only exclusions (skin, salt) — skip quietly unless it looks like a food.
      if (/\b(skin|salt|sugar|sauce|dressing|cheese|oil|butter)\b/i.test(original) && original.split(/\s+/).length <= 2) {
        return
      }
      issues.push({
        id: `mention-${i}`,
        text: original,
        reason: 'Excluded by “without/no”.',
        candidates: [],
        kind: 'negation',
      })
      return
    }

    const pushIssue = (
      reason: string,
      candidates: FoodItem[] = [],
      kind: FoodIssue['kind'] = 'ambiguous',
      qty?: MentionQty,
    ) => issues.push({ id: `mention-${i}`, text: original, reason, candidates: candidates.slice(0, 6), kind, qty })

    let phrase = original.replace(/^[.\s]+|[.\s]+$/g, '')
    let q = phrase.match(QUANTITY)
    // Postfix weights are accepted without borrowing numbers from other mentions.
    if (!q) {
      const suffix = phrase.match(/\s+(\d+(?:\.\d+)?\s*(?:g|grams?|oz|kg))$/)
      if (suffix) { phrase = `${suffix[1]} ${phrase.slice(0, suffix.index)}`; q = phrase.match(QUANTITY) }
    }
    const amount = q ? WORD_NUMBERS[q[1]!.toLowerCase()] ?? number(q[1]!) : 1
    const rawUnit = q?.[2]?.toLowerCase() ?? ''
    if (q) phrase = phrase.slice(q[0].length).trim()
    if (!Number.isFinite(amount) || amount < 0 || amount > 10000) {
      pushIssue('Enter a valid portion; this amount was not counted.', [], 'portion')
      return
    }
    const qtySnapshot: MentionQty = { amount, unit: rawUnit || 'serving' }
    const normalized = normalizeFoodPhrase(phrase)
    if (!normalized || /^(plain|nonfat|medium|small|large|grilled|raw|cooked)( (plain|nonfat|medium|small|large))*$/.test(normalized)) {
      if (normalized) pushIssue('Name the food, not only its size or preparation.', [], 'ambiguous', qtySnapshot)
      return
    }
    if (RECIPE.test(normalized)) {
      pushIssue('Recipe and portion vary. Confirm volume/ingredients, or enter items separately.', [], 'recipe', qtySnapshot)
      return
    }
    // A controlled concept must explain the whole food phrase. No substring wins.
    const stripped = normalized
      .replace(/\b(?:medium|fresh|ripe|a|an|of|bowl|slice|small|large)\b/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    const tokens = (value: string) => value.split(' ').sort().join(' ')
    const identity = stripped.replace(IDENTITY_PREPARATION, '').replace(/\s+/g, ' ').trim()
    const exactConcept = concepts.find(c => c.names.some(name => tokens(name) === tokens(normalized) || tokens(name) === tokens(stripped)))
    const concept = exactConcept
      ?? concepts.find(c => c.names.some(name => tokens(name) === tokens(identity)) && compatible(normalized, c.food, { curated: true }))
    let corrected = false
    let food: FoodItem | undefined = concept?.food
    let activeConcept = concept
    let pickNeedsConfirm = false
    let altCandidates: FoodItem[] = []
    let spellingConfirm = false
    // Unique one-character spelling suggestions: auto-adopt with confirm (preserve qty).
    if (!food && stripped.length >= 5 && !stripped.includes(' ')) {
      const edits = (a: string, b: string) => {
        if (Math.abs(a.length - b.length) > 1) return false
        for (let j = 0; j < Math.max(a.length, b.length); j++) {
          if (a[j] === b[j]) continue
          return a.slice(j + (a.length >= b.length ? 1 : 0)) === b.slice(j + (b.length >= a.length ? 1 : 0))
        }
        return true
      }
      const suggestions = concepts.filter(c => c.names.some(n => edits(stripped, n)))
      if (suggestions.length === 1) {
        food = suggestions[0]!.food
        activeConcept = suggestions[0]
        pickNeedsConfirm = true
        spellingConfirm = true
      } else if (suggestions.length > 1) {
        pushIssue('Possible spelling match. Confirm the food and weight before adding.', suggestions.map(c => c.food), 'spelling', qtySnapshot)
        return
      }
    }
    // Bare “greek yogurt” has several fat levels — pick a default, mark confirm.
    if (!food && /^(plain )?greek yogurt$/.test(normalized)) {
      const yogurtPick = pickNutrientCandidate(
        normalized,
        concepts.filter(c => /Yogurt, Greek/.test(c.food.name)).map(c => c.food),
      )
      if (yogurtPick) {
        food = yogurtPick.food
        pickNeedsConfirm = true
        altCandidates = yogurtPick.candidates
      }
    }
    if (!food) {
      const headBare = stripped.replace(/\b(?:grilled|roasted|fried|breaded|raw|cooked|dried|meatless|vegan|small|large|frozen|boiled)\b/g, '').replace(/\s+/g, ' ').trim()
      const pool = headIndex
        .filter(c => c.head === normalized || c.head === stripped || c.head === headBare || normalizeFoodPhrase(c.food.name) === normalized)
        .filter(c => compatible(normalized, c.food))
        .map(c => c.food)
      // Dedupe by id while preserving order.
      const seen = new Set<string>()
      const candidates = pool.filter(f => (seen.has(f.id) ? false : (seen.add(f.id), true)))
      const picked = pickNutrientCandidate(normalized, candidates)
      if (!picked) {
        pushIssue('No reliable match. Search for the exact food, or rewrite this item.', [], 'ambiguous', qtySnapshot)
        return
      }
      // Soft gate: do not auto-adopt when best score is a specialty dump with weak margin.
      if (picked.needsConfirm && rankNutrientCandidates(normalized, candidates)[0]!.score < -10) {
        pushIssue('Several forms match; confirm the exact product.', picked.candidates, 'ambiguous', qtySnapshot)
        return
      }
      food = picked.food
      pickNeedsConfirm = picked.needsConfirm
      altCandidates = picked.candidates
    } else {
      // Defaults are explicitly curated; explicit modifiers must still agree.
      if (!compatible(normalized, food, { curated: true })) {
        pushIssue('This preparation does not match the reference food. Choose the exact form.', [food], 'ambiguous', qtySnapshot)
        return
      }
    }
    const notes: string[] = []
    if (FORMS[phrase] || normalized !== phrase.replace(/-/g, ' ')) corrected = true
    if (corrected) notes.push(`Normalized from “${original}”.`)
    if (pickNeedsConfirm) {
      notes.push('Several forms match this name; using the closest everyday reference. Confirm the product if needed.')
    }
    if (spellingConfirm) {
      notes.push(`Possible spelling match for “${phrase}”. Confirm before relying on this total.`)
    }

    // ——— Portion dimension model ———
    let unit: PortionUnit = 'serving'
    let portion = amount
    let portionAssumed = false
    let locked: PortionDimension | null = null

    /** Identity kept with 1× default serving — never reuse amount as cup-sized servings. */
    const assumeDefaultServings = (why: string, servings = 1) => {
      unit = 'serving'
      portion = amount === 0 ? 0 : Math.max(0, servings)
      portionAssumed = true
      pickNeedsConfirm = true
      locked = 'serving'
      if (amount === 0) {
        notes.push(`${why} Zero portion — no nutrients counted.`)
      } else {
        notes.push(
          `${why} Using ${portion} × default serving (≈ ${Math.round(food!.servingG * portion * 10) / 10} g). Confirm edible weight.`,
        )
      }
    }

    if (/^(g|gram|kg)/.test(rawUnit)) {
      unit = 'g'
      portion = rawUnit === 'kg' ? amount * 1000 : amount
      locked = 'mass'
      qtySnapshot.grams = portion
    } else if (/^(oz|ounce)/.test(rawUnit)) {
      unit = 'oz'
      portion = amount
      locked = 'mass'
      qtySnapshot.grams = amount * 28.35
    } else if (/^(ml|l|liter)/.test(rawUnit)) {
      const ml = /^l(?:iter)?s?$/.test(rawUnit) ? amount * 1000 : amount
      const cupG =
        activeConcept?.cup ??
        (/\bcup\b/i.test(food.serving) ? food.servingG / (Number(food.serving.match(/^[\d.]+/)?.[0]) || 1) : undefined)
      if (cupG) {
        portion = (ml / 240) * cupG
        unit = 'g'
        portionAssumed = true
        pickNeedsConfirm = true
        locked = 'mass'
        notes.push(`Volume ${ml} ml ≈ ${Math.round(portion * 10) / 10} g via cup density. Confirm edible weight.`)
      } else {
        assumeDefaultServings(`Could not convert ${rawUnit} for this food.`, 1)
      }
    } else if (/^(cup|tbsp|tablespoon|tsp|teaspoon)/.test(rawUnit)) {
      const household = rawUnit.startsWith('cup') ? 'cup' : /^(tbsp|table)/.test(rawUnit) ? 'tbsp' : 'tsp'
      const ref =
        activeConcept?.[household] ??
        (new RegExp(`\\b${household}\\b`).test(food.serving)
          ? food.servingG / (Number(food.serving.match(/^[\d.]+/)?.[0]) || 1)
          : undefined)
      if (ref) {
        portion = amount * ref
        unit = 'g'
        locked = 'mass'
        notes.push(`Household portion: ${amount} ${rawUnit} ≈ ${Math.round(portion * 10) / 10} g.`)
      } else if (amount === 0) {
        assumeDefaultServings(`No reliable ${household} weight for this food.`, 0)
      } else {
        // Do NOT treat tbsp count as N × cup-sized default servings.
        assumeDefaultServings(`No reliable ${household} weight for this food.`, 1)
      }
    } else if (/^slice/.test(rawUnit)) {
      if (/\bslice\b/i.test(food.serving)) {
        unit = 'serving'
        portion = amount
        locked = 'count'
      } else {
        assumeDefaultServings('Slice weight varies for this food.', amount === 0 ? 0 : 1)
      }
    } else if (/^bowl/.test(rawUnit)) {
      const cupRef =
        activeConcept?.cup ??
        (/\bcup\b/i.test(food.serving) ? food.servingG / (Number(food.serving.match(/^[\d.]+/)?.[0]) || 1) : undefined)
      if (cupRef) {
        portion = amount * cupRef
        unit = 'g'
        portionAssumed = true
        pickNeedsConfirm = true
        locked = 'mass'
        notes.push(`Bowl size varies; counted as ~${amount} cup${amount === 1 ? '' : 's'} (≈ ${Math.round(portion * 10) / 10} g). Confirm edible weight.`)
      } else {
        assumeDefaultServings('Bowl size varies for this food.', amount === 0 ? 0 : 1)
      }
    } else if (/^serving/.test(rawUnit)) {
      unit = 'serving'
      portion = amount
      locked = 'serving'
    } else if (!rawUnit) {
      // Bare count: only multiply reviewed piece weight — never treat cup rows as “N nuts”.
      const piece = pieceWeightG(food, activeConcept)
      if (piece != null && (q || activeConcept?.count != null || /^1 (medium|large|small|egg)\b/i.test(food.serving))) {
        portion = amount * piece
        unit = 'g'
        locked = 'count'
        if (activeConcept?.count != null && q) {
          notes.push(`Counted as ${amount} × ~${piece} g piece.`)
        }
      } else if (
        servingIsCupSized(food) &&
        !activeConcept?.count &&
        q &&
        amount !== 1 &&
        !activeConcept?.cup
      ) {
        // Numbered count against a cup-only USDA row with no concept cup/piece → do not do N×cup.
        assumeDefaultServings('A bare count does not specify this food’s piece weight.', amount === 0 ? 0 : 1)
      } else if (
        /^1 (medium|large|slice|egg|cup|tbsp|tsp|oz)\b/i.test(food.serving) ||
        Boolean(activeConcept?.cup || activeConcept?.tbsp || activeConcept?.tsp)
      ) {
        // Everyday cup/piece defaults (milk, chicken, hummus): N × serving is intentional.
        unit = 'serving'
        portion = amount
        locked = 'count'
      } else if (q) {
        assumeDefaultServings('A bare count does not specify this food’s portion.', amount === 0 ? 0 : 1)
      }
    }

    // Size adjectives only choose a size row / default — never override locked mass.
    if (
      locked !== 'mass' &&
      !portionAssumed &&
      /\b(small|large)\b/.test(normalized) &&
      !new RegExp(`\\b${normalized.includes('small') ? 'small' : 'large'}\\b`).test(food.serving)
    ) {
      assumeDefaultServings('This size has no reviewed weight.', amount === 0 ? 0 : unit === 'serving' ? portion : 1)
    }

    // Zero is zero — no Math.max floor.
    if (amount === 0) {
      portion = 0
    }

    const defaultServingCountable =
      /^1 (medium|large|slice|egg|cup|tbsp|tsp|oz)\b/i.test(food.serving) ||
      Boolean(activeConcept?.count || activeConcept?.cup || activeConcept?.tbsp || activeConcept?.tsp) ||
      locked === 'count' ||
      locked === 'mass'

    const assumed = portionAssumed || !q || (unit === 'serving' && !defaultServingCountable)
    const needsConfirm = assumed || pickNeedsConfirm
    const tag: MatchDisplayTag = pickNeedsConfirm ? 'needs_confirm' : assumed ? 'assumed' : 'database'
    if (assumed && !portionAssumed && amount !== 0) {
      notes.push(`Reference portion assumed: ${Math.round(food.servingG * (unit === 'serving' ? portion : 1) * 10) / 10} g. Check the edible weight.`)
    } else if (q && !rawUnit && /\bcup\b/i.test(food.serving) && !portionAssumed && locked === 'count') {
      notes.push(`Counted as ${amount} × default cup serving (${food.servingG} g).`)
    }
    resolved.push({
      food,
      original,
      amount: portion,
      unit,
      assumed,
      needsConfirm,
      tag,
      notes,
      candidates: altCandidates.length > 1 ? altCandidates : undefined,
    })
  })
  return { resolved, issues }
}
