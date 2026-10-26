/**
 * Layer: “is this something you can eat/drink?”
 * Used when Concept/USDA + estimateFiber keywords miss — so latte/granola
 * are never treated the same as gibberish (not_food).
 *
 * - category set → low-confidence fiber estimate
 * - category null → recognized consumable, no fiber line (consumable_untracked)
 */
import type { FiberCategory } from './estimateFiber'

export type ConsumableRecognition =
  | { status: 'estimable'; category: FiberCategory }
  | { status: 'known_untracked' }

/** Longer phrases first when matching. */
const CONSUMABLE_ENTRIES: { phrase: string; category: FiberCategory | null }[] = [
  // drinks
  { phrase: 'protein shake', category: 'mixed_dish' },
  { phrase: 'olive oil', category: 'protein_zero' },
  { phrase: 'energy bar', category: 'mixed_dish' },
  { phrase: 'protein bar', category: 'mixed_dish' },
  { phrase: 'granola bar', category: 'whole_grain' },
  { phrase: 'french fries', category: 'starchy' },
  { phrase: 'mashed potatoes', category: 'starchy' },
  { phrase: 'orange juice', category: 'fruit' },
  { phrase: 'apple juice', category: 'fruit' },
  { phrase: 'soy sauce', category: 'beverage_zero' },
  { phrase: 'hot sauce', category: 'beverage_zero' },
  { phrase: 'sour cream', category: 'dairy_zero' },
  { phrase: 'cream cheese', category: 'dairy_zero' },
  { phrase: 'ice cream', category: 'dairy_zero' },
  { phrase: 'coconut oil', category: 'protein_zero' },
  { phrase: 'vegetable oil', category: 'protein_zero' },
  { phrase: 'canola oil', category: 'protein_zero' },
  { phrase: 'latte', category: 'beverage_zero' },
  { phrase: 'cappuccino', category: 'beverage_zero' },
  { phrase: 'mocha', category: 'beverage_zero' },
  { phrase: 'matcha', category: 'beverage_zero' },
  { phrase: 'kombucha', category: 'beverage_zero' },
  { phrase: 'smoothie', category: 'mixed_dish' },
  { phrase: 'granola', category: 'whole_grain' },
  { phrase: 'muesli', category: 'whole_grain' },
  { phrase: 'ketchup', category: 'vegetable' },
  { phrase: 'mayonnaise', category: 'protein_zero' },
  { phrase: 'mayo', category: 'protein_zero' },
  { phrase: 'mustard', category: 'beverage_zero' },
  { phrase: 'relish', category: 'vegetable' },
  { phrase: 'vinegar', category: 'beverage_zero' },
  { phrase: 'flour', category: 'refined_grain' },
  { phrase: 'fries', category: 'starchy' },
  { phrase: 'chips', category: 'starchy' },
  { phrase: 'crisps', category: 'starchy' },
  { phrase: 'tuna', category: 'protein_zero' },
  { phrase: 'sardines', category: 'protein_zero' },
  { phrase: 'anchovy', category: 'protein_zero' },
  { phrase: 'anchovies', category: 'protein_zero' },
  { phrase: 'cod', category: 'protein_zero' },
  { phrase: 'tilapia', category: 'protein_zero' },
  { phrase: 'honey', category: 'protein_zero' },
  { phrase: 'peanut butter and jelly sandwich', category: 'mixed_dish' },
  { phrase: 'pb&j sandwich', category: 'mixed_dish' },
  { phrase: 'chicken salad', category: 'mixed_dish' },
  { phrase: 'jam', category: 'fruit' },
  { phrase: 'jelly', category: 'fruit' },
  { phrase: 'syrup', category: 'protein_zero' },
  { phrase: 'salt', category: null },
  { phrase: 'pepper', category: null },
  { phrase: 'spice', category: null },
  { phrase: 'spices', category: null },
]

const SORTED = [...CONSUMABLE_ENTRIES].sort((a, b) => b.phrase.length - a.phrase.length)

function normalizeConsumablePhrase(value: string): string {
  return value
    .toLowerCase()
    .replace(/milktea|milk-tea/g, 'milk tea')
    .replace(/[’']/g, '')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Returns whether the phrase is a known consumable, and whether we can
 * still attach a category estimate.
 */
export function recognizeConsumable(phrase: string): ConsumableRecognition | null {
  const text = normalizeConsumablePhrase(phrase)
  if (!text || text.length < 2) return null

  for (const { phrase: key, category } of SORTED) {
    const idx = text.indexOf(key)
    if (idx === -1) continue
    const before = text[idx - 1]
    const after = text[idx + key.length]
    const boundary =
      (idx === 0 || !/[a-z0-9]/.test(before ?? '')) &&
      (idx + key.length >= text.length || !/[a-z0-9]/.test(after ?? ''))
    if (!boundary && text !== key) continue
    if (category) return { status: 'estimable', category }
    return { status: 'known_untracked' }
  }
  return null
}

export function isRecognizedConsumable(phrase: string): boolean {
  return recognizeConsumable(phrase) != null
}
