/**
 * Semantic / metamorphic checks for resolveMeal + parseMeal (PRD-aligned).
 * Usage: node --import tsx scripts/semantic-regression.mjs
 */
import assert from 'node:assert/strict'
import { parseMeal as parsePublicMeal, updateMatchGrams, updateMatchServings } from '../src/lib/parseMeal.ts'
import { resolveMeal } from '../src/lib/resolveMeal.ts'

function parseMeal(input) {
  return { ...parsePublicMeal(input), issues: resolveMeal(input).issues }
}

let checks = 0
function check(input, verify) {
  const r = parseMeal(input)
  verify(r)
  checks++
}

// Multi-mention: recipe estimate + chicken + tomatoes (no silent drops)
check('1 milktea and grilled chicken with 2 tomatos', (r) => {
  assert.equal(r.matches.length, 3)
  assert(r.matches.some((m) => /tomato/i.test(m.food.name) && m.grams === 246))
  assert(r.matches.some((m) => /chicken/i.test(m.food.name) && !/meatless|fried/i.test(m.food.name)))
  assert(r.matches.some((m) => m.source === 'estimate' && /milk\s*tea/i.test(m.matchedAlias + m.food.name)))
})

// Chicken identity: bare / grilled ≠ meatless; fried only when said
check('chicken', (r) => {
  assert.equal(r.matches.length, 1)
  assert(!/meatless|fried|breaded/i.test(r.matches[0].food.name))
})
check('grilled chicken', (r) => {
  assert.equal(r.matches.length, 1)
  assert(!/meatless|fried|breaded/i.test(r.matches[0].food.name))
})
check('fried chicken', (r) => {
  assert.equal(r.matches.length, 1)
  assert.match(r.matches[0].food.name, /fried/i)
  assert(!/meatless/i.test(r.matches[0].food.name))
})
check('100g meatless chicken', (r) => {
  assert(r.matches.every((m) => /meatless/i.test(m.food.name)) || r.matches.length === 0 || r.issues.length > 0)
  assert(r.matches.every((m) => !/^Chicken, roasting/i.test(m.food.name)))
})

// Recipes → estimate lines (not empty / not_food)
for (const recipe of ['milk tea', 'milktea', 'bubble tea', 'smoothie', 'chia pudding', 'salad', 'pizza', 'curry', 'sandwich', 'burger']) {
  check(`1 ${recipe}`, (r) => {
    assert.equal(r.matches.length, 1, recipe)
    assert.equal(r.matches[0].source, 'estimate')
  })
}

// Greek yogurt without fat level → still a row (needs confirm), not empty
check('greek yogurt', (r) => {
  assert.equal(r.matches.length, 1)
  assert.match(r.matches[0].food.name, /Greek/i)
})

// Spelling / plural identity
for (const [name, expected] of [
  ['tomato', /Tomatoes/],
  ['tomatos', /Tomatoes/],
  ['tomatoes', /Tomatoes/],
  ['orange', /Oranges/],
  ['oranges', /Oranges/],
]) {
  check(`100g ${name}`, (r) => {
    assert.equal(r.issues.length, 0)
    assert.match(r.matches[0].food.name, expected)
    assert.equal(r.matches[0].grams, 100)
  })
}

// Order / phrasing invariance
for (const [a, b] of [
  ['170g nonfat plain Greek yogurt', '170g plain nonfat Greek yogurt'],
  ['1/2 apple', 'half an apple'],
  ['1 cup cooked oatmeal', '1 cup oatmeal cooked'],
  ['100g apple', 'apple 100g'],
]) {
  check(a, (r) => {
    const s = parseMeal(b)
    assert.equal(r.matches[0]?.food.id, s.matches[0]?.food.id)
    assert.equal(r.totalFiberG, s.totalFiberG)
  })
}

// Weight linearity for curated staples
for (const food of [
  'apple',
  'orange',
  'banana',
  'tomato',
  'chia seeds',
  'cooked lentils',
  'plain nonfat Greek yogurt',
  'avocado',
  'blueberries',
  'raspberries',
  'black beans',
  'spinach',
]) {
  for (const weight of [50, 100, 250]) {
    check(`${weight}g ${food}`, (r) => {
      assert.equal(r.matches.length, 1, food)
      assert.equal(r.matches[0].grams, weight)
      assert(Math.abs(r.totalFiberG - (r.matches[0].food.fiber100g * weight) / 100) <= 0.05001)
    })
  }
}

// Separators / commutativity
for (const [a, b] of [
  ['100g apple', '50g tomato'],
  ['200g cooked lentils', '10g chia seeds'],
  ['100g orange', '170g plain nonfat Greek yogurt'],
]) {
  for (const sep of [', ', ' and ', ' with ', '; ', '\n']) {
    check(a + sep + b, (r) => {
      const reversed = parseMeal(b + sep + a)
      assert.equal(r.matches.length, 2)
      assert.equal(r.totalFiberG, reversed.totalFiberG)
      assert.equal(
        r.totalFiberG,
        Math.round((parseMeal(a).totalFiberG + parseMeal(b).totalFiberG) * 10) / 10,
      )
    })
  }
}

// True non-food / prep-only (not edible lines)
for (const text of ['medium plain nonfat', 'qwertyzz']) {
  check(text, (r) => {
    assert.equal(r.matches.length, 0, text)
    assert.equal(r.emptyKind, 'not_food')
  })
}
// Invalid numeric portions must not invent a precise database line
for (const text of ['1/0 apple', '-100g apple']) {
  check(text, (r) => {
    assert(r.matches.every((m) => m.source !== 'database') || r.matches.length === 0, text)
  })
}

// Negation must not add avocado
for (const text of ['no apple', 'without 100g apple', '100g orange without apple', 'salad without avocado']) {
  check(text, (r) => assert(r.matches.every((m) => !/Apple|Avocado/i.test(m.food.name))))
}

check('100g apple and qwertyzz', (r) => {
  assert.equal(r.totalFiberG, 2.4)
  assert(r.unmatchedHints.some((h) => /qwertyzz/i.test(h)) || r.issues.some((i) => /qwertyzz/i.test(i.text)))
})

check('apple', (r) => {
  assert.equal(r.matches[0].confidence, 'medium')
  assert(resolveMeal('apple').resolved[0].assumed)
  const fixed = updateMatchGrams(r.matches[0], 200)
  assert.equal(fixed.grams, 200)
  assert.equal(fixed.fiberG, 4.8)
  assert.equal(updateMatchServings(fixed, 2).confidence, 'medium')
})

// Spelling suggestion still surfaces candidates when unresolved as precise typo path
check('applf', (r) => {
  // May be estimate via lexicon miss, or issue with candidates — must not be silent not_food without hint
  assert(r.matches.length + r.issues.length + r.unmatchedHints.length > 0)
})

// Eggs + heat methods keep identity
for (const method of ['grilled', 'roasted', 'baked', 'boiled', 'steamed', 'cooked', 'poached', 'fried']) {
  for (const qty of [1, 2, 3]) {
    check(`${qty} ${method} eggs`, (r) => {
      assert.equal(r.matches.length, 1, `${method} eggs`)
      assert.match(r.matches[0].food.name, /^Egg/)
      assert.equal(r.matches[0].qty, qty)
    })
  }
}

check('2 grilled eggs with 2 tomatos', (r) => {
  assert.equal(r.matches.length, 2)
  assert.equal(r.matches.find((m) => /^Egg/.test(m.food.name)).qty, 2)
  assert.equal(r.matches.find((m) => /^Tomatoes/.test(m.food.name)).grams, 246)
})

// Count × default cup for milk
check('2 eggs with 1 bread and 1 milk', (r) => {
  assert.equal(r.matches.length, 3)
  assert(r.matches.some((m) => /^Egg/.test(m.food.name)))
  assert(r.matches.some((m) => /^Bread/.test(m.food.name)))
  assert(r.matches.some((m) => /^Milk/.test(m.food.name) && m.grams === 244))
})

// Consumable lexicon: latte is food (estimate), not not_food
check('latte', (r) => {
  assert.equal(r.matches.length, 1)
  assert.equal(r.matches[0].source, 'estimate')
  assert.equal(r.emptyKind, null)
})

console.log(`${checks} semantic and metamorphic cases passed`)
