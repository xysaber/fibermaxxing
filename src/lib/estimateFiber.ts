/**
 * Global fallback when a food is not in the curated DB.
 * Strategy: classify phrase → fiber category → typical per-serving estimate.
 * Precision DB matches always win; estimates are labeled in the UI.
 */

export type FiberCategory =
  | 'legume'
  | 'seed_supplement'
  | 'nut'
  | 'berry'
  | 'fruit'
  | 'leafy'
  | 'cruciferous'
  | 'vegetable'
  | 'mushroom'
  | 'starchy'
  | 'whole_grain'
  | 'refined_grain'
  | 'noodle'
  | 'mixed_dish'
  | 'protein_zero'
  | 'dairy_zero'
  | 'beverage_zero'
  | 'unknown_plant'

export type FiberEstimate = {
  label: string
  category: FiberCategory
  fiberG: number
  calories: number
  glpScore: number
  serving: string
  confidence: 'medium' | 'low'
}

/** Typical fiber per everyday serving (USDA-ish averages). */
export const CATEGORY_DEFAULTS: Record<
  FiberCategory,
  { fiberG: number; calories: number; glpScore: number; serving: string }
> = {
  legume: { fiberG: 12, calories: 220, glpScore: 8, serving: '~1 cup cooked (est.)' },
  seed_supplement: { fiberG: 8, calories: 100, glpScore: 9, serving: '~2 tbsp (est.)' },
  nut: { fiberG: 3, calories: 160, glpScore: 4, serving: '~1 oz (est.)' },
  berry: { fiberG: 6, calories: 70, glpScore: 6, serving: '~1 cup (est.)' },
  fruit: { fiberG: 3.5, calories: 90, glpScore: 5, serving: '~1 medium (est.)' },
  leafy: { fiberG: 2.5, calories: 25, glpScore: 3, serving: '~2 cups raw (est.)' },
  cruciferous: { fiberG: 4, calories: 50, glpScore: 5, serving: '~1 cup (est.)' },
  vegetable: { fiberG: 3, calories: 45, glpScore: 4, serving: '~1 cup (est.)' },
  mushroom: { fiberG: 2, calories: 30, glpScore: 3, serving: '~1 cup (est.)' },
  starchy: { fiberG: 3, calories: 130, glpScore: 3, serving: '~1 medium / cup (est.)' },
  whole_grain: { fiberG: 4, calories: 170, glpScore: 4, serving: '~1 cup cooked (est.)' },
  refined_grain: { fiberG: 1, calories: 180, glpScore: 1, serving: '~1 cup / 2 slices (est.)' },
  noodle: { fiberG: 2, calories: 210, glpScore: 2, serving: '~1 bowl (est.)' },
  mixed_dish: { fiberG: 5, calories: 450, glpScore: 4, serving: '~1 meal portion (est.)' },
  protein_zero: { fiberG: 0, calories: 180, glpScore: 1, serving: '~1 serving (est.)' },
  dairy_zero: { fiberG: 0, calories: 120, glpScore: 1, serving: '~1 cup (est.)' },
  beverage_zero: { fiberG: 0, calories: 5, glpScore: 1, serving: '~1 cup (est.)' },
  unknown_plant: { fiberG: 2, calories: 60, glpScore: 3, serving: '~1 serving (est.)' },
}

/**
 * Longest-keyword-wins classifier. Keywords are lowercase; CJK kept as-is.
 * Not a full food encyclopedia — a category router for unknown mentions.
 */
const CATEGORY_KEYWORDS: { category: FiberCategory; keywords: string[] }[] = [
  {
    category: 'mixed_dish',
    keywords: [
      'hotpot', 'hot pot', 'hot-pot', '火锅', 'steamboat',
      'stir fry', 'stir-fry', '炒菜', 'curry', '咖喱', 'soup', '汤',
      'salad bowl', 'salad', 'burrito', 'taco', 'pizza', '披萨', 'ramen', '拉面',
      'pho', 'dumpling', '饺子', '包子', 'bibimbap', 'poké', 'poke bowl',
      'bowl', '盖饭', '麻辣烫', '冒菜', '串串',
      // Recipes — must beat dairy/tea single-token matches (e.g. milk tea ≠ dairy cup)
      'milk tea', 'milktea', 'milk-tea', 'bubble tea', 'boba', 'smoothie', 'pudding',
      'sandwich', 'burger', 'wrap', '汉堡', '沙拉', '三明治',
    ],
  },
  {
    category: 'legume',
    keywords: [
      'bean', 'beans', 'lentil', 'lentils', 'pea', 'peas', 'chickpea', 'dal',
      'tofu', 'tempeh', '豆', '豆腐', '豆浆', '芸豆', '豌豆', '绿豆', '红豆', '豆角',
    ],
  },
  {
    category: 'seed_supplement',
    keywords: ['chia', 'flax', 'psyllium', 'hemp seed', '奇亚', '亚麻', '车前子', '菊粉'],
  },
  {
    category: 'nut',
    keywords: ['almond', 'walnut', 'cashew', 'pistachio', 'pecan', 'hazelnut', '花生', '核桃', '腰果', '坚果'],
  },
  {
    category: 'berry',
    keywords: ['berry', 'berries', '莓', '草莓', '蓝莓', '树莓', '黑莓', 'goji', '枸杞'],
  },
  {
    category: 'fruit',
    keywords: [
      'apple', 'pear', 'banana', 'orange', 'grape', 'mango', 'peach', 'plum', 'kiwi', 'pineapple',
      '果', '苹果', '香蕉', '橙子', '葡萄', '芒果', '桃子', '猕猴桃', '西瓜', '柚子', '橘子',
    ],
  },
  {
    category: 'mushroom',
    keywords: [
      'mushroom', 'shiitake', 'oyster mushroom', 'enoki', 'portobello',
      '菇', '香菇', '蘑菇', '金针菇', '平菇', '杏鲍菇', '茶树菇', '木耳', '银耳',
    ],
  },
  {
    category: 'starchy',
    keywords: [
      'potato', 'potatoes', 'yam', 'corn', 'taro', 'cassava',
      '土豆', '马铃薯', '洋芋', '玉米', '芋头', '山药', '红薯', '地瓜',
    ],
  },
  {
    category: 'cruciferous',
    keywords: [
      'broccoli', 'cauliflower', 'cabbage', 'kale', 'brussels',
      '西兰花', '花菜', '菜花', '卷心菜', '包菜', '白菜', '甘蓝', '芥蓝',
    ],
  },
  {
    category: 'leafy',
    keywords: [
      'spinach', 'lettuce', 'arugula', 'greens', 'romaine',
      '菠菜', '生菜', '油麦菜', '生菜叶', '青菜', '生菜', '空心菜', '生菜',
    ],
  },
  {
    category: 'vegetable',
    keywords: [
      'vegetable', 'veggie', 'tomato', 'cucumber', 'pepper', 'onion', 'garlic', 'zucchini', 'eggplant',
      '菜', '蔬菜', '番茄', '西红柿', '黄瓜', '青椒', '洋葱', '茄子', '冬瓜', '南瓜', '丝瓜', '芹菜', '萝卜',
    ],
  },
  {
    category: 'whole_grain',
    keywords: [
      'oatmeal', 'oat', 'quinoa', 'brown rice', 'barley', 'whole wheat', 'wholegrain', 'sorghum',
      '燕麦', '糙米', '藜麦', '全麦', '荞麦', '小米', '玉米粥',
    ],
  },
  {
    category: 'noodle',
    keywords: ['noodle', 'noodles', 'pasta', 'spaghetti', '面', '面条', '粉丝', '米粉', '河粉'],
  },
  {
    category: 'refined_grain',
    keywords: ['white rice', 'bread', 'toast', 'bagel', 'croissant', '米饭', '白饭', '面包', '馒头', '花卷'],
  },
  {
    category: 'protein_zero',
    keywords: [
      'chicken', 'beef', 'pork', 'lamb', 'fish', 'salmon', 'shrimp', 'tuna', 'egg', 'eggs', 'bacon', 'steak',
      '鸡', '牛', '猪', '羊', '鱼', '虾', '蛋', '肉', '排骨', '五花肉', '牛肉', '猪肉', '鸡肉',
    ],
  },
  {
    category: 'dairy_zero',
    keywords: ['milk', 'yogurt', 'cheese', 'butter', 'cream', '奶', '牛奶', '酸奶', '奶酪', '芝士'],
  },
  {
    category: 'beverage_zero',
    keywords: [
      'water', 'sparkling water', 'soda water', 'tea', 'green tea', 'black tea', 'herbal tea',
      'coffee', 'espresso', 'americano', 'black coffee', 'latte', 'cappuccino', 'soda', 'cola', 'diet coke', 'coke',
      'broth', 'bone broth', 'stock', 'vinegar', 'soy sauce',
      '水', '茶', '绿茶', '红茶', '咖啡', '美式', '拿铁', '气泡水', '苏打水',
    ],
  },
]

const KEYWORD_INDEX = CATEGORY_KEYWORDS.flatMap(({ category, keywords }) =>
  keywords.map((keyword) => ({
    category,
    keyword: keyword.toLowerCase(),
    isCjk: /[\u3400-\u9fff]/.test(keyword),
  })),
).sort((a, b) => b.keyword.length - a.keyword.length)

const STOP_EN = new Set([
  'i', 'me', 'my', 'we', 'our', 'a', 'an', 'the', 'and', 'or', 'with', 'without', 'of', 'for', 'to', 'in', 'on',
  'at', 'from', 'into', 'some', 'any', 'today', 'yesterday', 'lunch', 'dinner', 'breakfast', 'brunch', 'snack',
  'ate', 'eat', 'eaten', 'eating', 'had', 'have', 'has', 'having', 'including', 'include', 'plus', 'also',
  'bowl', 'plate', 'cup', 'slice', 'piece', 'pieces', 'serving', 'order', 'side', 'large', 'small', 'medium',
  'hot', 'cold', 'fresh', 'fried', 'boiled', 'steamed', 'grilled', 'noon', 'morning', 'evening', 'night',
])

const STOP_CJK = new Set([
  '我', '了', '的', '在', '是', '有', '和', '与', '及', '还', '还有', '吃', '吃了', '喝', '喝了',
  '中午', '早上', '晚上', '今天', '昨天', '包括', '一份', '一碗', '一盘', '一点', '一些', '然后',
  '另外', '个', '只', '次', '把', '被', '把', '就', '都', '也', '很', '非常',
])

function isCjkChar(ch: string): boolean {
  return /[\u3400-\u9fff]/.test(ch)
}

export function classifyPhrase(phrase: string): FiberCategory | null {
  const text = phrase.toLowerCase().trim()
  if (!text) return null
  for (const { category, keyword, isCjk } of KEYWORD_INDEX) {
    const idx = text.indexOf(keyword)
    if (idx === -1) continue
    if (isCjk) return category
    const before = text[idx - 1]
    const after = text[idx + keyword.length]
    const boundary =
      (idx === 0 || !/[\p{L}\p{N}]/u.test(before ?? '')) &&
      (idx + keyword.length >= text.length || !/[\p{L}\p{N}]/u.test(after ?? ''))
    if (boundary || text === keyword) return category
  }
  return null
}

export function estimateFiber(phrase: string): FiberEstimate | null {
  const label = phrase.trim()
  if (!label || label.length < 2) return null

  let category = classifyPhrase(label)
  let confidence: FiberEstimate['confidence'] = 'medium'

  if (!category) {
    // Meal-context CJK leftover with no keyword → conservative plant estimate
    if ([...label].some(isCjkChar) && label.length >= 2 && label.length <= 8) {
      category = 'unknown_plant'
      confidence = 'low'
    } else {
      return null
    }
  }

  if (category === 'unknown_plant') confidence = 'low'

  const defaults = CATEGORY_DEFAULTS[category]
  return {
    label,
    category,
    fiberG: defaults.fiberG,
    calories: defaults.calories,
    glpScore: defaults.glpScore,
    serving: defaults.serving,
    confidence,
  }
}

/** Pull food-like phrases from text spans the DB matcher did not consume. */
export function extractUnmatchedPhrases(text: string, used: boolean[]): string[] {
  const runs: string[] = []
  let buf = ''
  for (let i = 0; i < text.length; i++) {
    if (!used[i]) {
      buf += text[i]
    } else if (buf) {
      runs.push(buf)
      buf = ''
    }
  }
  if (buf) runs.push(buf)

  const phrases: string[] = []
  for (const run of runs) {
    const cleaned = run.replace(/[./-]+/g, ' ').trim()
    if (!cleaned) continue

    // Split Latin on spaces; split CJK on stop words / punctuation gaps
    const parts = cleaned
      .split(/\s+/)
      .flatMap((part) => splitCjk(part))
      .map((p) => p.trim())
      .filter(Boolean)

    for (const part of parts) {
      if (isStop(part)) continue
      if (/^\d+(\.\d+)?$/.test(part)) continue
      if (part.length < 2) continue
      phrases.push(part)
    }
  }

  // Dedupe preserving order
  const seen = new Set<string>()
  return phrases.filter((p) => {
    const key = p.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function isStop(token: string): boolean {
  const lower = token.toLowerCase()
  return STOP_EN.has(lower) || STOP_CJK.has(token) || STOP_CJK.has(lower)
}

/** Split mixed CJK strings on stop-word boundaries while keeping multi-char foods. */
function splitCjk(part: string): string[] {
  if (![...part].some(isCjkChar)) return [part]

  // Insert breaks around known CJK stop words
  let s = part
  for (const stop of STOP_CJK) {
    if (stop.length >= 2) s = s.split(stop).join(' ')
  }
  // Single-char grammatical particles already in STOP_CJK
  s = s.replace(/[了我的在是有和与及]/g, ' ')

  return s.split(/\s+/).filter(Boolean)
}
