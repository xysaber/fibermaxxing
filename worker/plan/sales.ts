/**
 * Paid 30-day plan: Stripe Checkout → private link → plan content.
 *
 *   POST /api/plan/checkout   → Stripe Checkout Session URL ($ from STRIPE_PRICE_ID)
 *   GET  /api/plan/claim      → after Stripe redirects back: verify payment, return access key
 *   POST /api/plan/resend     → email the link again (by checkout session id)
 *   POST /api/plan/webhook    → checkout.session.completed (fulfil even if the tab was closed),
 *                               charge.refunded (turn the link off)
 *   GET  /api/plan/content    → plan content for a valid access key
 *
 * Storage (R2, same bucket as meal logs and subscribers):
 *   plan-purchases/<checkout session id>.json   one per payment
 *   plan-access/<access key>.json               → session id
 *   plan-refunds/<payment intent id>.json       → session id (to revoke on refund)
 *
 * Secrets (Cloudflare dashboard → Settings → Variables and Secrets, type Secret):
 *   STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET; vars STRIPE_PRICE_ID, PLAN_PRICE_CENTS.
 * Kill switch: PLAN_SALES = "off" stops new checkouts (existing buyers keep access).
 */
import content from './content.json'
import { buildGuide } from './guide'

export interface PlanEnv {
  MEAL_LOGS?: R2Bucket
  RESEND_API_KEY?: string
  EMAIL_FROM?: string
  STRIPE_SECRET_KEY?: string
  STRIPE_WEBHOOK_SECRET?: string
  STRIPE_PRICE_ID?: string
  /** Price shown on the site, in cents. Checkout refuses to start if Stripe's price differs. */
  PLAN_PRICE_CENTS?: string
  PLAN_SALES?: string
  /** Inbox that receives replies (refund requests) to the purchase email. */
  PLAN_REPLY_TO?: string
}

const SITE = 'https://www.getfibermaxxing.com'
const SKU = 'fiber30'
const SESSION_RE = /^cs_(test|live)_[A-Za-z0-9]{10,200}$/
const KEY_RE = /^[a-f0-9]{48}$/

type Purchase = {
  session_id: string
  email: string
  key: string
  created_at: string
  amount_total: number
  currency: string
  payment_intent: string | null
  livemode: boolean
  emailed_at?: string
  resent?: number
  revoked_at?: string
}

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
}

function salesOn(env: PlanEnv): boolean {
  return (env.PLAN_SALES || 'on').toLowerCase() !== 'off'
}

async function stripe(env: PlanEnv, method: 'GET' | 'POST', path: string, form?: Record<string, string>) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      ...(form ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
    },
    body: form ? new URLSearchParams(form).toString() : undefined,
  })
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>
  return { ok: res.ok, status: res.status, body }
}

let priceCache: { id: string; amount: number; currency: string; at: number } | null = null

async function stripePrice(env: PlanEnv, fresh = false) {
  const id = env.STRIPE_PRICE_ID || ''
  if (!fresh && priceCache && priceCache.id === id && Date.now() - priceCache.at < 10 * 60 * 1000) return priceCache
  const r = await stripe(env, 'GET', `prices/${encodeURIComponent(id)}`)
  if (!r.ok || r.body.active !== true) return null
  priceCache = { id, amount: Number(r.body.unit_amount), currency: String(r.body.currency), at: Date.now() }
  return priceCache
}

export async function handlePlanCheckout(_request: Request, env: PlanEnv): Promise<Response> {
  if (!salesOn(env) || !env.STRIPE_SECRET_KEY || !env.STRIPE_PRICE_ID) return json({ ok: false, error: 'unavailable' }, 503)
  const expected = Number(env.PLAN_PRICE_CENTS || '900')
  let price = await stripePrice(env)
  if (price && price.amount !== expected) price = await stripePrice(env, true) // price changed in Stripe
  if (!price || price.amount !== expected || price.currency !== 'usd') {
    console.error('[plan] price mismatch or missing', price, expected)
    return json({ ok: false, error: 'unavailable' }, 503)
  }
  const r = await stripe(env, 'POST', 'checkout/sessions', {
    mode: 'payment',
    'line_items[0][price]': env.STRIPE_PRICE_ID,
    'line_items[0][quantity]': '1',
    allow_promotion_codes: 'true',
    success_url: `${SITE}/30-day-plan/thanks?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE}/30-day-plan?checkout=cancelled`,
    'metadata[sku]': SKU,
    'payment_intent_data[metadata][sku]': SKU,
    customer_creation: 'if_required',
  })
  if (!r.ok || typeof r.body.url !== 'string') {
    console.error('[plan] checkout create failed', r.status, r.body.error)
    return json({ ok: false, error: 'checkout_failed' }, 502)
  }
  return json({ ok: true, url: r.body.url })
}

async function accessKey(env: PlanEnv, sessionId: string): Promise<string> {
  // Deterministic per session, so the webhook and the thank-you page can't create two keys.
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.STRIPE_SECRET_KEY || ''), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(`plan-access:${sessionId}`))
  return [...new Uint8Array(sig)].slice(0, 24).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function planLink(key: string): string {
  return `${SITE}/my-plan#k=${key}`
}

function maskEmail(email: string): string {
  const [user, domain] = email.split('@')
  if (!domain) return ''
  return `${user.slice(0, 2)}•••@${domain}`
}

const put = (env: PlanEnv, key: string, value: unknown) =>
  env.MEAL_LOGS!.put(key, JSON.stringify(value), { httpMetadata: { contentType: 'application/json' } })

async function readJson<T>(env: PlanEnv, key: string): Promise<T | null> {
  const obj = await env.MEAL_LOGS!.get(key)
  return obj ? ((await obj.json()) as T) : null
}

/** Create the purchase record (once) and email the link. Session must already be verified as paid. */
async function fulfil(env: PlanEnv, session: Record<string, unknown>): Promise<Purchase> {
  const sessionId = String(session.id)
  const recKey = `plan-purchases/${sessionId}.json`
  let p = await readJson<Purchase>(env, recKey)
  if (!p) {
    const details = (session.customer_details || {}) as Record<string, unknown>
    const email = String(details.email || session.customer_email || '').toLowerCase()
    p = {
      session_id: sessionId,
      email,
      key: await accessKey(env, sessionId),
      created_at: new Date().toISOString(),
      amount_total: Number(session.amount_total || 0),
      currency: String(session.currency || 'usd'),
      payment_intent: typeof session.payment_intent === 'string' ? session.payment_intent : null,
      livemode: session.livemode === true,
    }
    await put(env, recKey, p)
    await put(env, `plan-access/${p.key}.json`, { session_id: sessionId })
    if (p.payment_intent) await put(env, `plan-refunds/${p.payment_intent}.json`, { session_id: sessionId })
  }
  if (!p.emailed_at && p.email) {
    if (await sendPlanLinkEmail(env, p.email, p.key)) {
      p.emailed_at = new Date().toISOString()
      await put(env, recKey, p)
    }
  }
  return p
}

function isPaidPlanSession(s: Record<string, unknown>): boolean {
  const meta = (s.metadata || {}) as Record<string, unknown>
  if (meta.sku !== SKU || s.status !== 'complete') return false
  // A 100% promo code gives payment_status "no_payment_required".
  return s.payment_status === 'paid' || s.payment_status === 'no_payment_required'
}

export async function handlePlanClaim(request: Request, env: PlanEnv): Promise<Response> {
  if (!env.STRIPE_SECRET_KEY || !env.MEAL_LOGS) return json({ ok: false, error: 'unavailable' }, 503)
  const id = new URL(request.url).searchParams.get('session_id') || ''
  if (!SESSION_RE.test(id)) return json({ ok: false, error: 'bad_session' }, 400)
  const existing = await readJson<Purchase>(env, `plan-purchases/${id}.json`)
  if (existing && !existing.revoked_at) {
    return json({ ok: true, key: existing.key, email: maskEmail(existing.email) })
  }
  if (existing?.revoked_at) return json({ ok: false, error: 'refunded' }, 410)
  const r = await stripe(env, 'GET', `checkout/sessions/${id}`)
  if (!r.ok) return json({ ok: false, error: 'not_found' }, 404)
  if (!isPaidPlanSession(r.body)) return json({ ok: false, error: 'not_paid' }, 402)
  const p = await fulfil(env, r.body)
  return json({ ok: true, key: p.key, email: maskEmail(p.email) })
}

export async function handlePlanResend(request: Request, env: PlanEnv): Promise<Response> {
  if (!env.MEAL_LOGS || !env.RESEND_API_KEY) return json({ ok: false, error: 'unavailable' }, 503)
  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return json({ ok: false, error: 'bad_json' }, 400)
  }
  const id = typeof body.session_id === 'string' ? body.session_id : ''
  if (!SESSION_RE.test(id)) return json({ ok: false, error: 'bad_session' }, 400)
  const recKey = `plan-purchases/${id}.json`
  const p = await readJson<Purchase>(env, recKey)
  if (!p || p.revoked_at || !p.email) return json({ ok: false, error: 'not_found' }, 404)
  if ((p.resent || 0) >= 3) return json({ ok: false, error: 'limit' }, 429)
  const ok = await sendPlanLinkEmail(env, p.email, p.key)
  if (!ok) return json({ ok: false, error: 'send_failed' }, 502)
  p.resent = (p.resent || 0) + 1
  p.emailed_at = new Date().toISOString()
  await put(env, recKey, p)
  return json({ ok: true })
}

async function verifyStripeSignature(secret: string, header: string, payload: string): Promise<boolean> {
  const parts = Object.fromEntries(
    header.split(',').map((kv) => {
      const i = kv.indexOf('=')
      return [kv.slice(0, i), kv.slice(i + 1)]
    }),
  ) as Record<string, string>
  const t = Number(parts.t)
  if (!t || Math.abs(Date.now() / 1000 - t) > 300) return false
  const sigs = header.split(',').filter((kv) => kv.startsWith('v1=')).map((kv) => kv.slice(3))
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const mac = await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(`${t}.${payload}`))
  const hex = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('')
  return sigs.some((s) => s.length === hex.length && timingSafeEqual(s, hex))
}

function timingSafeEqual(a: string, b: string): boolean {
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export async function handlePlanWebhook(request: Request, env: PlanEnv): Promise<Response> {
  if (!env.STRIPE_WEBHOOK_SECRET || !env.MEAL_LOGS) return new Response('not configured', { status: 503 })
  const payload = await request.text()
  const ok = await verifyStripeSignature(env.STRIPE_WEBHOOK_SECRET, request.headers.get('stripe-signature') || '', payload)
  if (!ok) return new Response('bad signature', { status: 400 })
  const event = JSON.parse(payload) as { type: string; data: { object: Record<string, unknown> } }
  const obj = event.data.object
  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    if (isPaidPlanSession(obj)) await fulfil(env, obj)
  } else if (event.type === 'charge.refunded') {
    const pi = typeof obj.payment_intent === 'string' ? obj.payment_intent : ''
    if (pi && obj.refunded === true) {
      const ref = await readJson<{ session_id: string }>(env, `plan-refunds/${pi}.json`)
      if (ref) {
        const recKey = `plan-purchases/${ref.session_id}.json`
        const p = await readJson<Purchase>(env, recKey)
        if (p && !p.revoked_at) {
          p.revoked_at = new Date().toISOString()
          await put(env, recKey, p)
          await env.MEAL_LOGS.delete(`plan-access/${p.key}.json`)
        }
      }
    }
  }
  return new Response('ok')
}

export async function handlePlanContent(request: Request, env: PlanEnv): Promise<Response> {
  if (!env.MEAL_LOGS) return json({ ok: false, error: 'unavailable' }, 503)
  const key = new URL(request.url).searchParams.get('k') || ''
  if (!KEY_RE.test(key)) return json({ ok: false, error: 'bad_key' }, 400)
  const access = await readJson<{ session_id: string }>(env, `plan-access/${key}.json`)
  if (!access) return json({ ok: false, error: 'not_found' }, 404)
  return Response.json(
    { ok: true, ...content, guide: buildGuide() },
    { headers: { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex' } },
  )
}

// ——— Email ———
function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function renderPlanLinkEmail(key: string): { subject: string; html: string; text: string } {
  const link = planLink(key)
  const subject = 'Your 30-day fiber plan is ready'
  const font = '-apple-system,BlinkMacSystemFont,Segoe UI,Inter,Helvetica,Arial,sans-serif'
  const steps = [
    'Enter your daily target and about how much you eat now.',
    'Pick Standard, GLP-1 or Gentle gut.',
    'Shop from the Week 1 list and start tomorrow morning.',
  ]
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#f5f3ec;font-family:${font};color:#13201a">
<div style="max-width:560px;margin:0 auto;padding:28px 16px">
<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 20px"><tr>
<td style="padding:0 10px 0 0;vertical-align:middle"><img src="${SITE}/logo.png" width="28" height="28" alt="" style="display:block;border:0;border-radius:6px"></td>
<td style="vertical-align:middle;font-weight:700;font-size:17px;letter-spacing:-.01em">GetFibermaxxing</td>
</tr></table>
<div style="background:#ffffff;border:1px solid #e3e0d6;border-radius:16px;padding:28px 24px">
<h1 style="margin:0 0 14px;font-size:26px;line-height:1.25;letter-spacing:-.015em">Your 30-day plan is ready</h1>
<p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#45524b">Thanks for buying the plan. This link is yours. Open it on your phone or computer, and keep this email so you can find it again.</p>
<a href="${link}" style="display:block;text-align:center;background:#1f6b45;color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;padding:15px 22px;border-radius:8px">Open my plan</a>
<div style="margin:22px 0 0;padding:18px 0 0;border-top:1px solid #efede6">
<p style="margin:0 0 8px;font-size:15px;font-weight:700">Before Day 1</p>
${steps.map((s, i) => `<p style="margin:0 0 6px;font-size:15px;line-height:1.55;color:#45524b">${i + 1}. ${esc(s)}</p>`).join('\n')}
</div>
<p style="margin:16px 0 0;font-size:14px;line-height:1.6;color:#45524b">Not for you? Reply within 7 days and we will refund you in full. Stripe sends your receipt separately.</p>
<p style="margin:16px 0 0;font-size:14px;line-height:1.6;color:#45524b">Mira Xin<br>Founder &amp; Editor, GetFibermaxxing</p>
</div>
<p style="margin:20px 4px 0;font-size:12px;line-height:1.6;color:#5f6b64">General guidance for healthy adults, not medical advice. If you have a digestive condition, are pregnant, or take GLP-1 medication, check with your clinician first. This is a one-time purchase email.</p>
</div></body></html>`
  const text = [
    'Your 30-day plan is ready',
    '',
    'Thanks for buying the plan. This link is yours. Keep this email so you can find it again:',
    link,
    '',
    'Before Day 1',
    ...steps.map((s, i) => `${i + 1}. ${s}`),
    '',
    'Not for you? Reply within 7 days and we will refund you in full. Stripe sends your receipt separately.',
    '',
    'Mira Xin',
    'Founder & Editor, GetFibermaxxing',
    '',
    'General guidance for healthy adults, not medical advice.',
  ].join('\n')
  return { subject, html, text }
}

async function sendPlanLinkEmail(env: PlanEnv, to: string, key: string): Promise<boolean> {
  if (!env.RESEND_API_KEY) return false
  const { subject, html, text } = renderPlanLinkEmail(key)
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.EMAIL_FROM || 'GetFibermaxxing <plan@getfibermaxxing.com>',
        to: [to],
        ...(env.PLAN_REPLY_TO ? { reply_to: env.PLAN_REPLY_TO } : {}),
        subject,
        html,
        text,
      }),
    })
    if (!res.ok) console.error('[plan] resend failed', res.status)
    return res.ok
  } catch (e) {
    console.error('[plan] resend error', e)
    return false
  }
}
