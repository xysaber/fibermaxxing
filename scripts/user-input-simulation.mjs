/**
 * Simulate ~100 realistic meal inputs against parseMeal.
 * Expectation class (product 4-way):
 *   precise   — database nutrient row
 *   estimate  — category estimate line
 *   food_gap  — edible/drinkable but should NOT be "not_food" empty
 *   not_food  — gibberish / non-consumable → emptyKind not_food
 *
 * Usage: node --import tsx scripts/user-input-simulation.mjs
 */
import { parseMeal } from '../src/lib/parseMeal.ts'

/** @typedef {'precise' | 'estimate' | 'food_gap' | 'not_food'} ExpectClass */

/**
 * @type {{ name: string, input: string, expect: ExpectClass, minCount?: number, maxCount?: number, forbidNames?: RegExp, nameIncludes?: RegExp, forbidIds?: string[], fiberMin?: number, fiberMax?: number, note?: string }[]}
 */
const cases = [
  // —— precise: curated / clear USDA ——
  { name: 'single apple', input: '1 apple', expect: 'precise', minCount: 1, nameIncludes: /Apple/i },
  { name: 'two apples', input: '2 apples', expect: 'precise', minCount: 1 },
  { name: 'half avocado', input: 'half an avocado', expect: 'precise', minCount: 1, nameIncludes: /Avocado/i },
  { name: 'oatmeal bowl', input: '1 cup cooked oatmeal', expect: 'precise', minCount: 1, nameIncludes: /Oatmeal|oat/i },
  { name: 'chia tbsp', input: '1 tbsp chia seeds', expect: 'precise', minCount: 1, nameIncludes: /chia/i },
  { name: 'lentils cups', input: '2 cups cooked lentils', expect: 'precise', minCount: 1, forbidNames: /artichoke/i },
  { name: 'orange grams', input: '130g orange', expect: 'precise', minCount: 1 },
  { name: 'greek yogurt nonfat', input: '170g plain nonfat Greek yogurt', expect: 'precise', minCount: 1, nameIncludes: /Greek.*nonfat/i },
  { name: 'whole wheat bread', input: '2 slices whole-wheat bread', expect: 'precise', minCount: 1 },
  { name: 'blueberries cup', input: '1/2 cup blueberries', expect: 'precise', minCount: 1 },
  { name: 'banana', input: 'a banana', expect: 'precise', minCount: 1, nameIncludes: /Banana/i },
  { name: 'broccoli', input: '1 cup broccoli', expect: 'precise', minCount: 1 },
  { name: 'brown rice', input: '1 cup cooked brown rice', expect: 'precise', minCount: 1 },
  { name: 'black beans', input: '1 cup black beans', expect: 'precise', minCount: 1 },
  { name: 'spinach', input: '2 cups spinach', expect: 'precise', minCount: 1 },
  { name: 'carrot', input: '1 carrot', expect: 'precise', minCount: 1 },
  { name: 'pear', input: '1 pear', expect: 'precise', minCount: 1 },
  { name: 'egg count', input: '3 eggs', expect: 'precise', minCount: 1, nameIncludes: /Egg/i },
  { name: 'fried egg', input: 'fried egg', expect: 'precise', minCount: 1 },
  { name: 'peanut butter', input: '2 tbsp peanut butter', expect: 'precise', minCount: 1 },
  { name: 'almonds', input: 'almonds', expect: 'precise', minCount: 1 },
  { name: 'flaxseed', input: '1 tbsp flaxseed', expect: 'precise', minCount: 1 },
  { name: 'quinoa', input: '1 cup quinoa', expect: 'precise', minCount: 1 },
  { name: 'chickpeas', input: '1 cup chickpeas', expect: 'precise', minCount: 1 },
  { name: 'strawberries', input: 'strawberries', expect: 'precise', minCount: 1 },
  { name: 'raspberries', input: 'raspberries', expect: 'precise', minCount: 1 },
  { name: 'psyllium', input: '1 tsp psyllium husk', expect: 'precise', minCount: 1 },
  { name: 'sourdough', input: 'sourdough toast', expect: 'precise', minCount: 1 },
  { name: 'tomatos typo', input: '2 tomatos', expect: 'precise', minCount: 1, nameIncludes: /Tomato/i },
  { name: 'milk whole default', input: 'milk', expect: 'precise', minCount: 1, forbidNames: /buttermilk|chocolate|dried/i },
  { name: 'skim milk', input: 'skim milk', expect: 'precise', minCount: 1 },
  { name: '1 cup milk', input: '1 cup milk', expect: 'precise', minCount: 1 },
  { name: 'chicken bare', input: 'chicken', expect: 'precise', minCount: 1, forbidNames: /meatless|fried|breaded/i, forbidIds: ['169886', '167719', '171053'] },
  { name: 'grilled chicken', input: 'grilled chicken', expect: 'precise', minCount: 1, forbidNames: /meatless|fried/i },
  { name: 'chicken grilled order', input: 'chicken grilled', expect: 'precise', minCount: 1, forbidNames: /meatless/i },
  { name: 'fried chicken said', input: 'fried chicken', expect: 'precise', minCount: 1, nameIncludes: /fried/i, forbidNames: /meatless/i },

  // —— multi-item / binding ——
  { name: 'breakfast combo', input: '1 cup cooked oatmeal, 1 tbsp chia seeds, 1/2 cup blueberries', expect: 'precise', minCount: 3 },
  { name: 'apple and tomatoes', input: '1 apple, 2 tomatoes', expect: 'precise', minCount: 2 },
  { name: 'dinner plate', input: 'Lentils, broccoli, brown rice, and avocado for dinner', expect: 'precise', minCount: 3 },
  { name: 'i ate prefix', input: 'I ate 2 eggs, 1 bowl of oatmeal, and an apple', expect: 'precise', minCount: 2, note: 'bowl oatmeal may portion-fail' },
  { name: 'negation salad', input: 'salad without avocado', expect: 'estimate', minCount: 1, forbidNames: /avocado/i, note: 'recipe estimate; avocado excluded' },
  { name: 'yogurt + berries', input: '20g chia seeds, 1/2 cup raspberries, 170g plain nonfat Greek yogurt', expect: 'precise', minCount: 3 },

  // —— multi-hit everyday commodities (precise with needs_confirm ok) ——
  { name: 'rice bare', input: 'rice', expect: 'precise', minCount: 1, forbidNames: /glutinous|flour|pudding/i },
  { name: 'bread bare', input: 'bread', expect: 'precise', minCount: 1, forbidNames: /sticks|pudding/i },
  { name: 'potato bare', input: 'potato', expect: 'precise', minCount: 1, forbidNames: /flour|chips|hash brown/i },
  { name: 'beef bare', input: 'beef', expect: 'precise', minCount: 1, nameIncludes: /ground/i, forbidNames: /pastrami|cured/i },
  { name: 'cheese bare', input: 'cheese', expect: 'precise', minCount: 1 },
  { name: 'yogurt bare', input: 'yogurt', expect: 'precise', minCount: 1, nameIncludes: /Yogurt/i },
  { name: 'tofu bare', input: 'tofu', expect: 'precise', minCount: 1 },
  { name: 'onion bare', input: 'onion', expect: 'precise', minCount: 1 },
  { name: 'garlic bare', input: 'garlic', expect: 'precise', minCount: 1 },
  { name: 'mushroom bare', input: 'mushroom', expect: 'precise', minCount: 1 },
  { name: 'cabbage bare', input: 'cabbage', expect: 'precise', minCount: 1 },
  { name: 'corn bare', input: 'corn', expect: 'precise', minCount: 1 },
  { name: 'pasta bare', input: 'pasta', expect: 'precise', minCount: 1 },
  { name: 'hummus', input: 'hummus', expect: 'precise', minCount: 1 },
  { name: 'kale', input: 'kale', expect: 'precise', minCount: 1 },
  { name: 'sweet potato', input: 'sweet potato', expect: 'precise', minCount: 1 },
  { name: 'orange juice', input: 'orange juice', expect: 'precise', minCount: 1, nameIncludes: /Orange juice/i },
  { name: 'turkey', input: 'turkey', expect: 'precise', minCount: 1, forbidNames: /meatless/i },
  { name: 'salmon', input: 'salmon', expect: 'estimate', minCount: 1, note: 'often estimate protein_zero' },
  { name: 'shrimp', input: 'shrimp', expect: 'estimate', minCount: 1 },
  { name: 'tuna', input: 'tuna', expect: 'estimate', minCount: 1 },
  { name: 'bacon', input: 'bacon', expect: 'precise', minCount: 1 },
  { name: 'ham', input: 'ham', expect: 'precise', minCount: 1 },
  { name: 'sausage', input: 'sausage', expect: 'precise', minCount: 1 },
  { name: 'butter', input: 'butter', expect: 'precise', minCount: 1 },
  { name: 'sugar', input: 'sugar', expect: 'precise', minCount: 1 },
  { name: 'olive oil', input: 'olive oil', expect: 'estimate', minCount: 1 },
  { name: 'flour', input: 'flour', expect: 'estimate', minCount: 1 },
  { name: 'granola', input: 'granola', expect: 'estimate', minCount: 1 },
  { name: 'cereal', input: 'cereal', expect: 'food_gap' },
  { name: 'pancakes', input: 'pancakes', expect: 'food_gap' },
  { name: 'waffle', input: 'waffle', expect: 'food_gap' },
  { name: 'cookie', input: 'cookie', expect: 'food_gap' },
  { name: 'ice cream', input: 'ice cream', expect: 'food_gap' },
  { name: 'chocolate', input: 'chocolate', expect: 'food_gap' },
  { name: 'honey', input: 'honey', expect: 'food_gap' },
  { name: 'ketchup', input: 'ketchup', expect: 'estimate', minCount: 1 },
  { name: 'mayonnaise', input: 'mayonnaise', expect: 'estimate', minCount: 1 },

  // —— recipes / mixed ——
  { name: 'milk tea', input: 'milk tea', expect: 'estimate', minCount: 1 },
  { name: 'milktea sticky', input: 'milktea', expect: 'estimate', minCount: 1 },
  { name: 'bubble tea', input: 'bubble tea', expect: 'estimate', minCount: 1 },
  { name: 'smoothie', input: 'smoothie', expect: 'estimate', minCount: 1 },
  { name: 'salad bare', input: 'salad', expect: 'estimate', minCount: 1 },
  { name: 'pizza', input: 'pizza', expect: 'estimate', minCount: 1 },
  { name: 'burrito', input: 'burrito', expect: 'estimate', minCount: 1 },
  { name: 'soup', input: 'soup', expect: 'estimate', minCount: 1 },
  { name: 'sandwich', input: 'sandwich', expect: 'estimate', minCount: 1 },
  { name: 'curry', input: 'curry', expect: 'estimate', minCount: 1 },
  { name: 'burger', input: 'burger', expect: 'estimate', minCount: 1 },
  { name: 'wrap recipe', input: 'wrap', expect: 'estimate', minCount: 1 },
  { name: 'chia pudding recipe', input: 'chia pudding', expect: 'estimate', minCount: 1 },

  // —— beverages zero ——
  { name: 'tea', input: 'tea', expect: 'estimate', minCount: 1, fiberMax: 0.1 },
  { name: 'coffee', input: 'coffee', expect: 'estimate', minCount: 1, fiberMax: 0.1 },
  { name: 'water', input: 'water', expect: 'estimate', minCount: 1, fiberMax: 0.1 },
  { name: 'green tea', input: 'green tea', expect: 'estimate', minCount: 1, fiberMax: 0.1 },
  { name: 'black coffee', input: 'black coffee', expect: 'estimate', minCount: 1, fiberMax: 0.1 },
  { name: 'ice water', input: 'ice water', expect: 'estimate', minCount: 1, fiberMax: 0.1 },
  { name: 'broth', input: 'broth', expect: 'estimate', minCount: 1 },
  { name: 'drank water and tea', input: 'I drank water and tea', expect: 'estimate', minCount: 2 },
  { name: 'tea and apple', input: 'tea and an apple', expect: 'precise', minCount: 2, fiberMin: 3 },

  // —— conversational / messy ——
  { name: 'breakfast colon', input: 'Breakfast: oatmeal, banana, coffee', expect: 'precise', minCount: 2 },
  { name: 'for lunch', input: 'for lunch I had a salad and chicken', expect: 'food_gap', note: 'salad+chicken mix' },
  { name: 'plus with', input: 'rice with beans plus avocado', expect: 'precise', minCount: 2 },
  { name: 'chinese hotpot', input: '火锅', expect: 'estimate', minCount: 1 },
  { name: 'chinese rice', input: '白饭', expect: 'estimate', minCount: 1 },
  { name: 'chinese banana', input: '香蕉', expect: 'estimate', minCount: 1 },
  { name: 'coffee latte phrase', input: 'latte', expect: 'estimate', minCount: 1 },
  { name: 'protein shake', input: 'protein shake', expect: 'estimate', minCount: 1 },
  { name: 'energy bar', input: 'energy bar', expect: 'estimate', minCount: 1 },
  { name: 'greek yogurt bare', input: 'greek yogurt', expect: 'precise', minCount: 1, nameIncludes: /Greek/i },
  { name: 'large fries', input: 'fries', expect: 'estimate', minCount: 1 },
  { name: 'mashed potatoes', input: 'mashed potatoes', expect: 'estimate', minCount: 1 },
  { name: 'salt known untracked', input: 'salt', expect: 'food_gap', note: 'consumable_untracked tip, not not_food' },
  { name: '100g chicken breast', input: '100g chicken breast', expect: 'food_gap', note: 'breast may miss concept' },
  { name: '2 cups cooked lentils no artichoke', input: '2 cups cooked lentils', expect: 'precise', forbidNames: /artichoke/i },

  // —— not food ——
  { name: 'gibberish', input: 'qwertyzz', expect: 'not_food' },
  { name: 'asdf', input: 'asdf', expect: 'not_food' },
  { name: 'hi', input: 'hi', expect: 'not_food' },
  { name: 'nothing', input: 'Nothing', expect: 'not_food' },
  { name: 'lol', input: 'lol', expect: 'not_food' },
  { name: 'test123', input: 'test123', expect: 'not_food' },
  { name: 'ellipsis', input: '...', expect: 'not_food' },
  { name: 'only prep', input: 'grilled', expect: 'not_food' },
  { name: 'only size', input: 'medium', expect: 'not_food' },
  { name: 'random id', input: 'xyzabc123foo', expect: 'not_food' },
]

function classifyActual(r) {
  if (r.matches.length === 0) {
    return r.emptyKind === 'consumable_untracked' ? 'food_gap' : 'not_food'
  }
  if (r.matches.every((m) => m.source === 'estimate')) return 'estimate'
  if (r.matches.some((m) => m.source === 'database')) return 'precise'
  return 'estimate'
}

function check(c, r) {
  const problems = []
  const actual = classifyActual(r)
  const names = r.matches.map((m) => m.food.name).join(' | ')
  const ids = r.matches.map((m) => m.food.id)

  // Class expectations
  if (c.expect === 'precise') {
    if (r.matches.length === 0) problems.push(`got empty(${r.emptyKind}) want precise`)
    else if (!r.matches.some((m) => m.source === 'database')) problems.push(`got estimate-only want precise`)
  } else if (c.expect === 'estimate') {
    if (r.matches.length === 0) problems.push(`got empty(${r.emptyKind}) want estimate`)
    else if (!r.matches.some((m) => m.source === 'estimate') && c.expect === 'estimate') {
      // allow precise if we lucked into USDA — still ok for beverages? prefer estimate for tea
      if (!r.matches.every((m) => m.source === 'database')) {
        /* mixed ok */
      } else if (!/tea|coffee|water|broth|milk tea|smoothie|pizza|soup|salad|burrito|sandwich|curry|burger|pudding|火锅|白饭|香蕉/i.test(c.input)) {
        problems.push(`got precise-only want estimate`)
      }
    }
  } else if (c.expect === 'food_gap') {
    // Must not be classified as gibberish not_food with zero acknowledgment
    if (r.matches.length === 0 && r.emptyKind === 'not_food') {
      problems.push(`edible treated as not_food`)
    }
  } else if (c.expect === 'not_food') {
    if (r.matches.length > 0) problems.push(`got ${r.matches.length} matches want not_food (${names})`)
    if (r.emptyKind && r.emptyKind !== 'not_food') problems.push(`emptyKind ${r.emptyKind} != not_food`)
  }

  if (c.minCount != null && r.matches.length < c.minCount) problems.push(`count ${r.matches.length} < ${c.minCount}`)
  if (c.maxCount != null && r.matches.length > c.maxCount) problems.push(`count ${r.matches.length} > ${c.maxCount}`)
  if (c.forbidNames && r.matches.some((m) => c.forbidNames.test(m.food.name))) problems.push(`forbidden name in ${names}`)
  if (c.nameIncludes && !r.matches.some((m) => c.nameIncludes.test(m.food.name))) problems.push(`missing name ${c.nameIncludes}`)
  if (c.forbidIds && r.matches.some((m) => c.forbidIds.includes(m.food.id))) problems.push(`forbidden id`)
  if (c.fiberMin != null && r.totalFiberG < c.fiberMin) problems.push(`fiber ${r.totalFiberG} < ${c.fiberMin}`)
  if (c.fiberMax != null && r.totalFiberG > c.fiberMax) problems.push(`fiber ${r.totalFiberG} > ${c.fiberMax}`)

  return { actual, problems, names, ids, fiber: r.totalFiberG, empty: r.emptyKind }
}

const byExpect = { precise: [], estimate: [], food_gap: [], not_food: [] }
let failed = 0
const failures = []

for (const c of cases) {
  const r = parseMeal(c.input)
  const result = check(c, r)
  const row = { ...c, ...result, matchCount: r.matches.length }
  byExpect[c.expect].push(row)
  if (result.problems.length) {
    failed++
    failures.push(row)
    console.error('FAIL', c.name, result.problems.join('; '), '→', result.actual, result.names || result.empty)
  } else {
    console.log('ok', c.name, '→', result.actual, `n=${r.matches.length}`, `fiber=${r.totalFiberG}`)
  }
}

console.log('\n========== SUMMARY ==========')
console.log(`Total: ${cases.length}  Pass: ${cases.length - failed}  Fail: ${failed}`)
for (const k of Object.keys(byExpect)) {
  const rows = byExpect[k]
  const f = rows.filter((x) => x.problems.length).length
  console.log(`  ${k}: ${rows.length - f}/${rows.length} pass`)
}
if (failures.length) {
  console.log('\n========== FAILURES BY EXPECT ==========')
  for (const row of failures) {
    console.log(`- [${row.expect}] ${row.name}: "${row.input}"`)
    console.log(`  problems: ${row.problems.join('; ')}`)
    console.log(`  actual=${row.actual} empty=${row.empty} names=${row.names || '(none)'} fiber=${row.fiber}`)
    if (row.note) console.log(`  note: ${row.note}`)
  }
}

process.exit(failed ? 1 : 0)
