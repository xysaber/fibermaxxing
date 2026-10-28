import type { ParseResult } from './parseMeal'

const INPUT_CAP = 2000
const CLIENT_KEY = 'fibermax_client_id'
const TEST_FLAG_KEY = 'fibermax_is_test'

export type MealLogSource = 'own' | 'example'
export type MealLogInputOrigin = 'typed' | 'example' | 'prefill' | 'starter'

export type MealLogMatch = {
  food_id: string
  name: string
  grams: number
  fiber_g: number
  calories: number
  source: 'database' | 'estimate'
  tag: string
  confidence: string
}

/** Shared contract with local server and CF Worker. */
export type MealLogPayload = {
  schema_version: 1
  event_id: string
  client_id: string
  ts: string
  page_path: string
  source: MealLogSource
  input_origin: MealLogInputOrigin
  input_text: string
  reliability: string
  empty_kind: string | null
  total_fiber_g: number
  total_calories: number
  unmatched_hints: string[]
  matches: MealLogMatch[]
  /** Known self-QA traffic (utm_source=self or sticky localStorage). Not a guarantee of “human”. */
  is_test: boolean
  utm_source?: string
  app_version?: string
}

function uuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

function getClientId(): string {
  try {
    const existing = localStorage.getItem(CLIENT_KEY)
    if (existing) return existing
    const id = uuid()
    localStorage.setItem(CLIENT_KEY, id)
    return id
  } catch {
    return uuid()
  }
}

/**
 * Sticky QA flag: `?utm_source=self` (or `meal_log_test=1`) sets it;
 * `?clear_meal_log_test=1` clears it. Survives navigations until cleared / new profile.
 */
export function syncMealLogTestFlagFromUrl(search = typeof window !== 'undefined' ? window.location.search : ''): boolean {
  try {
    const q = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
    if (q.get('clear_meal_log_test') === '1') {
      localStorage.removeItem(TEST_FLAG_KEY)
      return false
    }
    const utm = (q.get('utm_source') || '').toLowerCase()
    if (utm === 'self' || q.get('meal_log_test') === '1') {
      localStorage.setItem(TEST_FLAG_KEY, '1')
      return true
    }
    return localStorage.getItem(TEST_FLAG_KEY) === '1'
  } catch {
    return false
  }
}

export function isMealLogTestSession(): boolean {
  return syncMealLogTestFlagFromUrl()
}

export function clearMealLogTestFlag(): void {
  try {
    localStorage.removeItem(TEST_FLAG_KEY)
  } catch {
    /* ignore */
  }
}

export function mealLogsEnabled(): boolean {
  return import.meta.env.VITE_MEAL_LOG_ENABLED === 'true'
}

export function buildMealLogPayload(opts: {
  inputText: string
  parsed: ParseResult
  source: MealLogSource
  inputOrigin: MealLogInputOrigin
  pagePath?: string
}): MealLogPayload {
  const input = opts.inputText.length > INPUT_CAP ? opts.inputText.slice(0, INPUT_CAP) : opts.inputText
  const isTest = syncMealLogTestFlagFromUrl()
  let utmSource: string | undefined
  try {
    const u = (new URLSearchParams(window.location.search).get('utm_source') || '').trim()
    if (u) utmSource = u.slice(0, 64)
  } catch {
    /* ignore */
  }

  return {
    schema_version: 1,
    event_id: uuid(),
    client_id: getClientId(),
    ts: new Date().toISOString(),
    page_path: opts.pagePath ?? (typeof window !== 'undefined' ? window.location.pathname : '/'),
    source: opts.source,
    input_origin: opts.inputOrigin,
    input_text: input,
    reliability: opts.parsed.reliability,
    empty_kind: opts.parsed.emptyKind,
    total_fiber_g: opts.parsed.totalFiberG,
    total_calories: opts.parsed.totalCalories,
    unmatched_hints: opts.parsed.unmatchedHints.slice(0, 40),
    matches: opts.parsed.matches.slice(0, 40).map((m) => ({
      food_id: m.food.id.slice(0, 128),
      name: m.food.name.slice(0, 256),
      grams: m.grams,
      fiber_g: m.fiberG,
      calories: m.calories,
      source: m.source,
      tag: m.tag,
      confidence: m.confidence,
    })),
    is_test: isTest,
    utm_source: utmSource,
    app_version: import.meta.env.VITE_APP_VERSION || undefined,
  }
}

/** Collapse rapid re-posts of the same meal (e.g. guide-page prefill spam-click). */
export const MEAL_LOG_DEDUPE_WINDOW_MS = 30_000
let lastDedupeKey = ''
let lastDedupeAt = 0

/** @internal test helper */
export function resetMealLogDedupe(): void {
  lastDedupeKey = ''
  lastDedupeAt = 0
}

export function mealLogDedupeKey(payload: Pick<
  MealLogPayload,
  'client_id' | 'source' | 'input_origin' | 'input_text' | 'reliability' | 'total_fiber_g' | 'matches'
>): string {
  return [
    payload.client_id,
    payload.source,
    payload.input_origin,
    payload.input_text,
    payload.reliability,
    String(payload.total_fiber_g),
    String(payload.matches.length),
  ].join('\0')
}

/**
 * Returns true when this payload should not be sent (same meal just logged).
 * Mutates module dedupe state when returning false (caller will send).
 */
export function claimMealLogSend(payload: MealLogPayload, now = Date.now()): boolean {
  const key = mealLogDedupeKey(payload)
  if (key === lastDedupeKey && now - lastDedupeAt < MEAL_LOG_DEDUPE_WINDOW_MS) {
    return false
  }
  lastDedupeKey = key
  lastDedupeAt = now
  return true
}

/**
 * Fire-and-forget. Never throws into the calculator path.
 * Does not send meal text to GA — separate from track().
 * Skips if the same client just logged an identical meal within {@link MEAL_LOG_DEDUPE_WINDOW_MS}.
 */
export function postMealLog(payload: MealLogPayload): void {
  if (!mealLogsEnabled()) return
  try {
    if (!claimMealLogSend(payload)) return
    const body = JSON.stringify(payload)
    void fetch('/api/meal-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {
      /* silent */
    })
  } catch {
    /* silent */
  }
}
