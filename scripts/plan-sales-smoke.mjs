/**
 * Smoke test for the paid 30-day plan: checkout → claim → content → resend → webhook → refund.
 * In-memory R2 stand-in, stubbed Stripe and Resend APIs (no network).
 * Usage: node --import tsx scripts/plan-sales-smoke.mjs
 */
import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import worker from '../worker/index.ts'

const store = new Map()
const bucket = {
  async get(k) {
    if (!store.has(k)) return null
    const v = store.get(k)
    return { json: async () => JSON.parse(v) }
  },
  async put(k, v) { store.set(k, v) },
  async delete(k) { store.delete(k) },
  async list({ prefix }) {
    return { objects: [...store.keys()].filter((k) => k.startsWith(prefix)).map((key) => ({ key })), truncated: false }
  },
}

const SID = 'cs_test_a1B2c3D4e5F6g7H8i9J0'
let priceAmount = 900
let sessionState = { payment_status: 'unpaid', status: 'open' }
const sent = []
const stripeCalls = []
globalThis.fetch = async (url, init = {}) => {
  const u = String(url)
  if (u === 'https://api.resend.com/emails') {
    sent.push(JSON.parse(init.body))
    return Response.json({ id: 'em_1' })
  }
  if (u.startsWith('https://api.stripe.com/v1/')) {
    assert.equal(init.headers.Authorization, 'Bearer sk_test_x')
    const path = u.slice('https://api.stripe.com/v1/'.length)
    stripeCalls.push(`${init.method} ${path}`)
    if (path === 'prices/price_123') return Response.json({ id: 'price_123', active: true, unit_amount: priceAmount, currency: 'usd' })
    if (path === 'checkout/sessions' && init.method === 'POST') {
      const form = new URLSearchParams(init.body)
      assert.equal(form.get('line_items[0][price]'), 'price_123')
      assert.equal(form.get('allow_promotion_codes'), 'true')
      assert.equal(form.get('metadata[sku]'), 'fiber30')
      assert.match(form.get('success_url'), /\/30-day-plan\/thanks\?session_id=\{CHECKOUT_SESSION_ID\}$/)
      return Response.json({ id: SID, url: 'https://checkout.stripe.com/c/pay/' + SID })
    }
    if (path === `checkout/sessions/${SID}`) {
      return Response.json({
        id: SID, metadata: { sku: 'fiber30' }, ...sessionState, amount_total: 900, currency: 'usd',
        payment_intent: 'pi_123', livemode: false, customer_details: { email: 'Buyer@Example.com' },
      })
    }
    return Response.json({ error: { message: 'no such' } }, { status: 404 })
  }
  throw new Error('unexpected fetch ' + u)
}

const env = {
  MEAL_LOGS: bucket, RESEND_API_KEY: 're_test', STRIPE_SECRET_KEY: 'sk_test_x', STRIPE_PRICE_ID: 'price_123',
  STRIPE_WEBHOOK_SECRET: 'whsec_test', PLAN_PRICE_CENTS: '900', PLAN_REPLY_TO: 'help@example.com',
  ASSETS: { fetch: async () => new Response('asset') },
}
const call = (method, path, body, extraEnv = {}, headers = {}) =>
  worker.fetch(new Request('https://www.getfibermaxxing.com' + path, {
    method, headers: { 'content-type': 'application/json', ...headers }, body: body == null ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  }), { ...env, ...extraEnv })

// Not configured / kill switch
assert.equal((await call('POST', '/api/plan/checkout', {}, { STRIPE_SECRET_KEY: '' })).status, 503)
assert.equal((await call('POST', '/api/plan/checkout', {}, { PLAN_SALES: 'off' })).status, 503)

// Price on Stripe differs from the price shown on the site → refuse
priceAmount = 1499
assert.equal((await call('POST', '/api/plan/checkout', {}, { STRIPE_PRICE_ID: 'price_123', PLAN_PRICE_CENTS: '899' })).status, 503)
priceAmount = 900

// Checkout
let r = await call('POST', '/api/plan/checkout', {})
assert.equal(r.status, 200)
assert.match((await r.json()).url, /^https:\/\/checkout\.stripe\.com\//)

// Claim before paying → 402, nothing stored
r = await call('GET', `/api/plan/claim?session_id=${SID}`)
assert.equal(r.status, 402)
assert.equal(store.size, 0)
assert.equal((await call('GET', '/api/plan/claim?session_id=bogus')).status, 400)

// Paid → claim returns key, masked email, sends one email
sessionState = { payment_status: 'paid', status: 'complete' }
r = await call('GET', `/api/plan/claim?session_id=${SID}`)
assert.equal(r.status, 200)
const claim = await r.json()
assert.match(claim.key, /^[a-f0-9]{48}$/)
assert.equal(claim.email, 'bu•••@example.com')
assert.equal(sent.length, 1)
assert.deepEqual(sent[0].to, ['buyer@example.com'])
assert.equal(sent[0].reply_to, 'help@example.com')
assert.ok(sent[0].html.includes(`/my-plan#k=${claim.key}`))

// Claim again (page reload) → same key, no second email
r = await call('GET', `/api/plan/claim?session_id=${SID}`)
assert.equal((await r.json()).key, claim.key)
assert.equal(sent.length, 1)

// Content: bad key, unknown key, good key
assert.equal((await call('GET', '/api/plan/content?k=nope')).status, 400)
assert.equal((await call('GET', '/api/plan/content?k=' + 'a'.repeat(48))).status, 404)
r = await call('GET', '/api/plan/content?k=' + claim.key)
assert.equal(r.status, 200)
const c = await r.json()
assert.equal(c.menus.std['24'].length, 4)
assert.equal(c.menus.std['24'][0].length, 7)
assert.ok(c.guide.weeks.length === 4 && c.guide.disclaimer.includes('Mira Xin'))

// Resend: works, then capped at 3
for (let i = 0; i < 3; i++) assert.equal((await call('POST', '/api/plan/resend', { session_id: SID })).status, 200)
assert.equal((await call('POST', '/api/plan/resend', { session_id: SID })).status, 429)
assert.equal(sent.length, 4)

// Webhook: bad signature rejected
const sign = (payload, secret = 'whsec_test', t = Math.floor(Date.now() / 1000)) =>
  `t=${t},v1=${createHmac('sha256', secret).update(`${t}.${payload}`).digest('hex')}`
let payload = JSON.stringify({ type: 'charge.refunded', data: { object: { payment_intent: 'pi_123', refunded: true } } })
assert.equal((await call('POST', '/api/plan/webhook', payload, {}, { 'stripe-signature': sign(payload, 'whsec_wrong') })).status, 400)
assert.equal((await call('POST', '/api/plan/webhook', payload, {}, { 'stripe-signature': sign(payload, 'whsec_test', 1000) })).status, 400)

// Webhook: checkout.session.completed for a new session (tab closed) → fulfilled + emailed
const SID2 = 'cs_test_Z9y8X7w6V5u4T3s2R1q0'
const p2 = JSON.stringify({ type: 'checkout.session.completed', data: { object: {
  id: SID2, metadata: { sku: 'fiber30' }, status: 'complete', payment_status: 'no_payment_required', amount_total: 0,
  currency: 'usd', payment_intent: null, livemode: false, customer_details: { email: 'reviewer@example.com' } } } })
assert.equal((await call('POST', '/api/plan/webhook', p2, {}, { 'stripe-signature': sign(p2) })).status, 200)
assert.ok(store.has(`plan-purchases/${SID2}.json`))
assert.equal(sent.length, 5)
// Duplicate delivery → no second email
await call('POST', '/api/plan/webhook', p2, {}, { 'stripe-signature': sign(p2) })
assert.equal(sent.length, 5)

// Webhook: refund → access revoked
assert.equal((await call('POST', '/api/plan/webhook', payload, {}, { 'stripe-signature': sign(payload) })).status, 200)
assert.equal((await call('GET', '/api/plan/content?k=' + claim.key)).status, 404)
assert.equal((await call('GET', `/api/plan/claim?session_id=${SID}`)).status, 410)

// Other site routes untouched
assert.equal(await (await call('GET', '/')).text(), 'asset')
assert.equal((await call('GET', '/api/plan/nope')).status, 404)

console.log('plan sales smoke: ok', stripeCalls.length, 'stripe calls,', sent.length, 'emails')
