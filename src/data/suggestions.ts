/** Habit-first close-the-gap add-ons (USDA / curated reference portions). */
export type SuggestionItem = {
  id: string
  name: string
  serving: string
  fiberG: number
  /** Phrase appended to the meal log when user taps “Add”. */
  addPhrase: string
  /** Prefer lighter / snack-like picks for small gaps. */
  kind?: 'light' | 'legume' | 'produce' | 'grain'
}

export const SUGGESTION_POOL: SuggestionItem[] = [
  {
    id: 'curated:raspberries',
    name: 'Raspberries',
    serving: '1 cup',
    fiberG: 8,
    addPhrase: '1 cup raspberries',
    kind: 'produce',
  },
  {
    id: 'curated:raspberries-half',
    name: 'Raspberries',
    serving: '½ cup',
    fiberG: 4,
    addPhrase: '1/2 cup raspberries',
    kind: 'produce',
  },
  {
    id: 'curated:avocado-half',
    name: 'Avocado',
    serving: '½ medium',
    fiberG: 5,
    addPhrase: '1/2 avocado',
    kind: 'produce',
  },
  {
    id: 'curated:avocado',
    name: 'Avocado',
    serving: '1 medium (150g)',
    fiberG: 10.1,
    addPhrase: 'an avocado',
    kind: 'produce',
  },
  {
    id: 'curated:pear',
    name: 'Pear',
    serving: '1 medium',
    fiberG: 5.5,
    addPhrase: 'a pear',
    kind: 'produce',
  },
  {
    id: 'curated:apple',
    name: 'Apple',
    serving: '1 medium (182g)',
    fiberG: 4.4,
    addPhrase: 'an apple',
    kind: 'produce',
  },
  {
    id: '170554-tbsp',
    name: 'Chia seeds',
    serving: '1 tbsp',
    fiberG: 4.1,
    addPhrase: '1 tbsp chia seeds',
    kind: 'light',
  },
  {
    id: '170554',
    name: 'Chia seeds',
    serving: '1 oz (≈2 tbsp)',
    fiberG: 9.8,
    addPhrase: 'chia seeds',
    kind: 'light',
  },
  {
    id: 'curated:psyllium',
    name: 'Psyllium husk',
    serving: '1 tbsp (9g)',
    fiberG: 7,
    addPhrase: 'psyllium husk',
    kind: 'light',
  },
  {
    id: '175254-half',
    name: 'Lentils (cooked)',
    serving: '½ cup with dinner',
    fiberG: 7.8,
    addPhrase: '1/2 cup cooked lentils',
    kind: 'legume',
  },
  {
    id: '173735-half',
    name: 'Black beans (cooked)',
    serving: '½ cup on the side',
    fiberG: 7.5,
    addPhrase: '1/2 cup black beans',
    kind: 'legume',
  },
  {
    id: '168411',
    name: 'Edamame',
    serving: '1 cup prepared',
    fiberG: 8.1,
    addPhrase: 'edamame',
    kind: 'legume',
  },
  {
    id: 'curated:ww-toast',
    name: 'Whole-wheat toast',
    serving: '1 slice',
    fiberG: 1.9,
    addPhrase: '1 slice whole-wheat toast',
    kind: 'grain',
  },
  {
    id: 'curated:oatmeal',
    name: 'Oatmeal (cooked)',
    serving: '1 cup cooked',
    fiberG: 4,
    addPhrase: 'oatmeal',
    kind: 'grain',
  },
  // Full-cup legumes kept for rare fallback only — never two in one combo.
  {
    id: '175254',
    name: 'Lentils (cooked)',
    serving: '1 cup',
    fiberG: 15.6,
    addPhrase: '1 cup cooked lentils',
    kind: 'legume',
  },
  {
    id: '173735',
    name: 'Black beans (cooked)',
    serving: '1 cup',
    fiberG: 15,
    addPhrase: '1 cup black beans',
    kind: 'legume',
  },
]

/** Base food ids that share “already ate this” (half/full variants). */
const FOOD_FAMILY: Record<string, string> = {
  '170554-tbsp': '170554',
  '170554': '170554',
  '175254-half': '175254',
  '175254': '175254',
  '173735-half': '173735',
  '173735': '173735',
  'curated:avocado-half': 'curated:avocado',
  'curated:avocado': 'curated:avocado',
  'curated:raspberries-half': 'curated:raspberries',
  'curated:raspberries': 'curated:raspberries',
}

export type SuggestionResult = {
  tone: 'reached' | 'almost' | 'gap'
  headline: string
  detail: string
  /** Active combo (same as combos[0] initially). */
  items: SuggestionItem[]
  /** Shuffleable sets that each roughly cover the gap. */
  combos: SuggestionItem[][]
}

function familyId(id: string): string {
  return FOOD_FAMILY[id] ?? id
}

function availablePool(eatenFoodIds: Set<string>): SuggestionItem[] {
  const eatenFamilies = new Set([...eatenFoodIds].map(familyId))
  return SUGGESTION_POOL.filter((s) => !eatenFamilies.has(familyId(s.id)))
}

function byId(pool: SuggestionItem[], id: string): SuggestionItem | undefined {
  return pool.find((s) => s.id === id)
}

function comboFiber(items: SuggestionItem[]): number {
  return items.reduce((sum, i) => sum + i.fiberG, 0)
}

function isFullCupLegume(item: SuggestionItem): boolean {
  return item.kind === 'legume' && /1 cup(?! prepared)/i.test(item.serving) && !item.serving.includes('½')
}

function validCombo(items: SuggestionItem[]): boolean {
  if (items.length === 0) return false
  const fullLegumes = items.filter(isFullCupLegume)
  return fullLegumes.length <= 1
}

/** Build named recipe templates; drop any missing / eaten ingredients. */
function templateCombos(pool: SuggestionItem[]): SuggestionItem[][] {
  const recipes: string[][] = [
    ['curated:raspberries', 'curated:avocado-half', '175254-half'],
    ['curated:pear', 'curated:ww-toast', '173735-half'],
    ['170554-tbsp', 'curated:raspberries-half', '168411'],
    ['curated:apple', 'curated:avocado-half', '175254-half'],
    ['curated:raspberries', '170554-tbsp', '173735-half'],
    ['168411', 'curated:pear'],
    ['curated:avocado', 'curated:ww-toast', 'curated:apple'],
  ]

  const out: SuggestionItem[][] = []
  for (const ids of recipes) {
    const items = ids.map((id) => byId(pool, id)).filter(Boolean) as SuggestionItem[]
    if (items.length < 2 && ids.length >= 2) continue
    if (items.length === 0) continue
    if (!validCombo(items)) continue
    out.push(items)
  }
  return out
}

function lightSingles(pool: SuggestionItem[], gapG: number): SuggestionItem[][] {
  const lights = pool
    .filter((s) => s.kind === 'light' || s.kind === 'produce' || s.kind === 'grain')
    .filter((s) => !isFullCupLegume(s))
    .sort((a, b) => Math.abs(a.fiberG - gapG) - Math.abs(b.fiberG - gapG))
  return lights.slice(0, 4).map((s) => [s])
}

function ensureCoversGap(combos: SuggestionItem[][], gapG: number): SuggestionItem[][] {
  const ranked = [...combos].sort((a, b) => {
    const ca = comboFiber(a)
    const cb = comboFiber(b)
    // Prefer covering the gap without huge overshoot, then closest
    const aOk = ca >= gapG * 0.85 ? 0 : 1
    const bOk = cb >= gapG * 0.85 ? 0 : 1
    if (aOk !== bOk) return aOk - bOk
    return Math.abs(ca - gapG) - Math.abs(cb - gapG)
  })
  // Dedupe by item-id signature
  const seen = new Set<string>()
  const unique: SuggestionItem[][] = []
  for (const c of ranked) {
    const key = c.map((i) => i.id).sort().join('|')
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(c)
  }
  return unique.slice(0, 5)
}

export function buildSuggestions(
  gapG: number,
  eatenFoodIds: Set<string>,
  estimatedCount: number,
): SuggestionResult {
  const pool = availablePool(eatenFoodIds)
  const estNote = estimatedCount > 0 ? ' Your log includes estimated items.' : ''

  if (gapG <= 0) {
    return {
      tone: 'reached',
      headline: 'Your fiber intake is on target for today',
      detail:
        'Nice work hitting your daily target. Keep mixing fiber sources and drink enough water.' +
        estNote,
      items: [],
      combos: [],
    }
  }

  if (gapG <= 5) {
    const combos = ensureCoversGap(lightSingles(pool, gapG), gapG)
    const items = combos[0] ?? []
    return {
      tone: 'almost',
      headline: `Almost there — about ${gapG}g to go`,
      detail: estNote.trim(),
      items,
      combos: combos.length > 0 ? combos : items.length ? [items] : [],
    }
  }

  let combos = ensureCoversGap(templateCombos(pool), gapG)
  if (combos.length === 0) {
    // Fallback: mix light + one half legume, never two full cups
    const halfLegume = pool.find((s) => s.id.endsWith('-half') && s.kind === 'legume')
    const produce = pool.filter((s) => s.kind === 'produce').slice(0, 2)
    const fallback = [...produce, ...(halfLegume ? [halfLegume] : [])].slice(0, 3)
    if (fallback.length) combos = [fallback]
  }

  const items = combos[0] ?? []
  const gapLabel = Math.round(gapG * 10) / 10
  return {
    tone: 'gap',
    headline: `Easy ways to close today’s gap (~${gapLabel}g short)`,
    detail: estNote.trim(),
    items,
    combos: combos.length > 0 ? combos : items.length ? [items] : [],
  }
}
