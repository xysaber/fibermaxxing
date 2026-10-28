/**
 * Smoke: Quick start meals + CTA fill path parse cleanly (first-success activation).
 * Exit 0 only if all starters/examples produce ≥1 match and no throw.
 */
import assert from 'node:assert/strict'
import { parseMeal } from '../src/lib/parseMeal.ts'

const STARTERS = [
  {
    id: 'starter_oat_bowl',
    meal: '1 cup cooked oatmeal, 1 tbsp chia seeds, 1/2 cup blueberries',
  },
  {
    id: 'starter_simple_day',
    meal: '2 eggs, 1 bowl of oatmeal, and an apple',
  },
  {
    id: 'starter_lentil_dinner',
    meal: '1 cup cooked lentils, broccoli, and brown rice',
  },
]

const MORE_EXAMPLES = [
  '20g chia seeds, 1/2 cup raspberries, 170g yogurt greek plain nonfat',
  '2 slices whole-wheat toast, 1/2 avocado, 1 cup raspberries',
  '1 cup cooked oatmeal with 1 medium pear',
  'Lentils, broccoli, brown rice, and avocado for dinner',
  'Psyllium husk in water, salad, hummus, and a pear',
]

const rows = []

function check(name, meal) {
  const parsed = parseMeal(meal)
  assert.ok(parsed.matches.length >= 1, `${name}: expected ≥1 match`)
  assert.ok(parsed.totalFiberG > 0, `${name}: expected fiber > 0`)
  rows.push({
    name,
    ok: true,
    foods: parsed.matches.length,
    fiber_g: parsed.totalFiberG,
    reliability: parsed.reliability,
    assumed: parsed.assumedCount,
    needs_confirm: parsed.needsConfirmCount,
    estimated: parsed.estimatedCount,
  })
  console.log(
    `PASS  ${name} → ${parsed.totalFiberG}g · ${parsed.matches.length} foods · ${parsed.reliability}` +
      (parsed.assumedCount ? ` · assumed=${parsed.assumedCount}` : '') +
      (parsed.needsConfirmCount ? ` · confirm=${parsed.needsConfirmCount}` : ''),
  )
}

let failed = 0
for (const s of STARTERS) {
  try {
    check(s.id, s.meal)
  } catch (e) {
    failed += 1
    console.error(`FAIL  ${s.id}: ${e.message || e}`)
    rows.push({ name: s.id, ok: false, error: String(e.message || e) })
  }
}
for (const [i, meal] of MORE_EXAMPLES.entries()) {
  const name = `more_example_${i + 1}`
  try {
    check(name, meal)
  } catch (e) {
    failed += 1
    console.error(`FAIL  ${name}: ${e.message || e}`)
    rows.push({ name, ok: false, error: String(e.message || e) })
  }
}

console.log(JSON.stringify({ total: rows.length, passed: rows.length - failed, failed, rows }, null, 2))
if (failed) process.exit(1)
