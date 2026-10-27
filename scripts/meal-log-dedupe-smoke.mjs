/**
 * Unit smoke for client meal-log dedupe (prefill burst protection).
 */
import assert from 'node:assert/strict'
import {
  MEAL_LOG_DEDUPE_WINDOW_MS,
  claimMealLogSend,
  resetMealLogDedupe,
} from '../src/lib/mealLog.ts'

function payload(overrides = {}) {
  return {
    schema_version: 1,
    event_id: 'evt_' + Math.random().toString(36).slice(2),
    client_id: 'client-dedupe-01',
    ts: new Date().toISOString(),
    page_path: '/how-much-fiber-per-day',
    source: 'own',
    input_origin: 'prefill',
    input_text: 'I ate 2 eggs, 1 bowl of oatmeal, and an apple',
    reliability: 'assumed',
    empty_kind: null,
    total_fiber_g: 8.4,
    total_calories: 416,
    unmatched_hints: [],
    matches: [{ food_id: 'x', name: 'Apple' }],
    is_test: false,
    ...overrides,
  }
}

resetMealLogDedupe()
const t0 = 1_000_000
assert.equal(claimMealLogSend(payload(), t0), true, 'first send allowed')
assert.equal(claimMealLogSend(payload(), t0 + 2_000), false, '2s duplicate blocked')
assert.equal(claimMealLogSend(payload(), t0 + 5_000), false, '5s duplicate blocked')
assert.equal(
  claimMealLogSend(payload(), t0 + MEAL_LOG_DEDUPE_WINDOW_MS),
  true,
  'after window allowed',
)
assert.equal(
  claimMealLogSend(payload({ input_text: '1 apple' }), t0 + MEAL_LOG_DEDUPE_WINDOW_MS + 1),
  true,
  'changed text allowed',
)

console.log('meal-log dedupe smoke OK')
