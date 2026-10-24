import usda from './usda-foods.json'

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
    aliases: cleanAliases(row.aliases),
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
  blueberries: /^Blueberries, raw$/i,
  blueberry: /^Blueberries, raw$/i,
  raspberries: /^Raspberries, raw$/i,
  strawberries: /^Strawberries, raw$/i,
}

function applyPreferredAliases(foods: FoodItem[]): FoodItem[] {
  const byName = foods
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
export const FOODS: FoodItem[] = applyPreferredAliases(
  (usda.foods as UsdaFood[]).map(toFoodItem).filter((f) => f.aliases.length > 0),
)

export const FOOD_COUNT = FOODS.length

export const FOOD_SOURCE = usda.source as string
