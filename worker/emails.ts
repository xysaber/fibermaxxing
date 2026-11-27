/**
 * Free 7-day starter plan emails. Copy lives in src/content/starterPlan.ts,
 * shared with the /7-day-plan page.
 */
import { STARTER_DAYS, type StarterOption } from '../src/content/starterPlan'
import { STARTER_PHOTOS, photoUrl, type StarterPhoto } from '../src/content/starterPhotos'

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
  tipBg: '#fdf1e4',
  tipInk: '#9a4507',
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

type Opt = StarterOption & { p?: StarterPhoto }

/** Desktop: two photo cards per row. */
function gridHtml(opts: Opt[], href: string): string {
  const rows: string[] = []
  for (let i = 0; i < opts.length; i += 2) {
    const cells = [opts[i], opts[i + 1]].map((o, j) => {
      const pad = j === 0 ? 'padding:0 7px 14px 0' : 'padding:0 0 14px 7px'
      if (!o) return `<td class="gcell" width="50%" style="${pad}"></td>`
      const img = o.p
        ? `<img src="${esc(photoUrl(o.p, 520, 300))}" width="252" height="145" alt="${esc(o.name)}" style="display:block;width:100%;height:auto;border:0">`
        : ''
      return `<td class="gcell" width="50%" valign="top" style="${pad}"><a href="${href}" style="display:block;text-decoration:none;color:${C.ink};border:1px solid ${C.line};border-radius:12px;overflow:hidden">${img}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse"><tr><td style="padding:12px 0 0 14px;font-size:15px;font-weight:600;color:${C.ink}">${esc(o.name)}</td><td align="right" style="padding:12px 14px 0 8px;font-size:13px;font-weight:700;color:${C.leaf};white-space:nowrap">&asymp;${o.grams} g</td></tr><tr><td colspan="2" style="padding:4px 14px 14px;font-size:13px;line-height:1.45;color:${C.faint}">${esc(o.detail)}</td></tr></table></a></td>`
    })
    rows.push(`<tr>${cells.join('')}</tr>`)
  }
  return `<table role="presentation" class="dsk" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">${rows.join('')}</table>`
}

/** Phone: one row per option, thumbnail on the left. Hidden unless the client applies the media query. */
function listHtml(opts: Opt[], href: string): string {
  const rows = opts
    .map((o) => {
      const img = o.p
        ? `<img src="${esc(photoUrl(o.p, 176, 160))}" width="88" height="80" alt="${esc(o.name)}" style="display:block;width:88px;height:80px;border:0;border-radius:8px">`
        : ''
      return `<a href="${href}" style="display:block;text-decoration:none;color:${C.ink};border:1px solid ${C.line};border-radius:12px;padding:8px;margin:0 0 10px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse"><tr><td width="88" valign="middle" style="width:88px">${img}</td><td valign="middle" style="padding:0 0 0 12px"><span style="font-size:15px;font-weight:600;color:${C.ink}">${esc(o.name)}</span> <span style="font-size:13px;font-weight:700;color:${C.leaf};white-space:nowrap">&asymp;${o.grams} g</span><br><span style="font-size:13px;line-height:1.45;color:${C.faint}">${esc(o.detail)}</span></td></tr></table></a>`
    })
    .join('')
  return `<div class="mob" style="display:none;max-height:0;overflow:hidden;mso-hide:all">${rows}</div>`
}

function creditsHtml(opts: Opt[]): string {
  const seen = new Set<string>()
  const names = opts
    .filter((o) => o.p && !seen.has(o.p.author) && seen.add(o.p.author))
    .map((o) => `<a href="${esc(o.p!.authorUrl)}" style="color:${C.faint}">${esc(o.p!.author)}</a>`)
  if (!names.length) return ''
  return `<p style="margin:0 0 4px;font-size:11px;line-height:1.5;color:${C.faint}">Photos: ${names.join(', ')} / <a href="https://unsplash.com/?utm_source=getfibermaxxing&amp;utm_medium=referral" style="color:${C.faint}">Unsplash</a></p>`
}

export function renderPlanEmail(
  day: number,
  unsubscribeUrl: string,
  ctx: PlanContext = {},
): { subject: string; html: string; text: string } {
  const e = STARTER_DAYS[day - 1]
  const utm = `utm_source=email&utm_medium=plan&utm_campaign=day${day}`
  const planHref = `${SITE}/7-day-plan?day=${day}&${utm}`
  const calcHref = `${SITE}/?${utm}#calculator`
  // Days with options (and the comfort check) open the plan page; Day 1 and Day 7 are calculator check-ins.
  const ctaHref = e.options.length || day === 6 ? planHref : calcHref
  const opts: Opt[] = e.options.map((o) => ({ ...o, p: o.photo ? STARTER_PHOTOS[o.photo] : undefined }))
  const hero = opts.find((o) => o.p)
  const personal = personalLine(day, ctx)
  const font = '-apple-system,BlinkMacSystemFont,Segoe UI,Inter,Helvetica,Arial,sans-serif'
  const P = (t: string) => `<p style="margin:0 0 14px;font-size:16px;line-height:1.6;color:${C.soft}">${esc(t)}</p>`

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(e.subject)}</title>
<style>
@media only screen and (max-width:480px){
.dsk{display:none!important}
.mob{display:block!important;max-height:none!important;overflow:visible!important}
.hero{display:block!important;max-height:none!important}
.pad{padding-left:18px!important;padding-right:18px!important}
.cta{display:block!important;text-align:center!important}
}
</style></head>
<body style="margin:0;padding:0;background:${C.paper};font-family:${font};color:${C.ink}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(e.preheader)}&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;</div>
<div style="max-width:600px;margin:0 auto;padding:28px 12px">
<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 18px 4px"><tr>
<td style="padding:0 10px 0 0;vertical-align:middle"><img src="${SITE}/logo.png" width="28" height="28" alt="" style="display:block;border:0;border-radius:6px"></td>
<td style="vertical-align:middle;font-weight:700;font-size:17px;letter-spacing:-.01em">GetFibermaxxing</td>
</tr></table>
<div style="background:#ffffff;border:1px solid ${C.line};border-radius:16px;overflow:hidden">
${hero ? `<div class="hero" style="display:none;max-height:0;overflow:hidden;mso-hide:all"><img src="${esc(photoUrl(hero.p!, 780, 400))}" width="390" height="200" alt="${esc(hero.name)}" style="display:block;width:100%;height:auto;border:0"></div>` : ''}
<div class="pad" style="padding:28px 28px 8px">
<p style="margin:0 0 10px;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:${C.leaf}">Day ${day} of 7 · Free starter plan</p>
${progressDots(day)}
<h1 style="margin:20px 0 12px;font-size:28px;line-height:1.15;letter-spacing:-.02em">${esc(e.heading)}</h1>
${P(e.idea)}
${personal ? `<p style="margin:0 0 14px;font-size:16px;line-height:1.6;color:${C.ink};font-weight:600">${esc(personal)}</p>` : ''}
</div>
${opts.length ? `<div class="pad" style="padding:6px 28px 0">${gridHtml(opts, planHref)}${listHtml(opts, planHref)}${creditsHtml(opts)}</div>` : ''}
<div class="pad" style="padding:14px 28px 28px">
${e.paragraphs.map(P).join('\n')}
<div style="margin:0 0 24px;padding:14px 16px;background:${C.tipBg};border-radius:10px">
<p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${C.tipInk}">Tip</p>
<p style="margin:0;font-size:15px;line-height:1.55;color:${C.soft}">${esc(e.tip)}</p>
</div>
<a class="cta" href="${ctaHref}" style="display:inline-block;background:${C.leaf};color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;padding:14px 22px;border-radius:8px">${esc(e.cta)}</a>
</div>
</div>
<p style="margin:20px 4px 0;font-size:12px;line-height:1.6;color:${C.faint}">Fiber values are approximate and not medical advice. You’re getting this because you asked for the 7-day plan on getfibermaxxing.com. <a href="${unsubscribeUrl}" style="color:${C.faint}">Unsubscribe</a></p>
</div></body></html>`

  const text = [
    `Day ${day} of 7 · ${e.heading}`,
    '',
    e.idea,
    '',
    ...(personal ? [personal, ''] : []),
    ...opts.map((o) => `- ${o.name} (~${Math.round(o.grams)} g): ${o.detail}`),
    ...(opts.length ? [''] : []),
    ...e.paragraphs.flatMap((t) => [t, '']),
    `Tip: ${e.tip}`,
    '',
    `${e.cta}: ${ctaHref}`,
    '',
    '—',
    'Fiber values are approximate and not medical advice.',
    `Unsubscribe: ${unsubscribeUrl}`,
  ].join('\n')

  return { subject: e.subject, html, text }
}
