/**
 * Smoke test for /api/subscribe, /api/unsubscribe and the daily drip.
 * Uses an in-memory R2 stand-in and a stubbed Resend API (no network).
 * Usage: node --import tsx scripts/subscribe-smoke.mjs
 */
import assert from 'node:assert/strict'
import worker from '../worker/index.ts'
import { nextDueAt } from '../worker/subscribe.ts'

const store = new Map()
const bucket = {
  async get(k) {
    if (!store.has(k)) return null
    const v = store.get(k)
    return { json: async () => JSON.parse(v) }
  },
  async put(k, v) {
    store.set(k, v)
  },
  async list({ prefix }) {
    return { objects: [...store.keys()].filter((k) => k.startsWith(prefix)).map((key) => ({ key })), truncated: false }
  },
}
const sent = []
globalThis.fetch = async (url, init) => {
  if (String(url) === 'https://api.resend.com/emails') {
    sent.push(JSON.parse(init.body))
    return new Response(JSON.stringify({ id: 'x' }), { status: 200 })
  }
  throw new Error('unexpected fetch ' + url)
}
const env = { MEAL_LOGS: bucket, RESEND_API_KEY: 're_test', ASSETS: { fetch: async () => new Response('asset') } }
const post = (body) =>
  worker.fetch(
    new Request('https://www.getfibermaxxing.com/api/subscribe', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
    env,
  )

// Disabled without API key
let r = await worker.fetch(new Request('https://x/api/subscribe', { method: 'POST', body: '{}' }), { ...env, RESEND_API_KEY: '' })
assert.equal(r.status, 503)

// Invalid email
r = await post({ email: 'nope' })
assert.equal(r.status, 400)

// Honeypot: ok but nothing sent
r = await post({ email: 'bot@example.com', company: 'Acme' })
assert.equal(r.status, 200)
assert.equal(sent.length, 0)

// Real signup → Day 1
r = await post({ email: 'Reader@Example.com', source: 'result', target_g: 25, gap_g: 16.6 })
assert.equal(r.status, 200)
assert.equal(sent.length, 1)
assert.match(sent[0].subject, /^Day 1/)
assert.deepEqual(sent[0].to, ['reader@example.com'])
assert.ok(sent[0].headers['List-Unsubscribe'])

// Duplicate → no second Day 1
r = await post({ email: 'reader@example.com' })
assert.equal((await r.json()).already, true)
assert.equal(sent.length, 1)

// Drip: too soon → nothing
await worker.scheduled({}, env, { waitUntil: (p) => p })
await new Promise((res) => setTimeout(res, 10))
assert.equal(sent.length, 1)

// Age the record and run 6 times → Days 2–7, then stop
const key = [...store.keys()][0]
for (let day = 2; day <= 8; day++) {
  const s = JSON.parse(store.get(key))
  s.last_sent_at = new Date(Date.now() - 48 * 3600 * 1000).toISOString()
  store.set(key, JSON.stringify(s))
  let p
  await worker.scheduled({}, env, { waitUntil: (x) => (p = x) })
  await p
}
assert.equal(sent.length, 7)
assert.match(sent[6].subject, /^Day 7/)

// Unsubscribe with a bad token fails, good token works
const sub = JSON.parse(store.get(key))
const id = key.slice('subscribers/'.length, -'.json'.length)
r = await worker.fetch(new Request(`https://x/api/unsubscribe?id=${id}&t=${'0'.repeat(36)}`), env)
assert.equal(r.status, 400)
r = await worker.fetch(new Request(`https://x/api/unsubscribe?id=${id}&t=${sub.token}`), env)
assert.equal(r.status, 200)
assert.ok(JSON.parse(store.get(key)).unsubscribed_at)

// Due time: first 15:00 UTC slot at least 12h after the last email.
const due = (iso) => new Date(nextDueAt(iso)).toISOString()
assert.equal(due('2026-11-25T09:30:00.000Z'), '2026-11-26T15:00:00.000Z', '1:30 a.m. PT signup → next morning')
assert.equal(due('2026-11-25T20:00:00.000Z'), '2026-11-26T15:00:00.000Z', 'noon PT signup → next morning')
assert.equal(due('2026-11-25T02:00:00.000Z'), '2026-11-25T15:00:00.000Z', '6 p.m. PT signup → next morning')
assert.equal(due('2026-11-26T15:00:12.000Z'), '2026-11-27T15:00:00.000Z', 'daily cadence after a 7 a.m. send')

// Missed run + a failed send: the next run retries, nothing is double-sent.
{
  store.clear(); sent.length = 0
  await post({ email: 'late@example.com' })
  const k = [...store.keys()].find((x) => x.startsWith('subscribers/'))
  const s1 = JSON.parse(store.get(k)); s1.last_sent_at = '2026-11-25T09:30:00.000Z'; store.set(k, JSON.stringify(s1))
  const realFetch = globalThis.fetch
  const errs = []; const realErr = console.error; console.error = (m) => errs.push(m)
  globalThis.fetch = async () => new Response('{"message":"boom"}', { status: 500 })
  let p; await worker.scheduled({}, env, { waitUntil: (x) => (p = x) }); await p
  console.error = realErr
  assert.equal(JSON.parse(store.get(k)).sent, 1, 'failed send keeps Day 2 pending')
  assert.ok(errs.some((m) => /day 2 failed: resend 500/.test(m)), 'Resend failure is logged')
  assert.equal(JSON.parse(store.get('ops/plan-drip.json')).failed, 1)
  globalThis.fetch = realFetch
  // Backup trigger: a page request runs the drip when the last run is over an hour old.
  const st = JSON.parse(store.get('ops/plan-drip.json')); st.last_run_at = new Date(Date.now() - 2 * 3600e3).toISOString()
  store.set('ops/plan-drip.json', JSON.stringify(st))
  const waits = []
  await worker.fetch(new Request('https://www.getfibermaxxing.com/'), env, { waitUntil: (x) => waits.push(x) })
  await Promise.all(waits)
  assert.equal(JSON.parse(store.get(k)).sent, 2, 'Day 2 sent by the backup trigger')
  assert.equal(sent.length, 2); assert.match(sent[1].subject, /^Day 2/)
  // Second request right after: no double send.
  await worker.fetch(new Request('https://www.getfibermaxxing.com/'), env, { waitUntil: (x) => waits.push(x) })
  p = undefined; await worker.scheduled({}, env, { waitUntil: (x) => (p = x) }); await p
  await Promise.all(waits)
  assert.equal(sent.length, 2, 'no double send')
  assert.ok(!JSON.stringify(JSON.parse(store.get('ops/plan-drip.json'))).includes('@'), 'drip log has no emails')
}

console.log('subscribe smoke: all checks passed (7 emails, dedupe, honeypot, unsubscribe, catch-up, retry, backup trigger)')
