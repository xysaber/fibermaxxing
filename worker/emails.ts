/**
 * Free 7-day starter plan emails. Copy lives in src/content/starterPlan.ts,
 * shared with the /7-day-plan page.
 */
import { STARTER_DAYS } from '../src/content/starterPlan'

/** Kept for callers that only need the number of emails. */
export const PLAN_EMAILS = STARTER_DAYS

const SITE = 'https://www.getfibermaxxing.com'
const C = {
  ink: '#13201a',
  soft: '#45524b',
  faint: '#5f6b64',
  paper: '#f5f3ec',
  line: '#e3e0d6',
  leaf: '#1f6b45',
  tint: '#e7f2ea',
}

export type PlanContext = { targetG?: number; gapG?: number }

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function fmt(n: number): string {
  return String(Math.round(n))
}

/** A personal line for Day 1 / Day 7 when the reader signed up from a calculator result. */
function personalLine(day: number, ctx: PlanContext): string | null {
  const t = ctx.targetG && ctx.targetG > 0 ? ctx.targetG : undefined
  const g = ctx.gapG && ctx.gapG > 0 ? ctx.gapG : undefined
  if (day === 1 && t && g) return `Your target is ${fmt(t)} g a day. On the day you checked, you were about ${fmt(g)} g short. This week closes that a few grams at a time.`
  if (day === 1 && t) return `Your target is ${fmt(t)} g a day. This week gets you there a few grams at a time.`
  if (day === 7 && t) return `Your target is ${fmt(t)} g a day. See how close today gets you.`
  return null
}

function progressDots(day: number): string {
  const dots = Array.from({ length: 7 }, (_, i) => {
    const on = i < day
    return `<td style="padding:0 3px 0 0"><div style="width:28px;height:6px;border-radius:3px;background:${on ? C.leaf : C.line}"></div></td>`
  }).join('')
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse"><tr>${dots}</tr></table>`
}

export function renderPlanEmail(
  day: number,
  unsubscribeUrl: string,
  ctx: PlanContext = {},
): { subject: string; html: string; text: string } {
  const e = STARTER_DAYS[day - 1]
  // Until /7-day-plan ships, every button goes to the calculator.
  const cta = e.options.length ? 'Check one in the calculator' : e.cta
  const calc = `${SITE}/?utm_source=email&utm_medium=plan&utm_campaign=day${day}#calculator`
  const personal = personalLine(day, ctx)
  const font = '-apple-system,BlinkMacSystemFont,Segoe UI,Inter,Helvetica,Arial,sans-serif'

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(e.subject)}</title></head>
<body style="margin:0;padding:0;background:${C.paper};font-family:${font};color:${C.ink}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(e.preheader)}&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;</div>
<div style="max-width:560px;margin:0 auto;padding:28px 16px">
<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 20px"><tr>
<td style="padding:0 10px 0 0;vertical-align:middle"><img src="${SITE}/logo.png" width="28" height="28" alt="" style="display:block;border:0;border-radius:6px"></td>
<td style="vertical-align:middle;font-weight:700;font-size:17px;letter-spacing:-.01em">GetFibermaxxing</td>
</tr></table>
<div style="background:#ffffff;border:1px solid ${C.line};border-radius:16px;padding:28px 24px">
<p style="margin:0 0 10px;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:${C.leaf}">Day ${day} of 7 · Free starter plan</p>
${progressDots(day)}
<h1 style="margin:18px 0 18px;font-size:26px;line-height:1.2;letter-spacing:-.015em">${esc(e.heading)}</h1>
<div style="margin:0 0 20px;padding:16px 18px;background:${C.tint};border-radius:12px">
<p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${C.leaf}">Today’s idea${e.adds ? ` <span style="display:inline-block;margin-left:6px;padding:2px 8px;border-radius:999px;background:${C.leaf};color:#ffffff;letter-spacing:0;text-transform:none">${esc(e.adds)}</span>` : ''}</p>
<p style="margin:0;font-size:17px;line-height:1.5;font-weight:600;color:${C.ink}">${esc(e.idea)}</p>
</div>
${e.options.length ? `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;margin:0 0 20px">${e.options.map((o) => `<tr><td style="padding:12px 0;border-top:1px solid ${C.line};vertical-align:top"><p style="margin:0 0 2px;font-size:16px;font-weight:600;color:${C.ink}">${esc(o.name)}</p><p style="margin:0;font-size:14px;line-height:1.5;color:${C.soft}">${esc(o.detail)}</p></td><td style="padding:12px 0 12px 12px;border-top:1px solid ${C.line};vertical-align:top;text-align:right;white-space:nowrap;font-size:15px;font-weight:700;color:${C.leaf}">~${o.grams.toFixed(0)} g</td></tr>`).join('')}</table>` : ''}
${personal ? `<p style="margin:0 0 14px;font-size:16px;line-height:1.6;color:${C.ink};font-weight:600">${esc(personal)}</p>` : ''}
${e.paragraphs.map((p) => `<p style="margin:0 0 14px;font-size:16px;line-height:1.6;color:${C.soft}">${esc(p)}</p>`).join('\n')}
<p style="margin:6px 0 24px;padding:0 0 0 14px;border-left:3px solid ${C.leaf};font-size:15px;line-height:1.55;color:${C.soft}"><b style="color:${C.ink}">Tip:</b> ${esc(e.tip)}</p>
<a href="${calc}" style="display:inline-block;background:${C.leaf};color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;padding:13px 22px;border-radius:8px">${esc(cta)}</a>
${e.next ? `<p style="margin:24px 0 0;padding-top:16px;border-top:1px solid ${C.line};font-size:14px;line-height:1.5;color:${C.faint}">${esc(e.next)}</p>` : ''}
</div>
<p style="margin:20px 4px 0;font-size:12px;line-height:1.6;color:${C.faint}">Fiber values are approximate and not medical advice. You’re getting this because you asked for the 7-day plan on getfibermaxxing.com. <a href="${unsubscribeUrl}" style="color:${C.faint}">Unsubscribe</a></p>
</div></body></html>`

  const text = [
    `Day ${day} of 7 · ${e.heading}`,
    '',
    `TODAY’S IDEA${e.adds ? ` (${e.adds})` : ''}: ${e.idea}`,
    '',
    ...e.options.map((o) => `- ${o.name}: ${o.detail} (~${o.grams.toFixed(0)} g)`),
    ...(e.options.length ? [''] : []),
    ...(personal ? [personal, ''] : []),
    ...e.paragraphs.flatMap((p) => [p, '']),
    `Tip: ${e.tip}`,
    '',
    `${cta}: ${calc}`,
    ...(e.next ? ['', e.next] : []),
    '',
    '—',
    'Fiber values are approximate and not medical advice.',
    `Unsubscribe: ${unsubscribeUrl}`,
  ].join('\n')

  return { subject: e.subject, html, text }
}
