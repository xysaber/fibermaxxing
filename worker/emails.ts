/**
 * Free 7-day starter plan, one email per day. Gram figures match the calculator
 * (USDA FoodData Central SR Legacy × USDA household weights).
 *
 * Each email: one clear move for today, the grams it adds, a short why, a tip,
 * and a teaser for tomorrow.
 */
export type PlanEmail = {
  subject: string
  /** Inbox preview line shown after the subject. */
  preheader: string
  heading: string
  /** The one change to make today. */
  move: string
  /** Approximate grams the move adds, shown as a badge. */
  adds?: string
  paragraphs: string[]
  tip: string
  /** One-line teaser for tomorrow's email (omit on the last day). */
  next?: string
  cta: string
}

export const PLAN_EMAILS: PlanEmail[] = [
  {
    subject: 'Day 1: what’s your fiber number?',
    preheader: 'One 60-second check tonight. No changes yet.',
    heading: 'Find your starting number',
    move: 'Tonight, type everything you ate today into the calculator and write down the total.',
    paragraphs: [
      'Most U.S. adults eat about half the fiber they need. You can’t close a gap you haven’t measured, so today is only about the number.',
      'Over the next six days you’ll add one food at a time, about 3–5 g a day. Small steps give your gut time to adjust, which is how you avoid the bloating.',
    ],
    tip: 'Write it the way you’d say it: “oatmeal, apple, turkey sandwich, pasta with tomato sauce”. You can edit any portion after.',
    next: 'Tomorrow: a breakfast that gets you about 8 g before 9 a.m.',
    cta: 'Check today’s total',
  },
  {
    subject: 'Day 2: 8 g before 9 a.m.',
    preheader: 'The easiest meal to fix, because you eat it on repeat.',
    heading: 'Upgrade breakfast',
    move: 'Have a cup of cooked oatmeal with 1 tablespoon of chia seeds.',
    adds: '+8 g',
    paragraphs: [
      'Breakfast is the easiest place to start because it repeats. Fix it once and it keeps paying off.',
      'A cup of cooked oatmeal is about 4 g, and a tablespoon of chia adds about 4.1 g. Not an oatmeal person? Two slices of whole-wheat toast with half an avocado gets you to a similar number.',
    ],
    tip: 'Measure oats after cooking. A cup of dry oats is a very different number from a cup of cooked oatmeal.',
    next: 'Tomorrow: the single biggest fiber lever, and how to start small.',
    cta: 'Check your breakfast',
  },
  {
    subject: 'Day 3: the biggest lever is a can of beans',
    preheader: 'Half a cup adds about 7–8 g.',
    heading: 'Add a legume at lunch',
    move: 'Add half a cup of beans or lentils to lunch: in a salad, soup, wrap or bowl.',
    adds: '+7–8 g',
    paragraphs: [
      'Beans and lentils are among the highest-fiber foods you can buy. A full cup of cooked lentils is about 15.6 g, and black beans about 15 g.',
      'You don’t need a full cup. Half is plenty for now. If beans usually bother you, start with a few spoonfuls and build up over the week.',
    ],
    tip: 'Canned beans count. Rinse them to cut the sodium.',
    next: 'Tomorrow: a snack swap that adds 4–8 g without trying.',
    cta: 'Add it to your day',
  },
  {
    subject: 'Day 4: swap one snack',
    preheader: 'A pear beats a granola bar by about 4 g.',
    heading: 'Swap one snack for fruit',
    move: 'Replace one packaged snack with a pear, an apple or a cup of raspberries.',
    adds: '+4–8 g',
    paragraphs: [
      'A medium pear is about 5.5 g, a medium apple about 4.4 g, and a cup of raspberries about 8 g.',
      'Keep the skin on apples and pears. That’s where much of the fiber is.',
    ],
    tip: 'Put the fruit where you’ll see it at 3 p.m.',
    next: 'Tomorrow: one plate rule for dinner.',
    cta: 'Compare snacks',
  },
  {
    subject: 'Day 5: half the plate',
    preheader: 'One rule for dinner, and one grain swap.',
    heading: 'Fix dinner with one rule',
    move: 'Fill half your dinner plate with vegetables, and swap one refined grain for a whole one.',
    adds: '+5–8 g',
    paragraphs: [
      'A cup of cooked broccoli is about 5.1 g. Most vegetables you like will do the job.',
      'Then switch one grain: brown rice instead of white, or whole-wheat pasta instead of regular. Same meal, more fiber.',
    ],
    tip: 'Frozen vegetables count just as much and take two minutes.',
    next: 'Tomorrow: how to keep going without the bloating.',
    cta: 'Check your dinner',
  },
  {
    subject: 'Day 6: go slow and drink water',
    preheader: 'A little gas is normal. Here’s what to do about it.',
    heading: 'Comfort check',
    move: 'Spread today’s fiber across meals, and drink water through the day.',
    paragraphs: [
      'Some gas or bloating is common when you add fiber quickly. That’s why this plan adds a few grams a day instead of jumping straight to the target.',
      'If something feels off, stay at today’s level for a few days before adding more. If you have a digestive condition, are pregnant, or take GLP-1 or other medication, follow your clinician’s advice first.',
    ],
    tip: 'One huge high-fiber bowl is harder on your gut than the same fiber spread over three meals.',
    next: 'Tomorrow: compare with Day 1 and lock in your defaults.',
    cta: 'Open the calculator',
  },
  {
    subject: 'Day 7: compare with Day 1',
    preheader: 'See how far a week of small changes got you.',
    heading: 'Check your progress',
    move: 'Log today in the calculator and compare the total with your Day 1 number.',
    paragraphs: [
      'Breakfast, half a cup of beans, one fruit snack and a vegetable-heavy dinner can add roughly 20 g to a typical day.',
      'Keep the two or three changes that felt easiest. Those are your new defaults. A 30-day plan with weekly meal plans and shopping lists is coming soon, and we’ll let you know when it’s ready.',
    ],
    tip: 'Bookmark the calculator so checking a day takes ten seconds.',
    cta: 'See today’s total',
  },
]

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
  const e = PLAN_EMAILS[day - 1]
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
<p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${C.leaf}">Today’s move${e.adds ? ` <span style="display:inline-block;margin-left:6px;padding:2px 8px;border-radius:999px;background:${C.leaf};color:#ffffff;letter-spacing:0;text-transform:none">${esc(e.adds)}</span>` : ''}</p>
<p style="margin:0;font-size:17px;line-height:1.5;font-weight:600;color:${C.ink}">${esc(e.move)}</p>
</div>
${personal ? `<p style="margin:0 0 14px;font-size:16px;line-height:1.6;color:${C.ink};font-weight:600">${esc(personal)}</p>` : ''}
${e.paragraphs.map((p) => `<p style="margin:0 0 14px;font-size:16px;line-height:1.6;color:${C.soft}">${esc(p)}</p>`).join('\n')}
<p style="margin:6px 0 24px;padding:0 0 0 14px;border-left:3px solid ${C.leaf};font-size:15px;line-height:1.55;color:${C.soft}"><b style="color:${C.ink}">Tip:</b> ${esc(e.tip)}</p>
<a href="${calc}" style="display:inline-block;background:${C.leaf};color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;padding:13px 22px;border-radius:8px">${esc(e.cta)}</a>
${e.next ? `<p style="margin:24px 0 0;padding-top:16px;border-top:1px solid ${C.line};font-size:14px;line-height:1.5;color:${C.faint}">${esc(e.next)}</p>` : ''}
</div>
<p style="margin:20px 4px 0;font-size:12px;line-height:1.6;color:${C.faint}">Fiber values are approximate and not medical advice. You’re getting this because you asked for the 7-day plan on getfibermaxxing.com. <a href="${unsubscribeUrl}" style="color:${C.faint}">Unsubscribe</a></p>
</div></body></html>`

  const text = [
    `Day ${day} of 7 · ${e.heading}`,
    '',
    `TODAY’S MOVE${e.adds ? ` (${e.adds})` : ''}: ${e.move}`,
    '',
    ...(personal ? [personal, ''] : []),
    ...e.paragraphs.flatMap((p) => [p, '']),
    `Tip: ${e.tip}`,
    '',
    `${e.cta}: ${calc}`,
    ...(e.next ? ['', e.next] : []),
    '',
    '—',
    'Fiber values are approximate and not medical advice.',
    `Unsubscribe: ${unsubscribeUrl}`,
  ].join('\n')

  return { subject: e.subject, html, text }
}
