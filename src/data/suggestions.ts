/** High-fiber add-ons with typical servings (USDA FoodData Central / curated). */
export type SuggestionItem = {
  id: string
  name: string
  serving: string
  fiberG: number
  /** Phrase appended to the meal log when user taps “Add”. */
  addPhrase: string
}

export const SUGGESTION_POOL: SuggestionItem[] = [
  {
    id: '170554',
    name: 'Chia seeds',
    serving: '1 oz (≈2 tbsp)',
    fiberG: 9.8,
    addPhrase: 'chia seeds',
  },
  {
    id: 'curated:psyllium',
    name: 'Psyllium husk',
    serving: '1 tbsp (9g)',
    fiberG: 7,
    addPhrase: 'psyllium husk',
  },
  {
    id: '175254',
    name: 'Lentils (cooked)',
    serving: '1 cup',
    fiberG: 15.6,
    addPhrase: '1 cup cooked lentils',
  },
  {
    id: '173735',
    name: 'Black beans (cooked)',
    serving: '1 cup',
    fiberG: 15,
    addPhrase: '1 cup black beans',
  },
  {
    id: 'curated:avocado',
    name: 'Avocado',
    serving: '1 medium (150g)',
    fiberG: 10.1,
    addPhrase: 'an avocado',
  },
  {
    id: '168411',
    name: 'Edamame',
    serving: '1 cup prepared',
    fiberG: 8.1,
    addPhrase: 'edamame',
  },
  {
    id: 'curated:oatmeal',
    name: 'Oatmeal (cooked)',
    serving: '1 cup cooked',
    fiberG: 4,
    addPhrase: 'oatmeal',
  },
  {
    id: 'curated:apple',
    name: 'Apple',
    serving: '1 medium (182g)',
    fiberG: 4.4,
    addPhrase: 'an apple',
  },
]

export type SuggestionResult = {
  tone: 'reached' | 'almost' | 'gap'
  headline: string
  detail: string
  items: SuggestionItem[]
}

export function buildSuggestions(
  gapG: number,
  eatenFoodIds: Set<string>,
  estimatedCount: number,
): SuggestionResult {
  const pool = SUGGESTION_POOL.filter((s) => !eatenFoodIds.has(s.id)).sort(
    (a, b) => b.fiberG - a.fiberG,
  )

  const estNote =
    estimatedCount > 0
      ? ' Suggestions use typical servings; your log includes estimated items.'
      : ''

  if (gapG <= 0) {
    return {
      tone: 'reached',
      headline: 'Your fiber intake is on target for today',
      detail:
        'Nice work hitting your daily target. Keep mixing fiber sources and drink enough water.' +
        estNote,
      items: [],
    }
  }

  if (gapG <= 5) {
    const items = pickForGap(pool, gapG, 2)
    return {
      tone: 'almost',
      headline: `Almost there — about ${gapG}g to go`,
      detail: 'A small add-on may be enough to close today’s gap.' + estNote,
      items,
    }
  }

  const items = pickForGap(pool, gapG, 2)
  return {
    tone: 'gap',
    headline: `You can add more fiber (~${gapG}g short)`,
    detail:
      'These are common high-fiber foods with typical USDA-style servings — not medical advice.' +
      estNote,
    items,
  }
}

function pickForGap(pool: SuggestionItem[], gapG: number, limit: number): SuggestionItem[] {
  if (pool.length === 0) return []
  // Prefer items that can close a meaningful share of the gap without huge overshoot when gap is small
  const scored = [...pool].sort((a, b) => {
    const da = Math.abs(a.fiberG - gapG)
    const db = Math.abs(b.fiberG - gapG)
    if (da !== db) return da - db
    return b.fiberG - a.fiberG
  })
  return scored.slice(0, limit)
}
