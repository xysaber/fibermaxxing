import usda from './usda-foods.json'

export type FoodItem = {
  id: string
  name: string
  aliases: string[]
  fiberG: number
  serving: string
  calories: number
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

function toFoodItem(row: UsdaFood): FoodItem {
  const g = row.serving?.g > 0 ? row.serving.g : 100
  const fiberG = Math.round(((row.fiber100g * g) / 100) * 10) / 10
  const calories = Math.round((row.kcal100g * g) / 100)
  return {
    id: String(row.id),
    name: row.name,
    aliases: row.aliases,
    fiberG,
    serving: row.serving?.label || `${g}g`,
    calories,
    glpScore: glpFromFiberDensity(row.fiber100g),
  }
}

/** English L1 index: USDA SR Legacy (slim) + curated fiber staples. */
export const FOODS: FoodItem[] = (usda.foods as UsdaFood[]).map(toFoodItem)

export const FOOD_COUNT = FOODS.length

export const FOOD_SOURCE = usda.source as string
