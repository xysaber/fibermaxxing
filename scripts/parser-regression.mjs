/**
 * Parser regression — totals + semantic identity (PRD §7).
 *
 * Usage: npx tsx scripts/parser-regression.mjs
 */
import { parseMeal } from '../src/lib/parseMeal.ts'

const cases = [
  // --- existing fiber totals ---
  { input: '1 medium orange', expectTotal: 3.1, nameIncludes: /^Oranges, raw, all/, forbidNames: /flour|sherbet/i, count: 1 },
  { input: '2 medium oranges', expectTotal: 6.3, count: 1 },
  { input: '130g orange', expectTotal: 3.1, count: 1 },
  { input: '1 cup raw oranges', expectTotal: 4.3, count: 1 },
  { input: '170g plain nonfat Greek yogurt', expectTotal: 0, nameIncludes: /Greek, plain, nonfat/, forbidNames: /butter|soymilk/i, count: 1, grams: 170 },
  { input: '340g plain nonfat Greek yogurt', expectTotal: 0, count: 1, grams: 340 },
  { input: '170g lowfat Greek yogurt', expectTotal: 0, count: 1, grams: 170 },
  { input: '2 slices whole-wheat bread', expectTotal: 3.8, count: 1 },
  { input: '1 cup cooked oatmeal, 1 tbsp chia seeds, 1/2 cup blueberries', expectTotal: 9.2, count: 3 },
  { input: '20g chia seeds, 1/2 cup raspberries, 170g plain nonfat Greek yogurt', expectTotal: 10.9, count: 3 },
  { input: '75g avocado, 1 slice whole-wheat bread, 130g raw orange', expectTotal: 10, count: 3 },
  { input: 'plain nonfat medium', expectTotal: 0, count: 0 },
  { input: '1 apple and 2 apples', expectTotal: 13.1, count: 1 },
  { input: '100g apple and 200g apple', expectTotal: 7.2, count: 1 },
  { input: 'qwertyzz', expectTotal: 0, count: 0 },
  { input: '1 apple', expectTotal: 4.4, forbidNames: /artichoke/i },
  { input: '2 apples', expectTotal: 8.7, forbidNames: /artichoke/i },
  { input: '1/2 apple', expectTotal: 2.2 },
  { input: '100g apple', expectTotal: 2.4 },
  { input: '200g apple', expectTotal: 4.8 },
  { input: '1 tbsp chia seeds', minTotal: 3, maxTotal: 5 },
  { input: '2 tbsp chia seeds', minTotal: 6, maxTotal: 8 },
  { input: '1 cup cooked lentils', expectTotal: 15.6, forbidNames: /artichoke/i },
  { input: '2 cups cooked lentils', expectTotal: 31.3, forbidNames: /artichoke/i },
  { input: 'salad without avocado', minTotal: 4, maxTotal: 6, minCount: 1, forbidNames: /avocado/i, source: 'estimate' },
  { input: 'blueberries', nameIncludes: /Blueberries, raw/i },

  // --- PRD §7 semantic ---
  {
    name: 'chicken ≠ meatless/fried',
    input: 'chicken',
    count: 1,
    foodId: '172395',
    forbidNames: /meatless|fried|breaded/i,
    forbidIds: ['169886', '167719', '171053'],
    tag: 'assumed',
    assumed: true,
  },
  {
    name: 'grilled chicken ≠ meatless/fried',
    input: 'grilled chicken',
    count: 1,
    foodId: '172395',
    forbidNames: /meatless|fried|breaded/i,
    forbidIds: ['169886', '167719', '171053'],
  },
  {
    name: 'chicken grilled word order',
    input: 'chicken grilled',
    count: 1,
    foodId: '172395',
    forbidNames: /meatless|fried/i,
  },
  {
    name: '2 cups cooked lentils identity',
    input: '2 cups cooked lentils',
    count: 1,
    foodId: '172421',
    forbidNames: /artichoke/i,
    tag: 'database',
    assumed: false,
  },
  {
    name: 'tomatos spelling → tomato',
    input: 'tomatos',
    count: 1,
    foodId: '170457',
  },
  {
    name: 'tomato singular',
    input: 'tomato',
    count: 1,
    foodId: '170457',
  },
  {
    name: '2 tomatoes count binding',
    input: '2 tomatoes',
    count: 1,
    foodId: '170457',
    grams: 246,
    assumed: false,
  },
  {
    name: 'milk tea recipe needs confirm',
    input: 'milk tea',
    count: 1,
    tag: 'needs_confirm',
    needsConfirm: true,
    source: 'estimate',
    forbidNames: /Yogurt|Milk,|Cheese/i,
  },
  {
    name: 'milktea sticky spelling',
    input: 'milktea',
    count: 1,
    tag: 'needs_confirm',
    needsConfirm: true,
    source: 'estimate',
  },
  {
    name: 'portion binds per mention',
    input: '1 apple, 2 tomatoes',
    count: 2,
    foodIds: ['curated:apple', '170457'],
  },
  {
    name: 'ambiguous unknown → no fake precise db',
    input: 'qwertyzz',
    count: 0,
    unmatchedMin: 1,
  },
  {
    name: 'plain milk → whole fluid milk',
    input: 'milk',
    count: 1,
    foodId: '171265',
    forbidNames: /buttermilk|chocolate|dried/i,
    tag: 'assumed',
  },
  {
    name: '1 cup milk portion',
    input: '1 cup milk',
    count: 1,
    foodId: '171265',
    grams: 244,
    assumed: false,
  },
  // Multi-hit must not discard — pick everyday default, never empty
  {
    name: 'rice multi-hit keeps a row',
    input: 'rice',
    minCount: 1,
    forbidNames: /flour|bran|pudding|cracker|glutinous|wild/i,
    nameIncludes: /Rice, white/i,
  },
  {
    name: 'bread multi-hit keeps a row',
    input: 'bread',
    minCount: 1,
    forbidNames: /pudding|crumb|stuffing|sticks/i,
  },
  {
    name: 'potato multi-hit keeps a row',
    input: 'potato',
    minCount: 1,
    forbidNames: /flour|chips|snack|hash brown/i,
    nameIncludes: /flesh and skin|boiled|baked/i,
  },
  {
    name: 'tofu multi-hit keeps a row',
    input: 'tofu',
    minCount: 1,
  },
  {
    name: 'beef multi-hit prefers ground not pastrami',
    input: 'beef',
    minCount: 1,
    nameIncludes: /ground/i,
    forbidNames: /pastrami|cured|bologna/i,
  },
  {
    name: 'tea is consumable zero-fiber estimate',
    input: 'tea',
    minCount: 1,
    source: 'estimate',
    expectTotal: 0,
  },
  {
    name: 'coffee is consumable zero-fiber estimate',
    input: 'coffee',
    minCount: 1,
    source: 'estimate',
    expectTotal: 0,
  },
  {
    name: 'water is consumable zero-fiber estimate',
    input: 'water',
    minCount: 1,
    source: 'estimate',
    expectTotal: 0,
  },
  {
    name: 'gibberish emptyKind not_food',
    input: 'qwertyzz',
    count: 0,
    emptyKind: 'not_food',
  },
  {
    name: 'example bowl of oatmeal',
    input: 'I ate 2 eggs, 1 bowl of oatmeal, and an apple',
    count: 3,
    forbidNames: /artichoke/i,
  },
  {
    name: '1 bowl oatmeal alone',
    input: '1 bowl of oatmeal',
    count: 1,
    foodId: 'curated:oatmeal',
    grams: 234,
    tag: 'needs_confirm',
  },
  // Identity kept when unit is fuzzy
  {
    name: '200ml milk keeps identity',
    input: '200ml milk',
    count: 1,
    foodId: '171265',
    tag: 'needs_confirm',
  },
  {
    name: '1 slice apple keeps identity',
    input: '1 slice apple',
    count: 1,
    nameIncludes: /Apple/i,
    tag: 'needs_confirm',
  },
  {
    name: '2 cups chicken keeps identity',
    input: '2 cups chicken',
    count: 1,
    foodId: '172395',
    grams: 280,
    forbidNames: /meatless/i,
  },
  // No tbsp density: keep identity with 1× default serving (never amount×cup)
  {
    name: '1 tbsp orange keeps 1 default serving not inventing density',
    input: '1 tbsp orange',
    count: 1,
    nameIncludes: /Orange/i,
    tag: 'needs_confirm',
  },
  {
    name: '2 tbsp hummus without tbsp density is not 2 cups',
    input: '2 tbsp hummus',
    count: 1,
    maxGrams: 50,
    note: 'Must not treat 2 tbsp as 2× cup-sized default',
  },
  {
    name: '100g small apple keeps explicit grams',
    input: '100g small apple',
    count: 1,
    grams: 100,
    nameIncludes: /Apple/i,
  },
  {
    name: '0 tbsp apple is zero nutrients',
    input: '0 tbsp apple',
    expectTotal: 0,
  },
  {
    name: '10 almonds is not 10 cups',
    input: '10 almonds',
    count: 1,
    maxGrams: 40,
  },
]

let failed = 0
for (const c of cases) {
  const r = parseMeal(c.input)
  const names = r.matches.map((m) => m.food.name).join(' | ')
  const ids = r.matches.map((m) => m.food.id)
  const problems = []
  if (c.count != null && r.matches.length !== c.count) problems.push(`count ${r.matches.length} != ${c.count}`)
  if (c.minCount != null && r.matches.length < c.minCount) problems.push(`count ${r.matches.length} < ${c.minCount}`)
  if (c.grams != null && r.matches[0]?.grams !== c.grams) problems.push(`grams ${r.matches[0]?.grams} != ${c.grams}`)
  if (c.maxGrams != null && r.matches[0] && r.matches[0].grams > c.maxGrams) {
    problems.push(`grams ${r.matches[0].grams} > max ${c.maxGrams}`)
  }
  if (c.expectTotal != null && Math.abs(r.totalFiberG - c.expectTotal) > 0.15) {
    problems.push(`total ${r.totalFiberG} != ${c.expectTotal}`)
  }
  if (c.minTotal != null && r.totalFiberG < c.minTotal) problems.push(`total ${r.totalFiberG} < ${c.minTotal}`)
  if (c.maxTotal != null && r.totalFiberG > c.maxTotal) problems.push(`total ${r.totalFiberG} > ${c.maxTotal}`)
  if (c.forbidNames && r.matches.some((m) => c.forbidNames.test(m.food.name))) {
    problems.push(`forbidden match in ${names}`)
  }
  if (c.nameIncludes && !r.matches.some((m) => c.nameIncludes.test(m.food.name))) {
    problems.push(`expected name ${c.nameIncludes} in ${names}`)
  }
  if (c.foodId && r.matches[0]?.food.id !== c.foodId) {
    problems.push(`foodId ${r.matches[0]?.food.id} != ${c.foodId}`)
  }
  if (c.foodIds) {
    const got = new Set(ids)
    for (const id of c.foodIds) {
      if (!got.has(id)) problems.push(`missing foodId ${id} in [${ids.join(',')}]`)
    }
  }
  if (c.forbidIds && r.matches.some((m) => c.forbidIds.includes(m.food.id))) {
    problems.push(`forbidden id in ${ids.join(',')}`)
  }
  if (c.tag != null && r.matches[0]?.tag !== c.tag) {
    problems.push(`tag ${r.matches[0]?.tag} != ${c.tag}`)
  }
  if (c.assumed != null && r.matches[0]?.assumed !== c.assumed) {
    problems.push(`assumed ${r.matches[0]?.assumed} != ${c.assumed}`)
  }
  if (c.needsConfirm != null && r.matches[0]?.needsConfirm !== c.needsConfirm) {
    problems.push(`needsConfirm ${r.matches[0]?.needsConfirm} != ${c.needsConfirm}`)
  }
  if (c.source != null && r.matches[0]?.source !== c.source) {
    problems.push(`source ${r.matches[0]?.source} != ${c.source}`)
  }
  if (c.unmatchedMin != null && r.unmatchedHints.length < c.unmatchedMin) {
    problems.push(`unmatchedHints ${r.unmatchedHints.length} < ${c.unmatchedMin}`)
  }
  if (c.emptyKind != null && r.emptyKind !== c.emptyKind) {
    problems.push(`emptyKind ${r.emptyKind} != ${c.emptyKind}`)
  }
  if (problems.length) {
    failed++
    console.error('FAIL', c.name || c.input, problems.join('; '), 'got', r.totalFiberG, names, ids.join(','))
  } else {
    console.log('ok', c.name || c.input, '=>', r.totalFiberG + 'g', r.matches[0]?.tag ?? '')
  }
}

if (failed) {
  console.error(`\n${failed} case(s) failed`)
  process.exit(1)
}
console.log(`\nAll ${cases.length} cases passed`)
