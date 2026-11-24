/**
 * Smoke test for /api/subscribe, /api/unsubscribe and the daily drip.
 * Uses an in-memory R2 stand-in and a stubbed Resend API (no network).
 * Usage: node --import tsx scripts/subscribe-smoke.mjs
 */
import assert from 'node:assert/strict'
import worker from '../worker/index.ts'

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
  s.last_sent_at = new Date(Date.now() - 25 * 3600 * 1000).toISOString()
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

console.log('subscribe smoke: all checks passed (7 emails, dedupe, honeypot, unsubscribe)')
