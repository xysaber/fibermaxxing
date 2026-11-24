import usda from './usda-foods.json'
import { CURATED_EXTRA, SERVING_FIXES } from './curatedFoods'

export type FoodItem = {
  id: string
  name: string
  aliases: string[]
  /** Fiber grams for the default serving */
  fiberG: number
  serving: string
  /** Default serving weight in grams */
  servingG: number
  /** Fiber per 100g (for weight-based estimates) */
  fiber100g: number
  calories: number
  calories100g: number
  /** Rough GLP-1 / satiety proxy 1–10 based on soluble fiber density */
  glpScore: number
}

type UsdaFood = {
  id: string
  name: string
  aliases: string[]
  fiber100g: number
  kcal100g: number
  serving: { label: string; g: number }
}

/** Standalone tokens that must never match a food by themselves. */
export const BLOCKED_ALIASES = new Set([
  'raw',
  'cooked',
  'boiled',
  'dried',
  'frozen',
  'canned',
  'salt',
  'unsalted',
  'sweetened',
  'unsweetened',
  'dehydrated',
  'sulfured',
  'mature',
  'seeds',
  'seed',
  'with skin',
  'without skin',
  'with salt',
  'without salt',
  'drained',
  'heated',
  'unheated',
  'microwave',
  'prepared',
  'recipe',
  'nlea',
  'flesh',
  'skin',
  'hearts',
])

function glpFromFiberDensity(fiber100g: number): number {
  if (fiber100g >= 25) return 10
  if (fiber100g >= 15) return 9
  if (fiber100g >= 10) return 8
  if (fiber100g >= 7) return 7
  if (fiber100g >= 5) return 6
  if (fiber100g >= 3) return 5
  if (fiber100g >= 2) return 4
  if (fiber100g >= 1) return 3
  if (fiber100g > 0) return 2
  return 1
}

function cleanAliases(aliases: string[]): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  for (const raw of aliases) {
    const a = raw.toLowerCase().replace(/\s+/g, ' ').trim()
    if (a.length < 3 || a.length > 48) continue
    if (BLOCKED_ALIASES.has(a)) continue
    // Block single generic adjectives even if longer phrasing slipped through
    if (/^(raw|cooked|boiled|dried|frozen|canned)\b/.test(a) && a.split(' ').length === 1) continue
    if (seen.has(a)) continue
    seen.add(a)
    out.push(a)
  }
  return out
}

function toFoodItem(row: UsdaFood): FoodItem {
  const g = row.serving?.g > 0 ? row.serving.g : 100
  const fiberG = Math.round(((row.fiber100g * g) / 100) * 10) / 10
  const calories = Math.round((row.kcal100g * g) / 100)
  return {
    id: String(row.id),
    name: row.name,
    aliases: cleanAliases(row.aliases).filter((alias) => {
      // Generated aliases must name a food, not a detached USDA qualifier.
      if (alias.includes(' ') || String(row.id).startsWith('curated:')) return true
      const head = row.name.split(',')[0]!.toLowerCase().split(/[\s-]+/)
      return head.some((word) => word.replace(/s$/, '') === alias.replace(/s$/, ''))
    }),
    fiberG,
    serving: row.serving?.label || `${g}g`,
    servingG: g,
    fiber100g: row.fiber100g,
    calories,
    calories100g: row.kcal100g,
    glpScore: glpFromFiberDensity(row.fiber100g),
  }
}

/** Prefer everyday fresh/default forms for ambiguous short aliases. */
const PREFER_ALIAS_TO_NAME: Record<string, RegExp> = {
  orange: /^Oranges, raw, all commercial varieties$/i,
  oranges: /^Oranges, raw, all commercial varieties$/i,
  'greek yogurt': /^Yogurt, Greek, plain, nonfat/i,
  'plain nonfat greek yogurt': /^Yogurt, Greek, plain, nonfat/i,
  'nonfat greek yogurt': /^Yogurt, Greek, plain, nonfat/i,
  'plain greek yogurt': /^Yogurt, Greek, plain, nonfat/i,
  'plain lowfat greek yogurt': /^Yogurt, Greek, plain, lowfat$/i,
  'lowfat greek yogurt': /^Yogurt, Greek, plain, lowfat$/i,
  'whole milk greek yogurt': /^Yogurt, Greek, plain, whole milk$/i,
  blueberries: /^Blueberries, raw$/i,
  blueberry: /^Blueberries, raw$/i,
  raspberries: /^Raspberries, raw$/i,
  strawberries: /^Strawberries, raw$/i,
}

function applyPreferredAliases(foods: FoodItem[]): FoodItem[] {
  const byName = foods
  const orange = foods.find((f) => /^Oranges, raw, all commercial varieties$/.test(f.name))
  if (orange) {
    orange.servingG = 131
    orange.serving = '1 medium orange'
    orange.fiberG = Math.round(orange.fiber100g * 1.31 * 10) / 10
    orange.calories = Math.round(orange.calories100g * 1.31)
  }
  for (const [alias, nameRe] of Object.entries(PREFER_ALIAS_TO_NAME)) {
    const preferred = byName.find((f) => nameRe.test(f.name))
    if (!preferred) continue
    for (const f of byName) {
      if (f.id === preferred.id) continue
      f.aliases = f.aliases.filter((a) => a !== alias)
    }
    if (!preferred.aliases.includes(alias)) preferred.aliases.push(alias)
  }
  return byName
}

/** English L1 index: USDA SR Legacy (slim) + curated fiber staples. */
/** Grams per unit used to restore a portion count the old build script dropped. */
const UNIT_G: { re: RegExp; g: number }[] = [
  { re: /^1 (oz)\b/i, g: 28.35 },
  { re: /^1 (tbsp|tablespoons?)\b/i, g: 15 },
  { re: /^1 (tsp|teaspoons?)\b/i, g: 5 },
]

/**
 * SR Legacy portions like "3 oz" (85 g) were stored as "1 oz" with 85 g. Grams are
 * right; restore the count in the label so per-unit math (tbsp/tsp) and the UI agree.
 */
function restoreLabelCount(serving: UsdaFood['serving']): UsdaFood['serving'] {
  for (const { re, g } of UNIT_G) {
    const m = serving.label.match(re)
    if (!m) continue
    const n = serving.g / g
    if (n < 1.5) return serving
    const count = g === 28.35 ? Math.round(n * 10) / 10 : Math.round(n)
    return { ...serving, label: serving.label.replace(/^1 /, `${count} `) }
  }
  return serving
}

function withReviewedServing(row: UsdaFood): UsdaFood {
  const fix = SERVING_FIXES[String(row.id)] ?? restoreLabelCount(row.serving)
  // Metamucil is a dosed product, not a tablespoon of raw psyllium husk.
  const aliases = row.id === 'curated:psyllium' ? row.aliases.filter((a) => a !== 'metamucil') : row.aliases
  return { ...row, aliases, serving: fix }
}

export const FOODS: FoodItem[] = applyPreferredAliases(
  [...(usda.foods as UsdaFood[]).map(withReviewedServing), ...CURATED_EXTRA]
    .map(toFoodItem)
    .filter((f) => f.aliases.length > 0),
)

export const FOOD_COUNT = FOODS.length

export const FOOD_SOURCE = usda.source as string
