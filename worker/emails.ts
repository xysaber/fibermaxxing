/**
 * Free 7-day starter plan, one email per day. Gram figures match the calculator
 * (USDA FoodData Central SR Legacy × USDA household weights).
 */
export type PlanEmail = { subject: string; heading: string; paragraphs: string[]; tip: string }

export const PLAN_EMAILS: PlanEmail[] = [
  {
    subject: 'Day 1: find your fiber baseline',
    heading: 'Day 1 · Find your baseline',
    paragraphs: [
      'Welcome to the 7-day starter plan. Each day you get one small change, sized so your gut has time to adjust.',
      'Today, change nothing. Just log what you eat in the calculator tonight and note the total. Most U.S. adults land well under the 25 g (women 19–50) or 38 g (men 19–50) Adequate Intake.',
      'That number is your starting point. This week aims to add about 3–5 g a day, not to hit the target overnight.',
    ],
    tip: 'Log the whole day at once: “oatmeal, apple, turkey sandwich on white bread, pasta with tomato sauce”.',
  },
  {
    subject: 'Day 2: a breakfast that does half the work',
    heading: 'Day 2 · Upgrade breakfast',
    paragraphs: [
      'Breakfast is the easiest place to add fiber because it repeats.',
      'One cup of cooked oatmeal is about 4 g. Add 1 tablespoon of chia seeds (about 4.1 g) and you are near 8 g before 9 a.m.',
      'Not an oatmeal person? Two slices of whole-wheat toast with half an avocado works too.',
    ],
    tip: 'Measure oats after cooking. A cup of dry oats is a very different number from a cup of cooked oatmeal.',
  },
  {
    subject: 'Day 3: beans and lentils at lunch',
    heading: 'Day 3 · Add a legume',
    paragraphs: [
      'Legumes are the biggest single lever. One cup of cooked lentils is about 15.6 g; a cup of black beans is about 15 g.',
      'You don’t need a full cup. Half a cup of beans in a salad, soup or wrap adds roughly 7–8 g.',
      'If beans usually bother you, start with a few spoonfuls and build up over the week.',
    ],
    tip: 'Canned beans count. Rinse them to cut the sodium.',
  },
  {
    subject: 'Day 4: snacks that count',
    heading: 'Day 4 · Swap one snack',
    paragraphs: [
      'Swap one low-fiber snack for fruit. A medium pear is about 5.5 g, a medium apple about 4.4 g, and a cup of raspberries about 8 g.',
      'Keep the skin on apples and pears; that is where much of the fiber is.',
    ],
    tip: 'Put the fruit where you will see it at 3 p.m.',
  },
  {
    subject: 'Day 5: half the plate',
    heading: 'Day 5 · Vegetables and whole grains at dinner',
    paragraphs: [
      'Fill half of your dinner plate with vegetables. A cup of cooked broccoli is about 5.1 g.',
      'Switch one refined grain for a whole one: brown rice instead of white, whole-wheat pasta instead of regular.',
    ],
    tip: 'Frozen vegetables are just as useful and take two minutes.',
  },
  {
    subject: 'Day 6: go slow and drink water',
    heading: 'Day 6 · Comfort check',
    paragraphs: [
      'Some gas or bloating is common when you add fiber quickly. That is why this plan adds a few grams a day instead of jumping to the target.',
      'Drink water through the day as you eat more fiber. If something feels off, hold at today’s level for a few days before adding more.',
      'If you have a digestive condition, are pregnant, or take GLP-1 or other medication, follow your clinician’s advice first.',
    ],
    tip: 'Spread fiber across meals instead of one huge bowl.',
  },
  {
    subject: 'Day 7: your new normal',
    heading: 'Day 7 · Check your progress',
    paragraphs: [
      'Log today in the calculator and compare it with Day 1. Breakfast, one legume serving, one fruit snack and a vegetable-heavy dinner can add roughly 20 g to a typical day.',
      'Keep the two or three changes that felt easiest. Those are your defaults now.',
      'A longer 30-day plan with weekly meal plans and shopping lists is coming soon. We will let you know when it is ready.',
    ],
    tip: 'Bookmark the calculator so checking a day takes ten seconds.',
  },
]

const SITE = 'https://www.getfibermaxxing.com'

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function renderPlanEmail(day: number, unsubscribeUrl: string): {
  subject: string
  html: string
  text: string
} {
  const e = PLAN_EMAILS[day - 1]
  const calc = `${SITE}/?utm_source=email&utm_medium=plan&utm_campaign=day${day}`
  const html = `<!doctype html><html><body style="margin:0;background:#f5f3ec;font-family:-apple-system,Segoe UI,Inter,Arial,sans-serif;color:#13201a">
<div style="max-width:560px;margin:0 auto;padding:32px 20px">
<p style="margin:0 0 20px;font-weight:700;font-size:18px">GetFibermaxxing</p>
<div style="background:#ffffff;border:1px solid #e3e0d6;border-radius:16px;padding:28px">
<p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#1f6b45">Free 7-day starter plan</p>
<h1 style="margin:0 0 16px;font-size:24px;line-height:1.25">${esc(e.heading)}</h1>
${e.paragraphs.map((p) => `<p style="margin:0 0 14px;font-size:16px;line-height:1.6;color:#2e3a33">${esc(p)}</p>`).join('\n')}
<p style="margin:18px 0 22px;padding:14px 16px;background:#e7f2ea;border-radius:10px;font-size:15px;line-height:1.5"><b>Tip:</b> ${esc(e.tip)}</p>
<a href="${calc}" style="display:inline-block;background:#1f6b45;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:8px">Open the calculator</a>
</div>
<p style="margin:20px 0 0;font-size:12px;line-height:1.6;color:#5f6b64">Fiber values are approximate and not medical advice. You get this because you asked for the 7-day plan on getfibermaxxing.com. <a href="${unsubscribeUrl}" style="color:#5f6b64">Unsubscribe</a></p>
</div></body></html>`
  const text = [
    e.heading,
    '',
    ...e.paragraphs,
    '',
    `Tip: ${e.tip}`,
    '',
    `Open the calculator: ${calc}`,
    '',
    'Fiber values are approximate and not medical advice.',
    `Unsubscribe: ${unsubscribeUrl}`,
  ].join('\n')
  return { subject: e.subject, html, text }
}
