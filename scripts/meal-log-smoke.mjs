/**
 * Smoke-test local meal-log server without the browser.
 * Starts the server, POSTs sample payloads, checks JSONL, then exits.
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const port = 8799
const logDir = path.join(root, 'data', 'meal-logs')
const today = new Date().toISOString().slice(0, 10)
const logFile = path.join(logDir, `${today}.jsonl`)

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function sample(overrides = {}) {
  return {
    schema_version: 1,
    event_id: `smoke_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    client_id: 'smoke-client',
    ts: new Date().toISOString(),
    page_path: '/',
    source: 'own',
    input_origin: 'typed',
    input_text: '1 apple',
    reliability: 'reliable',
    empty_kind: null,
    total_fiber_g: 4.4,
    total_calories: 95,
    unmatched_hints: [],
    matches: [
      {
        food_id: 'curated:apple',
        name: 'Apple, raw',
        grams: 182,
        fiber_g: 4.4,
        calories: 95,
        source: 'database',
        tag: 'database',
        confidence: 'high',
      },
    ],
    is_test: false,
    ...overrides,
  }
}

async function main() {
  fs.mkdirSync(logDir, { recursive: true })
  const before = fs.existsSync(logFile) ? fs.readFileSync(logFile, 'utf8') : ''

  const child = spawn(process.execPath, [path.join(root, 'scripts/meal-log-local-server.mjs')], {
    env: { ...process.env, MEAL_LOG_PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  let ready = false
  for (let i = 0; i < 40; i++) {
    try {
      const h = await fetch(`http://127.0.0.1:${port}/api/meal-logs/health`)
      if (h.ok) {
        ready = true
        break
      }
    } catch {
      /* wait */
    }
    await sleep(50)
  }
  if (!ready) {
    child.kill()
    throw new Error('meal-log server did not become ready')
  }

  const bodies = [
    sample({ input_text: '1 apple', source: 'own' }),
    sample({
      event_id: `smoke_ex_${Date.now()}`,
      input_text: 'I ate 2 eggs, 1 bowl of oatmeal, and an apple',
      source: 'example',
      input_origin: 'example',
    }),
    sample({
      event_id: `smoke_empty_${Date.now()}`,
      input_text: 'asdfqwer123',
      reliability: 'empty',
      empty_kind: 'not_food',
      total_fiber_g: 0,
      total_calories: 0,
      matches: [],
    }),
    sample({
      event_id: `smoke_qa_${Date.now()}`,
      input_text: 'qa probe',
      is_test: true,
    }),
  ]

  for (const body of bodies) {
    const res = await fetch(`http://127.0.0.1:${port}/api/meal-logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.status !== 204) {
      child.kill()
      throw new Error(`expected 204, got ${res.status} ${await res.text()}`)
    }
  }

  const bad = await fetch(`http://127.0.0.1:${port}/api/meal-logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ schema_version: 1 }),
  })
  if (bad.status !== 400) {
    child.kill()
    throw new Error(`expected 400 for invalid body, got ${bad.status}`)
  }

  child.kill()
  await sleep(100)

  const after = fs.readFileSync(logFile, 'utf8')
  const added = after.slice(before.length).trim().split('\n').filter(Boolean)
  if (added.length < 4) throw new Error(`expected ≥4 new JSONL lines, got ${added.length}`)

  const rows = added.map((l) => JSON.parse(l))
  if (!rows.some((r) => r.input_text === '1 apple' && r.matches?.[0]?.food_id === 'curated:apple')) {
    throw new Error('missing own apple row with match')
  }
  if (!rows.some((r) => r.source === 'example')) throw new Error('missing example row')
  if (!rows.some((r) => r.matches?.length === 0 && r.empty_kind === 'not_food')) {
    throw new Error('missing empty/not_food row')
  }
  if (!rows.some((r) => r.is_test === true)) throw new Error('missing is_test=true row')
  if (!rows.every((r) => typeof r.is_test === 'boolean' && typeof r.received_at === 'string')) {
    throw new Error('expected is_test + received_at on stored rows')
  }

  console.log('meal-log smoke OK', { file: logFile, newLines: added.length })
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
