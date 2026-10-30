/**
 * Cloudflare Worker: static assets + meal I/O log API → R2.
 * Kill switch: MEAL_LOG_INGEST=off rejects new writes (old cached clients included).
 */
export interface Env {
  ASSETS: Fetcher
  MEAL_LOGS?: R2Bucket
  /** "on" | "off" — default on when unset */
  MEAL_LOG_INGEST?: string
  /** If set, enables GET /api/meal-logs/list with header X-Meal-Log-Admin */
  MEAL_LOG_ADMIN_KEY?: string
}

const MAX_BODY = 64 * 1024
const INPUT_CAP = 2000
const MAX_HINTS = 40
const MAX_MATCHES = 40
const MAX_RATE_PER_MIN = 60
const ALLOWED_SOURCES = new Set(['own', 'example'])
const ALLOWED_ORIGINS = new Set(['typed', 'example', 'prefill', 'starter'])
const EVENT_ID_RE = /^[a-zA-Z0-9_-]{8,80}$/
const CLIENT_ID_RE = /^[a-zA-Z0-9_-]{8,80}$/

type MatchIn = {
  food_id?: unknown
  name?: unknown
  grams?: unknown
  fiber_g?: unknown
  calories?: unknown
  source?: unknown
  tag?: unknown
  confidence?: unknown
}

type StoredLog = {
  schema_version: 1
  event_id: string
  client_id: string
  ts: string
  received_at: string
  page_path: string
  source: string
  input_origin: string
  input_text: string
  reliability: string
  empty_kind: string | null
  total_fiber_g: number
  total_calories: number
  unmatched_hints: string[]
  matches: Array<{
    food_id: string
    name: string
    grams: number
    fiber_g: number
    calories: number
    source: string
    tag: string
    confidence: string
  }>
  is_test: boolean
  utm_source?: string
  app_version?: string
}

const rateBuckets = new Map<string, { n: number; reset: number }>()

function rateLimit(ip: string): boolean {
  const now = Date.now()
  const row = rateBuckets.get(ip)
  if (!row || now > row.reset) {
    rateBuckets.set(ip, { n: 1, reset: now + 60_000 })
    return true
  }
  if (row.n >= MAX_RATE_PER_MIN) return false
  row.n += 1
  return true
}

function ingestEnabled(env: Env): boolean {
  const v = (env.MEAL_LOG_INGEST || 'on').toLowerCase()
  return v !== 'off' && v !== '0' && v !== 'false'
}

function sanitize(raw: unknown): { ok: true; value: StoredLog } | { ok: false; error: string } {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, error: 'body must be a JSON object' }
  }
  const b = raw as Record<string, unknown>
  if (b.schema_version !== 1) return { ok: false, error: 'schema_version must be 1' }
  if (typeof b.event_id !== 'string' || !EVENT_ID_RE.test(b.event_id)) {
    return { ok: false, error: 'event_id invalid' }
  }
  if (typeof b.client_id !== 'string' || !CLIENT_ID_RE.test(b.client_id)) {
    return { ok: false, error: 'client_id invalid' }
  }
  if (typeof b.ts !== 'string' || !b.ts || b.ts.length > 40) return { ok: false, error: 'ts required' }
  if (typeof b.page_path !== 'string' || b.page_path.length > 200) {
    return { ok: false, error: 'page_path invalid' }
  }
  if (typeof b.source !== 'string' || !ALLOWED_SOURCES.has(b.source)) {
    return { ok: false, error: 'source must be own|example' }
  }
  if (typeof b.input_origin !== 'string' || !ALLOWED_ORIGINS.has(b.input_origin)) {
    return { ok: false, error: 'input_origin must be typed|example|prefill|starter' }
  }
  if (typeof b.input_text !== 'string') return { ok: false, error: 'input_text required' }
  if (typeof b.reliability !== 'string' || b.reliability.length > 32) {
    return { ok: false, error: 'reliability invalid' }
  }
  if (b.empty_kind != null && typeof b.empty_kind !== 'string') {
    return { ok: false, error: 'empty_kind invalid' }
  }
  if (typeof b.total_fiber_g !== 'number' || !Number.isFinite(b.total_fiber_g)) {
    return { ok: false, error: 'total_fiber_g must be a number' }
  }
  if (typeof b.total_calories !== 'number' || !Number.isFinite(b.total_calories)) {
    return { ok: false, error: 'total_calories must be a number' }
  }
  if (!Array.isArray(b.unmatched_hints)) return { ok: false, error: 'unmatched_hints must be an array' }
  if (!Array.isArray(b.matches)) return { ok: false, error: 'matches must be an array' }
  if (typeof b.is_test !== 'boolean') return { ok: false, error: 'is_test must be boolean' }

  const hints = b.unmatched_hints
    .filter((h): h is string => typeof h === 'string')
    .slice(0, MAX_HINTS)
    .map((h) => h.slice(0, 200))

  const matches: StoredLog['matches'] = []
  for (const item of b.matches.slice(0, MAX_MATCHES) as MatchIn[]) {
    if (!item || typeof item !== 'object') return { ok: false, error: 'match entries must be objects' }
    if (typeof item.food_id !== 'string' || typeof item.name !== 'string') {
      return { ok: false, error: 'match food_id/name required' }
    }
    if (typeof item.grams !== 'number' || typeof item.fiber_g !== 'number' || typeof item.calories !== 'number') {
      return { ok: false, error: 'match numeric fields required' }
    }
    matches.push({
      food_id: item.food_id.slice(0, 128),
      name: item.name.slice(0, 256),
      grams: item.grams,
      fiber_g: item.fiber_g,
      calories: item.calories,
      source: typeof item.source === 'string' ? item.source.slice(0, 32) : 'unknown',
      tag: typeof item.tag === 'string' ? item.tag.slice(0, 32) : '',
      confidence: typeof item.confidence === 'string' ? item.confidence.slice(0, 16) : '',
    })
  }

  const received_at = new Date().toISOString()
  const value: StoredLog = {
    schema_version: 1,
    event_id: b.event_id,
    client_id: b.client_id,
    ts: b.ts,
    received_at,
    page_path: b.page_path.slice(0, 200),
    source: b.source,
    input_origin: b.input_origin,
    input_text: b.input_text.slice(0, INPUT_CAP),
    reliability: b.reliability,
    empty_kind: b.empty_kind == null ? null : String(b.empty_kind).slice(0, 64),
    total_fiber_g: b.total_fiber_g,
    total_calories: b.total_calories,
    unmatched_hints: hints,
    matches,
    is_test: b.is_test,
  }
  if (typeof b.utm_source === 'string' && b.utm_source) {
    value.utm_source = b.utm_source.slice(0, 64)
  }
  if (typeof b.app_version === 'string' && b.app_version) {
    value.app_version = b.app_version.slice(0, 32)
  }
  return { ok: true, value }
}

function receiveDay(iso: string): string {
  return iso.slice(0, 10)
}

async function handleMealLog(request: Request, env: Env): Promise<Response> {
  if (!ingestEnabled(env)) {
    return Response.json({ ok: false, error: 'ingest disabled' }, { status: 503 })
  }
  if (!env.MEAL_LOGS) {
    return Response.json({ ok: false, error: 'meal logs storage not configured' }, { status: 503 })
  }

  const ip = request.headers.get('cf-connecting-ip') || 'unknown'
  if (!rateLimit(ip)) {
    return Response.json({ ok: false, error: 'rate limited' }, { status: 429 })
  }

  const buf = await request.arrayBuffer()
  if (buf.byteLength > MAX_BODY) {
    return Response.json({ ok: false, error: 'payload too large' }, { status: 413 })
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(new TextDecoder().decode(buf))
  } catch {
    return Response.json({ ok: false, error: 'invalid JSON' }, { status: 400 })
  }

  const cleaned = sanitize(parsed)
  if (!cleaned.ok) return Response.json({ ok: false, error: cleaned.error }, { status: 400 })

  const body = cleaned.value
  const key = `meal-logs/${receiveDay(body.received_at)}/${body.event_id}.json`
  try {
    await env.MEAL_LOGS.put(key, JSON.stringify(body), {
      httpMetadata: { contentType: 'application/json' },
    })
  } catch (e) {
    console.error('[meal-log] R2 put failed', key, e)
    return Response.json({ ok: false, error: 'storage write failed' }, { status: 500 })
  }
  return new Response(null, {
    status: 204,
    headers: { 'X-Meal-Log-Key': key },
  })
}

async function handleMealLogList(request: Request, env: Env): Promise<Response> {
  const admin = (env.MEAL_LOG_ADMIN_KEY || '').trim()
  if (!admin || request.headers.get('x-meal-log-admin') !== admin) {
    return new Response('Not Found', { status: 404 })
  }
  if (!env.MEAL_LOGS) {
    return Response.json({ ok: false, error: 'meal logs storage not configured' }, { status: 503 })
  }
  const url = new URL(request.url)
  const prefix = url.searchParams.get('prefix') || 'meal-logs/'
  if (!prefix.startsWith('meal-logs/') || prefix.includes('..')) {
    return Response.json({ ok: false, error: 'prefix must start with meal-logs/' }, { status: 400 })
  }
  const keys: string[] = []
  let cursor: string | undefined
  do {
    const page = await env.MEAL_LOGS.list({ prefix, cursor, limit: 1000 })
    for (const obj of page.objects) keys.push(obj.key)
    cursor = page.truncated ? page.cursor : undefined
  } while (cursor)
  return Response.json({ ok: true, prefix, count: keys.length, keys })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    // Permanent strip of trailing slash so /slug/ and /slug share one URL with canonicals
    // (Assets html_handling=drop-trailing-slash alone uses 307, which GSC treats as soft).
    if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
      url.pathname = url.pathname.replace(/\/+$/, '') || '/'
      return Response.redirect(url.toString(), 301)
    }
    if (url.pathname === '/api/meal-logs/health' && request.method === 'GET') {
      return Response.json({
        ok: true,
        r2_bound: Boolean(env.MEAL_LOGS),
        ingest_enabled: ingestEnabled(env),
        note: 'r2_bound does not prove writes succeed — verify with a real POST + object get',
      })
    }
    if (url.pathname === '/api/meal-logs/list' && request.method === 'GET') {
      return handleMealLogList(request, env)
    }
    if (url.pathname === '/api/meal-logs' && request.method === 'POST') {
      return handleMealLog(request, env)
    }
    return env.ASSETS.fetch(request)
  },
}
