/**
 * Fiber accuracy regression — 100 common inputs with reference answers.
 *
 * Reference = USDA FoodData Central (SR Legacy) fiber per 100 g × USDA household
 * weight, or the Nutrition Facts label for packaged products (see
 * src/data/curatedFoods.ts). Mixed dishes with no single answer use a range.
 *
 * Pass rule: within ±20% of the reference (or ±0.3 g for small values).
 * Metric printed: share of cases within ±20%. CI requires 100%.
 *
 * Usage: node --import tsx scripts/fiber-accuracy-regression.mjs
 */
import { parseMeal, fiberTarget, standardFiberAi, calorieFiberTarget } from '../src/lib/parseMeal.ts'

/** [input, expected grams] or [input, [min, max]] */
const CASES = [
  // — Grains & cereals —
  ['1 cup oats', 8.5],
  ['1/2 cup oats', 4.2],
  ['1 cup rolled oats', 8.5],
  ['1 cup cooked oatmeal', 4.0],
  ['oatmeal', 4.0],
  ['1 packet instant oatmeal', 2.8],
  ['1 cup brown rice', 3.2],
  ['1 cup white rice', 0.6],
  ['1 cup quinoa', 5.2],
  ['1 cup cooked barley', 6.0],
  ['1 cup bulgur', 8.2],
  ['1 cup couscous', 2.2],
  ['1 cup spaghetti', 2.5],
  ['1 cup cooked whole wheat pasta', 5.5],
  ['3 cups popcorn', 3.6],
  ['2 slices whole wheat bread', 3.8],
  ['1 slice white bread', 0.8],
  ['1 slice sourdough', 1.2],
  ['1 whole wheat pita', 3.9],
  ['1 corn tortilla', 1.6],
  ['1 flour tortilla', [0.8, 2.2]],
  ['1 bagel', 2.4],
  // — Packaged cereals, bars, supplements (label values) —
  ['1 cup cheerios', 2.8],
  ['1 cup bran flakes', 7.3],
  ['1 cup raisin bran', 7.0],
  ['1/2 cup all bran', 10.0],
  ['2/3 cup fiber one cereal', 18.0],
  ['1/2 cup grape nuts', 7.5],
  ['2 shredded wheat biscuits', 5.8],
  ['1/2 cup granola', 3.3],
  ['fiber one bar', 9.0],
  ['1 quest bar', 14.0],
  ['1 clif bar', 4.0],
  ['1 kind bar', 7.0],
  ['1 rxbar', 5.0],
  ['a protein bar', [2, 8]],
  ['1 scoop protein powder', [0, 1]],
  ['metamucil', 3.0],
  ['2 tsp benefiber', 3.0],
  ['1 slice daves killer bread', 5.0],
  ['1 slice ezekiel bread', 3.0],
  ['6 triscuits', 3.0],
  // — Legumes —
  ['1 cup black beans', 15.0],
  ['1 can black beans', 21.0],
  ['1/2 cup chickpeas', 6.2],
  ['1 cup lentils', 15.6],
  ['100g lentils', 7.9],
  ['1 cup kidney beans', 11.3],
  ['1 cup pinto beans', 15.4],
  ['1 cup split peas', 16.3],
  ['1/2 cup refried beans', 4.4],
  ['1 cup edamame', 8.1],
  ['1 cup green peas', 8.8],
  ['1/2 cup hummus', 6.8],
  ['1 cup lentil soup', 5.9],
  // — Vegetables —
  ['1 cup broccoli', 5.1],
  ['1 cup cooked broccoli', 5.1],
  ['200g broccoli', 6.6],
  ['1 cup brussels sprouts', 4.1],
  ['1 cup carrots', 3.6],
  ['1 cup cooked carrots', 4.7],
  ['1 cup spinach', 0.7],
  ['1 cup cooked spinach', 4.3],
  ['1 cup kale', 0.9],
  ['2 cups salad greens', 1.3],
  ['1 cup green beans', 4.0],
  ['1 cup cauliflower rice', 2.1],
  ['1 cup mixed vegetables', 8.0],
  ['1 cup butternut squash', 6.6],
  ['1 cup corn', 4.4],
  ['1 artichoke', 6.9],
  ['1 baked potato', 3.8],
  ['1 medium sweet potato', 3.8],
  ['1 cup canned pumpkin', 7.1],
  // — Fruit —
  ['1 apple', 4.4],
  ['1 banana', 3.1],
  ['1 pear', 5.5],
  ['1 orange', 3.1],
  ['1 avocado', 10.1],
  ['half an avocado', 5.0],
  ['1 kiwi', 2.1],
  ['3 kiwis', 6.2],
  ['1 mango', 5.4],
  ['1 peach', 2.3],
  ['1 cup grapes', 1.4],
  ['1 cup raspberries', 8.0],
  ['1 cup blackberries', 7.6],
  ['1 cup blueberries', 3.6],
  ['1 cup strawberries', 2.9],
  ['2 dates', 3.2],
  ['5 prunes', 3.4],
  ['1/4 cup dried apricots', 2.4],
  // — Nuts & seeds —
  ['1 oz almonds', 3.5],
  ['a handful of almonds', 3.5],
  // Long-tail page inputs (2026-11-25): tbsp of bran/walnuts used to fall back to a full cup
  ['2 tbsp wheat bran', 3.1],
  ['2 tbsp walnuts', 1.0],
  ['1 oz dark chocolate', 3.1],
  ['1 oz walnuts', 1.9],
  ['chia', 4.1],
  ['2 tbsp chia seeds', 8.3],
  ['1 tbsp ground flaxseed', 1.9],
  ['1 tbsp psyllium husk', 7.0],
  ['2 tbsp peanut butter', 1.6],
  // — Meals and mixed sentences —
  ['1 burrito', [4, 10]],
  ['1 bowl of ramen', [1.5, 4]],
  ['chicken breast and rice', [0.3, 1.2]],
  ['2 eggs and toast', [0.5, 2.5]],
  ['oatmeal with chia and berries', 11.1],
  [
    'I had oatmeal with chia and berries for breakfast, lentil soup for lunch, and salmon with broccoli for dinner',
    22.1,
  ],
]

function within(got, expected) {
  if (Array.isArray(expected)) return got >= expected[0] && got <= expected[1]
  return Math.abs(got - expected) <= Math.max(0.2 * expected, 0.3)
}

let pass = 0
const failures = []
for (const [input, expected] of CASES) {
  const r = parseMeal(input)
  const got = r.totalFiberG
  const fakeGrams = r.matches.some((m) => m.source === 'estimate' && /\b100g\b/.test(m.unitLabel))
  const ok = within(got, expected) && !fakeGrams
  if (ok) pass += 1
  else failures.push({ input, expected, got, lines: r.matches.map((m) => `${m.food.name} ${m.grams}g ${m.fiberG}g`) })
}

// — Daily targets (IOM Adequate Intake) —
const TARGETS = [
  [standardFiberAi('female', '19-50'), 25],
  [standardFiberAi('male', '19-50'), 38],
  [standardFiberAi('female', '51+'), 21],
  [standardFiberAi('male', '51+'), 30],
  [standardFiberAi('female', '14-18'), 26],
  [standardFiberAi('male', '14-18'), 38],
  [standardFiberAi('female', '19-50', 'pregnant'), 28],
  [standardFiberAi('female', '14-18', 'lactating'), 29],
  [calorieFiberTarget(2000), 28],
  [calorieFiberTarget(2500), 35],
  [calorieFiberTarget(100), null],
  [fiberTarget('female', '19-50', 'calories', { kcal: 1800 }), 25],
  [fiberTarget('female', '19-50', 'calories', { kcal: Number.NaN }), 25],
  [fiberTarget('male', '19-50', 'maxxing'), 50],
]
const targetFailures = TARGETS.map(([got, want], i) => ({ i, got, want })).filter((t) => t.got !== t.want)

for (const f of failures) console.log('FAIL', JSON.stringify(f))
for (const t of targetFailures) console.log('FAIL target', JSON.stringify(t))
const share = Math.round((pass / CASES.length) * 1000) / 10
console.log(`Fiber accuracy: ${pass}/${CASES.length} within ±20% (${share}%) · targets ${TARGETS.length - targetFailures.length}/${TARGETS.length}`)
if (CASES.length < 100) {
  console.log(`Expected at least 100 cases, found ${CASES.length}`)
  process.exit(1)
}
if (failures.length || targetFailures.length) process.exit(1)
