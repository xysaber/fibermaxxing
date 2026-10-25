import { FOODS, type FoodItem } from '../data/foods'

export type PortionUnit = 'serving' | 'g' | 'oz' | 'tbsp' | 'tsp' | 'cup'
export type MatchDisplayTag = 'database' | 'assumed' | 'needs_confirm' | 'estimated'

export type FoodIssue = {
  id: string
  text: string
  reason: string
  candidates: FoodItem[]
  /** Recipe / ambiguous / spelling — UI may treat as needs_confirm */
  kind?: 'recipe' | 'ambiguous' | 'spelling' | 'portion' | 'negation'
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
  { names: ['almond'], id: '170567' },
  { names: ['flaxseed', 'flax seed', 'ground flaxseed'], id: '169414', tbsp: 10, tsp: 3.3 },
  { names: ['spinach', 'raw spinach'], id: '168462', cup: 30 },
  { names: ['carrot', 'raw carrot'], id: '170393', count: 61, cup: 110 },
  { names: ['peanut butter', 'smooth peanut butter'], id: '172470', tbsp: 16, tsp: 5.3, cup: 258 },
  { names: ['almond butter'], id: '168588', tbsp: 16, tsp: 5.3, cup: 250 },
  { names: ['banana', 'raw banana'], id: '173944', count: 118, cup: 150 },
  { names: ['chia', 'chia seed'], id: '170554', tbsp: 10, tsp: 3 },
  { names: ['lentil', 'cooked lentil'], id: '172421', cup: 198 },
  { names: ['whole wheat bread', 'whole wheat toast'], id: '172689' },
  { names: ['blueberry'], id: '171711', cup: 148 },
  { names: ['raspberry'], id: '167755', cup: 123 },
  { names: ['strawberry'], id: '167762', cup: 144 },
  { names: ['brown rice', 'cooked brown rice'], id: '169704', cup: 202 },
  { names: ['broccoli', 'cooked broccoli'], id: '169967', cup: 78 },
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
const IDENTITY_PREPARATION = /\b(?:hard boiled|soft boiled|grilled|roasted|baked|boiled|steamed|poached|cooked|raw)\b/g
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
  if (/\braw\b/.test(name) && !/\braw\b/.test(text) && (/\bcooked\b/.test(text) || HEAT_METHOD.test(text) || /\bfried\b/.test(text))) {
    return false
  }
  if ((/\bcooked\b/.test(text) || HEAT_METHOD.test(text)) && /\b(raw|uncooked|dry)\b/.test(name)) return false
  // Heat methods are a family: grilled may use roasted/generic cooked; never fried.
  if (HEAT_METHOD.test(text)) {
    if (/\bfried\b|\bbreaded\b|\bmeatless\b/.test(name)) return false
    if (genericCooked(food) || HEAT_METHOD.test(name)) {
      /* ok — curated cooked/roasted default for grilled etc. */
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
  /\b(chocolate|buttermilk|canned|evaporated|condensed|dried|dehydrated|dry|frozen|sweetened|flavored|imitation|filled|malted|goat|sheep|buffalo|human|low sodium|calcium fortified|meatless|breaded|fried|smoked|salted|pickled|fermented|powder|instant|eggnog|shake|dessert|pudding|soup|gravy|sauce|substitute|nondairy|sticks?|cured|pastrami|bologna|glutinous|wild|hash brown|scalloped|mashed|ready to eat|restaurant|fast food|uncle bens|parboiled|separable fat|breakfast strips|nuggets?|patty|patties|crumb|stuffing|flour|bran|germ|peel)\b/
/** Preparation / grade words allowed on a default everyday row. */
const PREP_OK = new Set([
  'raw', 'cooked', 'boiled', 'baked', 'fluid', 'plain', 'fresh', 'mature', 'seed', 'seeds',
  'whole', 'white', 'brown', 'enriched', 'unenriched', 'regular', 'commercial', 'varieties',
  'all', 'flesh', 'skin', 'and', 'or', 'with', 'without', 'salt', 'added', 'vitamin', 'vitamins',
  'a', 'd', 'includes', 'foods', 'for', 'usda', 'food', 'distribution', 'program', 'the', 'of',
  'from', 'home', 'prepared', 'long', 'grain', 'medium', 'short', 'grain', 'milkfat', 'fat',
  'content', 'unspecified', 'ground', 'retail', 'cuts', 'edible', 'portion',
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

      if (SPECIALTY_FORM.test(name)) score -= 45

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
  const second = ranked[1]
  const clear = !second || best.score - second.score >= SCORE_GAP
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
const NUMBER = '(?:\\d+\\s+\\d+\\/\\d+|\\d+\\/\\d+|\\d+(?:\\.\\d+)?|half an?\\b|half\\b|one\\b|two\\b|three\\b|four\\b|five\\b|an?\\b)'
const QUANTITY = new RegExp(`^(${NUMBER})\\s*(?:(kg|grams?|g|ounces?|oz|tablespoons?|tbsp|teaspoons?|tsp|cups?|slices?|bowls?|servings?|ml|liters?|l)(?![a-z]))?(?=\\s|$|[a-z])\\s*(?:of\\s+)?`, 'i')
const WORD_NUMBERS: Record<string, number> = { half: .5, one: 1, two: 2, three: 3, four: 4, five: 5, a: 1, an: 1, 'half a': .5, 'half an': .5 }

/** Local food mentions: separators survive until quantity and negation binding. */
export function resolveMeal(input: string): { resolved: ResolvedFood[]; issues: FoodIssue[] } {
  const resolved: ResolvedFood[] = []
  const issues: FoodIssue[] = []
  const text = input.toLowerCase().replace(/½/g, '1/2').replace(/¼/g, '1/4').replace(/¾/g, '3/4')
    .replace(/\b(?:i (?:ate|had|eat|drank|drink|had drunk)|for (?:breakfast|lunch|dinner)|breakfast:|lunch:|dinner:)\s*/g, '')
  const clauses = text.split(/[,;\n，；、]|\b(?:and|with|plus|topped with|alongside|without|no|hold the|minus)\b/g)
  const delimiters = [...text.matchAll(/[,;\n，；、]|\b(?:and|with|plus|topped with|alongside|without|no|hold the|minus)\b/g)]
  let negated = false
  clauses.forEach((raw, i) => {
    if (i > 0) {
      const separator = delimiters[i - 1]?.[0] ?? ''
      if (/without|^no$|hold the|minus/.test(separator)) negated = true
      else if (!/^and$/.test(separator)) negated = false
    }
    const original = raw.trim()
    if (!original) return
    if (negated) {
      if (i > 0 && delimiters[i - 1]?.[0] === 'and') {
        issues.push({ id: `mention-${i}`, text: original, reason: 'The scope of “without/no” is unclear. Confirm whether this item was eaten.', candidates: [], kind: 'negation' })
      }
      return
    }
    const issue = (reason: string, candidates: FoodItem[] = [], kind: FoodIssue['kind'] = 'ambiguous') =>
      issues.push({ id: `mention-${i}`, text: original, reason, candidates: candidates.slice(0, 6), kind })
    let phrase = original.replace(/^[.\s]+|[.\s]+$/g, '')
    let q = phrase.match(QUANTITY)
    // Postfix weights are accepted without borrowing numbers from other mentions.
    if (!q) {
      const suffix = phrase.match(/\s+(\d+(?:\.\d+)?\s*(?:g|grams?|oz|kg))$/)
      if (suffix) { phrase = `${suffix[1]} ${phrase.slice(0, suffix.index)}`; q = phrase.match(QUANTITY) }
    }
    const amount = q ? WORD_NUMBERS[q[1]!] ?? number(q[1]!) : 1
    const rawUnit = q?.[2]?.toLowerCase() ?? ''
    if (q) phrase = phrase.slice(q[0].length).trim()
    if (!Number.isFinite(amount) || amount < 0 || amount > 10000) { issue('Enter a valid portion; this amount was not counted.', [], 'portion'); return }
    const normalized = normalizeFoodPhrase(phrase)
    if (!normalized || /^(plain|nonfat|medium|small|large|grilled|raw|cooked)( (plain|nonfat|medium|small|large))*$/.test(normalized)) {
      if (normalized) issue('Name the food, not only its size or preparation.', [], 'ambiguous')
      return
    }
    if (RECIPE.test(normalized)) {
      issue('Recipe and portion vary. Confirm volume/ingredients, or enter items separately.', [], 'recipe')
      return
    }
    // A controlled concept must explain the whole food phrase. No substring wins.
    const stripped = normalized.replace(/\b(?:medium|fresh|ripe|a|an|of|bowl|slice)\b/g, '').replace(/\s+/g, ' ').trim()
    const tokens = (value: string) => value.split(' ').sort().join(' ')
    const identity = stripped.replace(IDENTITY_PREPARATION, '').replace(/\s+/g, ' ').trim()
    const exactConcept = concepts.find(c => c.names.some(name => tokens(name) === tokens(normalized) || tokens(name) === tokens(stripped)))
    const concept = exactConcept ?? concepts.find(c => c.names.some(name => tokens(name) === tokens(identity)) && compatible(normalized, c.food, { curated: true }))
    let corrected = false
    // Unique one-character spelling suggestions are proposed, never auto-counted.
    if (!concept && stripped.length >= 5 && !stripped.includes(' ')) {
      const edits = (a: string, b: string) => {
        if (Math.abs(a.length - b.length) > 1) return false
        for (let j = 0; j < Math.max(a.length, b.length); j++) {
          if (a[j] === b[j]) continue
          return a.slice(j + (a.length >= b.length ? 1 : 0)) === b.slice(j + (b.length >= a.length ? 1 : 0))
        }
        return true
      }
      const suggestions = concepts.filter(c => c.names.some(n => edits(stripped, n)))
      if (suggestions.length) { issue('Possible spelling match. Confirm the food and weight before adding.', suggestions.map(c => c.food), 'spelling'); return }
    }
    let food: FoodItem | undefined = concept?.food
    let pickNeedsConfirm = false
    let altCandidates: FoodItem[] = []
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
      const headBare = stripped.replace(/\b(?:grilled|roasted|fried|breaded|raw|cooked|dried|meatless|vegan|small|large)\b/g, '').replace(/\s+/g, ' ').trim()
      const pool = headIndex
        .filter(c => c.head === normalized || c.head === stripped || c.head === headBare || normalizeFoodPhrase(c.food.name) === normalized)
        .filter(c => compatible(normalized, c.food))
        .map(c => c.food)
      // Dedupe by id while preserving order.
      const seen = new Set<string>()
      const candidates = pool.filter(f => (seen.has(f.id) ? false : (seen.add(f.id), true)))
      const picked = pickNutrientCandidate(normalized, candidates)
      if (!picked) {
        issue('No reliable match. Search for the exact food, or rewrite this item.', [], 'ambiguous')
        return
      }
      food = picked.food
      pickNeedsConfirm = picked.needsConfirm
      altCandidates = picked.candidates
    } else {
      // Defaults are explicitly curated; explicit modifiers must still agree.
      if (!compatible(normalized, food, { curated: true })) { issue('This preparation does not match the reference food. Choose the exact form.', [food], 'ambiguous'); return }
    }
    const notes: string[] = []
    if (FORMS[phrase] || normalized !== phrase.replace(/-/g, ' ')) corrected = true
    if (corrected) notes.push(`Normalized from “${original}”.`)
    if (pickNeedsConfirm) {
      notes.push('Several forms match this name; using the closest everyday reference. Confirm the product if needed.')
    }
    let unit: PortionUnit = 'serving'
    let portion = amount
    if (/^(g|gram|kg)/.test(rawUnit)) { unit = 'g'; if (rawUnit === 'kg') portion *= 1000 }
    else if (/^(oz|ounce)/.test(rawUnit)) unit = 'oz'
    else if (/^(ml|l|liter)/.test(rawUnit)) { issue('Volume needs a product-specific weight. Enter grams or choose the exact product.', [food], 'portion'); return }
    else if (/^(cup|tbsp|tablespoon|tsp|teaspoon)/.test(rawUnit)) {
      const household = rawUnit.startsWith('cup') ? 'cup' : /^(tbsp|table)/.test(rawUnit) ? 'tbsp' : 'tsp'
      const ref = concept?.[household] ?? (new RegExp(`\\b${household}\\b`).test(food.serving) ? food.servingG / (Number(food.serving.match(/^[\d.]+/)?.[0]) || 1) : undefined)
      if (!ref) { issue('No reliable weight for that household unit. Confirm grams.', [food], 'portion'); return }
      portion *= ref; unit = 'g'
      notes.push(`Household portion: ${amount} ${rawUnit} ≈ ${Math.round(portion * 10) / 10} g.`)
    }
    if (/^slice/.test(rawUnit) && !/\bslice\b/.test(food.serving)) {
      issue('Slice weights vary for this food. Confirm grams.', [food], 'portion'); return
    }
    if (/^bowl/.test(rawUnit)) {
      issue('Bowl sizes vary. Confirm the edible weight in grams.', [food], 'portion'); return
    }
    // “1 milk” / “2 eggs” / “1 bread” → N × default serving when that serving is a
    // known household/piece unit (cup, slice, egg, …) or the concept defines one.
    const defaultServingCountable =
      /^1 (medium|large|slice|egg|cup|tbsp|tsp|oz)\b/i.test(food.serving) ||
      Boolean(concept?.count || concept?.cup || concept?.tbsp || concept?.tsp)
    if (q && !rawUnit && !defaultServingCountable && !/\bmedium\b/.test(food.serving)) {
      issue('A count does not specify this food’s portion. Confirm grams.', [food], 'portion'); return
    }
    if (/\b(small|large)\b/.test(normalized) && !new RegExp(`\\b${normalized.includes('small') ? 'small' : 'large'}\\b`).test(food.serving)) {
      issue('This size has no reviewed weight. Confirm grams.', [food], 'portion'); return
    }
    // Assumed when no qty, or default serving with no reviewed piece/household weight.
    const assumed = !q || (unit === 'serving' && !defaultServingCountable)
    const needsConfirm = assumed || pickNeedsConfirm
    const tag: MatchDisplayTag = pickNeedsConfirm ? 'needs_confirm' : assumed ? 'assumed' : 'database'
    if (assumed) notes.push(`Reference portion assumed: ${Math.round(food.servingG * (unit === 'serving' ? amount : 1) * 10) / 10} g. Check the edible weight.`)
    else if (q && !rawUnit && /\bcup\b/i.test(food.serving)) {
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
