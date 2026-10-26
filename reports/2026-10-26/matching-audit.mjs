/**
 * Targeted architecture audit. These are challenge cases, not a traffic sample.
 * Run from the repository root:
 *   node --import tsx reports/2026-10-26/matching-audit.mjs
 * Optional: FIBER_AUDIT_ROOT=/path/to/snapshot FIBER_AUDIT_OUTPUT=/tmp/result.json
 * Exit 1 means one or more required behavioral invariants were violated.
 */
import fs from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const root = process.env.FIBER_AUDIT_ROOT || fileURLToPath(new URL('../../', import.meta.url))
const { parseMeal } = await import(pathToFileURL(path.join(root, 'src/lib/parseMeal.ts')).href)
const { resolveMeal } = await import(pathToFileURL(path.join(root, 'src/lib/resolveMeal.ts')).href)
const first = r => r.matches[0]
const close = (a, b) => Number.isFinite(a) && Math.abs(a - b) < 0.11
const rows = []
function test(id, priority, inputs, expected, check) {
  const results = inputs.map(input => {
    const result = parseMeal(input)
    const inner = resolveMeal(input)
    return { input, ...result, issues: inner.issues }
  })
  let passed = false
  try { passed = Boolean(check(...results)) } catch { passed = false }
  rows.push({ id, priority, inputs, expected, passed, results })
}

test('control-eggs', 'control', ['2 grilled eggs'], 'Two cooked eggs, 100 g; zero fiber is a successful match.', r => r.matches.length === 1 && first(r).qty === 2 && first(r).grams === 100)
test('control-tomato', 'control', ['2 tomatos'], 'Two tomatoes, 246 g.', r => first(r)?.food.id === '170457' && first(r).grams === 246)
test('control-weight', 'control', ['100g apple', '300g apple'], 'Explicit weight and fiber scale by three.', (a,b) => first(a)?.grams === 100 && first(b)?.grams === 300 && close(b.totalFiberG, a.totalFiberG*3))
test('control-milk-volume', 'control', ['250ml milk', '500ml milk'], 'Volume scales consistently with the same reference.', (a,b) => close(first(b)?.grams,first(a)?.grams*2))
test('control-merge', 'control', ['100g apple, 200g apple'], 'Repeated database matches sum to 300 g.', r => first(r)?.grams === 300)

test('explicit-weight-overridden-by-size', 'P0', ['100g small apple'], 'An explicit 100 g remains 100 g regardless of a size adjective.', r => first(r)?.grams === 100)
test('spoon-default-cup-confusion', 'P0', ['2 tbsp hummus', '1 cup hummus'], 'With the same reference, 2 tbsp is 1/8 cup, not two default cups.', (a,b) => close(first(a)?.grams, first(b)?.grams/8))
test('count-default-cup-confusion', 'P0', ['10 almonds', '10 cups almonds'], 'A count of ten nuts must not equal ten cups of nuts.', (a,b) => first(a)?.grams !== first(b)?.grams)
test('berry-count-default-cup-confusion', 'P0', ['2 strawberries', '2 cups strawberries'], 'Two berries must not equal two cups.', (a,b) => first(a)?.grams !== first(b)?.grams)
test('zero-portion-fallback', 'P0', ['0 tbsp apple'], 'Zero quantity contributes zero nutrients.', r => r.totalFiberG === 0 && r.totalCalories === 0)
test('typo-weight-lost', 'P0', ['100g applo', '300g applo'], 'If the typo is resolved to apple, preserve 100 g and 300 g.', (a,b) => first(a)?.grams === 100 && first(b)?.grams === 300)
test('recipe-count-lost', 'P0', ['1 milk tea', '3 milk tea'], 'For the same recipe estimate, three servings scale the modeled quantity/nutrients by three.', (a,b) => first(b)?.qty === first(a)?.qty*3 && close(b.totalFiberG,a.totalFiberG*3))
test('recipe-weight-lost', 'P0', ['100g pizza', '500g pizza'], 'Any estimate for explicitly weighted pizza preserves the stated weights.', (a,b) => first(a)?.grams === 100 && first(b)?.grams === 500)
test('recipe-zero-lost', 'P0', ['0 pizza'], 'Zero pizzas contribute zero nutrients.', r => r.totalFiberG === 0 && r.totalCalories === 0)
test('repeated-estimate-dropped', 'P0', ['milk tea', 'milk tea, milk tea'], 'Two independent mentions add; database deduplication must not drop a consumed portion.', (a,b) => close(b.totalFiberG,a.totalFiberG*2) && b.totalCalories === a.totalCalories*2)
test('typo-plus-exact-dropped', 'P0', ['applo', 'applo and 1 apple'], 'A resolved typo mention plus an explicit apple sums both portions.', (a,b) => close(first(b)?.grams, first(a)?.grams*2))

test('raw-to-cooked-conflict', 'P1', ['100g raw broccoli'], 'An explicit raw food must not use a cooked nutrient row.', r => r.matches.length === 1 && /raw/i.test(first(r).food.name) && !/cooked/i.test(first(r).food.name))
test('raw-lentil-conflict', 'P1', ['100g raw lentils'], 'An explicit raw lentil must not use a cooked lentil row.', r => r.matches.length === 1 && !/cooked/i.test(first(r).food.name))
test('cooked-cabbage-to-kimchi', 'P1', ['1 cup cooked cabbage'], 'Ordinary cooked cabbage must not become kimchi.', r => r.matches.length === 1 && !/kimchi/i.test(first(r).food.name))
test('breast-to-processed-roll', 'P1', ['100g grilled chicken breast'], 'Plain chicken breast must not become a processed chicken roll.', r => r.matches.length === 1 && !/roll/i.test(first(r).food.name))
test('oil-category-precedence', 'P1', ['1 vegetable oil'], 'Recognize the compound food as oil; do not classify it as a vegetable serving.', r => r.matches.length === 1 && r.totalFiberG === 0)
test('recipe-as-pure-chicken', 'P1', ['1 chicken salad'], 'A chicken salad cannot inherit the pure-protein category solely from its longest keyword.', r => r.matches.length === 1 && !first(r).food.id.includes('protein_zero'))
test('unknown-cjk-is-food', 'P1', ['你好'], 'A greeting must not become an edible plant estimate.', r => r.matches.length === 0)
test('negative-sentence-counted', 'P1', ['I did not eat an apple'], 'A negated food must not contribute nutrients.', r => r.matches.length === 0 || r.totalFiberG === 0)
test('negative-scope-drops-eaten-food', 'P1', ['chicken without skin and 1 apple'], 'Without skin modifies chicken; the separately eaten apple remains.', r => r.matches.some(m => m.food.id === 'curated:apple'))
test('plus-segmentation', 'P1', ['1 apple + 2 bananas', '1 apple and 2 bananas'], 'Equivalent list separators preserve both foods and totals.', (a,b) => a.matches.length === 2 && a.totalFiberG === b.totalFiberG)
test('sentence-segmentation', 'P1', ['1 apple. 2 bananas', '1 apple and 2 bananas'], 'A sentence boundary must not collapse two foods into a single category estimate.', (a,b) => a.matches.length === 2 && a.totalFiberG === b.totalFiberG)
test('compound-sandwich-split', 'P1', ['peanut butter and jelly sandwich'], 'A sandwich phrase must not add a standalone cup of peanut butter.', r => !r.matches.some(m => /^Peanut butter/.test(m.food.name) && m.grams === 258))
test('frozen-berry-miss', 'P1', ['100g frozen blueberries'], 'A common frozen berry should resolve with its explicit 100 g and appropriate form.', r => r.matches.length === 1 && first(r).grams === 100 && /frozen/i.test(first(r).food.name))
test('boiled-carrot-miss', 'P1', ['100g boiled carrots'], 'A common cooked carrot should resolve with its explicit 100 g.', r => r.matches.length === 1 && first(r).grams === 100 && /Carrot/i.test(first(r).food.name))
test('number-word-miss', 'P1', ['six bananas', '6 bananas'], 'Word and digit quantities should agree for supported everyday count inputs.', (a,b) => a.matches.length === 1 && first(a).grams === first(b)?.grams)
test('time-adverb-miss', 'P1', ['I had 1 apple and 2 bananas today', '1 apple and 2 bananas'], 'A trailing time adverb does not discard the banana.', (a,b) => a.matches.length === 2 && a.totalFiberG === b.totalFiberG)
test('confidence-contradicts-ambiguity', 'P1', ['100g grilled chicken breast'], 'A result requiring identity confirmation must not carry high identity confidence.', r => !r.matches.some(m => m.needsConfirm && m.confidence === 'high'))

const report = {
  generatedAt: new Date().toISOString(),
  sourceRoot: root,
  note: 'Deliberately selected challenge cases. Counts are not a production error-rate estimate. Nutrient expectations use internal consistency and semantic constraints, not a new nutrition dataset.',
  total: rows.length,
  passed: rows.filter(r=>r.passed).length,
  failed: rows.filter(r=>!r.passed).length,
  cases: rows,
}
if (process.env.FIBER_AUDIT_OUTPUT) fs.writeFileSync(process.env.FIBER_AUDIT_OUTPUT, JSON.stringify(report,null,2))
for (const r of rows) console.log(`${r.passed ? 'PASS' : 'FAIL'} ${r.priority} ${r.id}`)
console.log(JSON.stringify({total:report.total,passed:report.passed,failed:report.failed}))
process.exitCode = report.failed ? 1 : 0
