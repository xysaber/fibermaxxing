/**
 * Local meal I/O log receiver for development.
 * Aligns with Worker contract (whitelist, caps, is_test, received_at).
 *
 * Run: npm run meal-log:dev
 */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const LOG_DIR = path.join(ROOT, 'data', 'meal-logs')
const PORT = Number(process.env.MEAL_LOG_PORT || 8788)
const MAX_BODY = 64 * 1024
const INPUT_CAP = 2000
const ALLOWED_SOURCES = new Set(['own', 'example'])
const ALLOWED_ORIGINS = new Set(['typed', 'example', 'prefill'])
const EVENT_ID_RE = /^[a-zA-Z0-9_-]{8,80}$/
const CLIENT_ID_RE = /^[a-zA-Z0-9_-]{8,80}$/
const INGEST = (process.env.MEAL_LOG_INGEST || 'on').toLowerCase()

function todayStamp(d = new Date()) {
  return d.toISOString().slice(0, 10)
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > limit) {
        reject(Object.assign(new Error('payload too large'), { status: 413 }))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function sanitize(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { error: 'body must be a JSON object' }
  }
  if (raw.schema_version !== 1) return { error: 'schema_version must be 1' }
  if (typeof raw.event_id !== 'string' || !EVENT_ID_RE.test(raw.event_id)) {
    return { error: 'event_id invalid' }
  }
  if (typeof raw.client_id !== 'string' || !CLIENT_ID_RE.test(raw.client_id)) {
    return { error: 'client_id invalid' }
  }
  if (typeof raw.ts !== 'string' || !raw.ts) return { error: 'ts required' }
  if (typeof raw.page_path !== 'string') return { error: 'page_path required' }
  if (!ALLOWED_SOURCES.has(raw.source)) return { error: 'source must be own|example' }
  if (!ALLOWED_ORIGINS.has(raw.input_origin)) return { error: 'input_origin must be typed|example|prefill' }
  if (typeof raw.input_text !== 'string') return { error: 'input_text required' }
  if (typeof raw.reliability !== 'string') return { error: 'reliability required' }
  if (raw.empty_kind != null && typeof raw.empty_kind !== 'string') return { error: 'empty_kind invalid' }
  if (typeof raw.total_fiber_g !== 'number' || !Number.isFinite(raw.total_fiber_g)) {
    return { error: 'total_fiber_g must be a number' }
  }
  if (typeof raw.total_calories !== 'number' || !Number.isFinite(raw.total_calories)) {
    return { error: 'total_calories must be a number' }
  }
  if (!Array.isArray(raw.unmatched_hints)) return { error: 'unmatched_hints must be an array' }
  if (!Array.isArray(raw.matches)) return { error: 'matches must be an array' }
  if (typeof raw.is_test !== 'boolean') return { error: 'is_test must be boolean' }

  const received_at = new Date().toISOString()
  const matches = []
  for (const m of raw.matches.slice(0, 40)) {
    if (!m || typeof m !== 'object') return { error: 'match entries must be objects' }
    if (typeof m.food_id !== 'string' || typeof m.name !== 'string') {
      return { error: 'match food_id/name required' }
    }
    matches.push({
      food_id: m.food_id.slice(0, 128),
      name: m.name.slice(0, 256),
      grams: m.grams,
      fiber_g: m.fiber_g,
      calories: m.calories,
      source: typeof m.source === 'string' ? m.source : 'unknown',
      tag: typeof m.tag === 'string' ? m.tag : '',
      confidence: typeof m.confidence === 'string' ? m.confidence : '',
    })
  }

  return {
    value: {
      schema_version: 1,
      event_id: raw.event_id,
      client_id: raw.client_id,
      ts: raw.ts,
      received_at,
      page_path: String(raw.page_path).slice(0, 200),
      source: raw.source,
      input_origin: raw.input_origin,
      input_text: raw.input_text.slice(0, INPUT_CAP),
      reliability: raw.reliability,
      empty_kind: raw.empty_kind ?? null,
      total_fiber_g: raw.total_fiber_g,
      total_calories: raw.total_calories,
      unmatched_hints: raw.unmatched_hints.filter((h) => typeof h === 'string').slice(0, 40),
      matches,
      is_test: raw.is_test,
      utm_source: typeof raw.utm_source === 'string' ? raw.utm_source.slice(0, 64) : undefined,
      app_version: typeof raw.app_version === 'string' ? raw.app_version.slice(0, 32) : undefined,
    },
  }
}

function send(res, status, body, extraHeaders = {}) {
  const payload = typeof body === 'string' ? body : JSON.stringify(body)
  res.writeHead(status, {
    'Content-Type': status === 204 ? 'text/plain' : 'application/json',
    'Cache-Control': 'no-store',
    ...extraHeaders,
  })
  res.end(payload)
}

fs.mkdirSync(LOG_DIR, { recursive: true })

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://127.0.0.1:${PORT}`)

  if (req.method === 'GET' && url.pathname === '/api/meal-logs/health') {
    send(res, 200, {
      ok: true,
      dir: LOG_DIR,
      ingest_enabled: INGEST !== 'off' && INGEST !== '0' && INGEST !== 'false',
      note: 'local JSONL — write proof is the file, not this health flag',
    })
    return
  }

  if (req.method === 'POST' && url.pathname === '/api/meal-logs') {
    try {
      if (INGEST === 'off' || INGEST === '0' || INGEST === 'false') {
        send(res, 503, { ok: false, error: 'ingest disabled' })
        return
      }
      const text = await readBody(req, MAX_BODY)
      let parsed
      try {
        parsed = JSON.parse(text || '{}')
      } catch {
        send(res, 400, { ok: false, error: 'invalid JSON' })
        return
      }
      const cleaned = sanitize(parsed)
      if (cleaned.error) {
        send(res, 400, { ok: false, error: cleaned.error })
        return
      }
      const file = path.join(LOG_DIR, `${todayStamp()}.jsonl`)
      fs.appendFileSync(file, `${JSON.stringify(cleaned.value)}\n`, 'utf8')
      send(res, 204, '', { 'X-Meal-Log-File': file })
    } catch (e) {
      const status = e?.status || 500
      send(res, status, { ok: false, error: e?.message || 'server error' })
    }
    return
  }

  send(res, 404, { ok: false, error: 'not found' })
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[meal-log] listening on http://127.0.0.1:${PORT}`)
  console.log(`[meal-log] writing to ${LOG_DIR}`)
})
