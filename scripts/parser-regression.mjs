/**
 * Lightweight parser regression (run: node --experimental-strip-types
 * is unavailable for path aliases; use npx tsx scripts/parser-regression.mjs
 * after converting — this file imports via dynamic tsx register).
 *
 * Usage: npx tsx scripts/parser-regression.mjs
 */
import { parseMeal } from '../src/lib/parseMeal.ts'

const cases = [
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
  { input: 'salad without avocado', expectTotal: 0, forbidNames: /avocado/i },
  { input: 'blueberries', nameIncludes: /Blueberries, raw/i },
]

let failed = 0
for (const c of cases) {
  const r = parseMeal(c.input)
  const names = r.matches.map((m) => m.food.name).join(' | ')
  const problems = []
  if (c.count != null && r.matches.length !== c.count) problems.push(`count ${r.matches.length} != ${c.count}`)
  if (c.grams != null && r.matches[0]?.grams !== c.grams) problems.push(`grams ${r.matches[0]?.grams} != ${c.grams}`)
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
  if (problems.length) {
    failed++
    console.error('FAIL', c.input, problems.join('; '), 'got', r.totalFiberG, names)
  } else {
    console.log('ok', c.input, '=>', r.totalFiberG + 'g')
  }
}

if (failed) {
  console.error(`\n${failed} case(s) failed`)
  process.exit(1)
}
console.log(`\nAll ${cases.length} cases passed`)
