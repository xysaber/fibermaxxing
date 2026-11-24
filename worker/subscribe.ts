/**
 * Email signup for the free 7-day plan.
 * - POST /api/subscribe        → store subscriber in R2, send Day 1 via Resend
 * - GET  /api/unsubscribe      → mark unsubscribed (link in every email)
 * - scheduled (daily cron)     → send the next day's email to active subscribers
 * Needs secret RESEND_API_KEY and a verified sending domain in Resend.
 * Kill switch: SUBSCRIBE=off.
 */
import { PLAN_EMAILS, renderPlanEmail } from './emails'

export interface SubscribeEnv {
  MEAL_LOGS?: R2Bucket
  RESEND_API_KEY?: string
  /** Optional: also add the contact to this Resend audience. */
  RESEND_AUDIENCE_ID?: string
  EMAIL_FROM?: string
  SUBSCRIBE?: string
}

type Subscriber = {
  email: string
  created_at: string
  /** Number of plan emails already sent (1–7). */
  sent: number
  last_sent_at: string
  token: string
  unsubscribed_at?: string
  source?: string
  target_g?: number
  gap_g?: number
}

const PREFIX = 'subscribers/'
const SITE = 'https://www.getfibermaxxing.com'
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]{1,64}@[A-Za-z0-9.-]{1,253}\.[A-Za-z]{2,24}$/
const DAY_MS = 24 * 60 * 60 * 1000

function enabled(env: SubscribeEnv): boolean {
  return (env.SUBSCRIBE || 'on').toLowerCase() !== 'off'
}

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function randomToken(): string {
  const b = new Uint8Array(18)
  crypto.getRandomValues(b)
  return [...b].map((x) => x.toString(16).padStart(2, '0')).join('')
}

function unsubscribeUrl(id: string, token: string): string {
  return `${SITE}/api/unsubscribe?id=${id}&t=${token}`
}

async function sendPlanEmail(env: SubscribeEnv, id: string, sub: Subscriber, day: number): Promise<boolean> {
  const unsub = unsubscribeUrl(id, sub.token)
  const { subject, html, text } = renderPlanEmail(day, unsub, { targetG: sub.target_g, gapG: sub.gap_g })
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM || 'GetFibermaxxing <hello@getfibermaxxing.com>',
      to: [sub.email],
      subject,
      html,
      text,
      headers: {
        'List-Unsubscribe': `<${unsub}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    }),
  })
  return res.ok
}

async function addToAudience(env: SubscribeEnv, email: string, unsubscribed: boolean): Promise<void> {
  if (!env.RESEND_AUDIENCE_ID || !env.RESEND_API_KEY) return
  try {
    await fetch(`https://api.resend.com/audiences/${env.RESEND_AUDIENCE_ID}/contacts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, unsubscribed }),
    })
  } catch {
    /* audience sync is best-effort */
  }
}

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
}

export async function handleSubscribe(request: Request, env: SubscribeEnv): Promise<Response> {
  if (!enabled(env) || !env.RESEND_API_KEY || !env.MEAL_LOGS) {
    return json({ ok: false, error: 'unavailable' }, 503)
  }
  const len = Number(request.headers.get('content-length') || '0')
  if (len > 4096) return json({ ok: false, error: 'too_large' }, 413)

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return json({ ok: false, error: 'bad_json' }, 400)
  }
  // Honeypot: real users never fill this hidden field.
  if (typeof body.company === 'string' && body.company.trim()) return json({ ok: true })

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!EMAIL_RE.test(email)) return json({ ok: false, error: 'invalid_email' }, 400)

  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 && v < 200 ? Math.round(v * 10) / 10 : undefined)
  const id = await sha256Hex(email)
  const key = `${PREFIX}${id}.json`

  const existing = await env.MEAL_LOGS.get(key)
  if (existing) {
    const sub = (await existing.json()) as Subscriber
    if (!sub.unsubscribed_at) return json({ ok: true, already: true })
  }

  const now = new Date().toISOString()
  const sub: Subscriber = {
    email,
    created_at: now,
    sent: 0,
    last_sent_at: now,
    token: randomToken(),
    source: typeof body.source === 'string' ? body.source.slice(0, 40) : undefined,
    target_g: num(body.target_g),
    gap_g: num(body.gap_g),
  }
  const ok = await sendPlanEmail(env, id, sub, 1)
  if (!ok) return json({ ok: false, error: 'send_failed' }, 502)
  sub.sent = 1
  await env.MEAL_LOGS.put(key, JSON.stringify(sub), { httpMetadata: { contentType: 'application/json' } })
  await addToAudience(env, email, false)
  return json({ ok: true })
}

export async function handleUnsubscribe(request: Request, env: SubscribeEnv): Promise<Response> {
  const url = new URL(request.url)
  const id = url.searchParams.get('id') || ''
  const t = url.searchParams.get('t') || ''
  const page = (msg: string, status = 200) =>
    new Response(
      `<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribe · GetFibermaxxing</title><body style="font-family:system-ui,sans-serif;max-width:520px;margin:80px auto;padding:0 20px;color:#13201a"><h1 style="font-size:24px">${msg}</h1><p><a href="${SITE}/" style="color:#1f6b45">Back to the calculator</a></p></body>`,
      { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } },
    )
  if (!/^[a-f0-9]{64}$/.test(id) || !/^[a-f0-9]{36}$/.test(t) || !env.MEAL_LOGS) {
    return page('That unsubscribe link is not valid.', 400)
  }
  const key = `${PREFIX}${id}.json`
  const obj = await env.MEAL_LOGS.get(key)
  if (!obj) return page('You are unsubscribed.')
  const sub = (await obj.json()) as Subscriber
  if (sub.token !== t) return page('That unsubscribe link is not valid.', 400)
  if (!sub.unsubscribed_at) {
    sub.unsubscribed_at = new Date().toISOString()
    await env.MEAL_LOGS.put(key, JSON.stringify(sub), { httpMetadata: { contentType: 'application/json' } })
    await addToAudience(env, sub.email, true)
  }
  return page('You are unsubscribed. No more plan emails will be sent.')
}

/** Daily cron: send the next plan email to anyone whose last one was ~a day ago. */
export async function runPlanDrip(env: SubscribeEnv): Promise<void> {
  if (!enabled(env) || !env.RESEND_API_KEY || !env.MEAL_LOGS) return
  const now = Date.now()
  let cursor: string | undefined
  do {
    const page = await env.MEAL_LOGS.list({ prefix: PREFIX, cursor, limit: 500 })
    for (const o of page.objects) {
      const obj = await env.MEAL_LOGS.get(o.key)
      if (!obj) continue
      const sub = (await obj.json()) as Subscriber
      if (sub.unsubscribed_at || sub.sent >= PLAN_EMAILS.length) continue
      // 20h, not 24h, so a signup at 3 p.m. still gets Day 2 at the next morning's run.
      if (now - Date.parse(sub.last_sent_at) < DAY_MS - 4 * 60 * 60 * 1000) continue
      const id = o.key.slice(PREFIX.length, -'.json'.length)
      const day = sub.sent + 1
      if (await sendPlanEmail(env, id, sub, day)) {
        sub.sent = day
        sub.last_sent_at = new Date().toISOString()
        await env.MEAL_LOGS.put(o.key, JSON.stringify(sub), { httpMetadata: { contentType: 'application/json' } })
      }
    }
    cursor = page.truncated ? page.cursor : undefined
  } while (cursor)
}
