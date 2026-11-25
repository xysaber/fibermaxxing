/**
 * Generate per-food fiber pages, the /fiber-in-foods hub, and audience pages.
 *
 *   node --import tsx scripts/food-pages/build.mjs
 *
 * Every gram figure is computed from src/data/usda-foods.json (USDA FoodData
 * Central SR Legacy + reviewed curated rows) so pages and the calculator agree.
 * Writes src/content/pages/<slug>.json and src/content/guides-index.json.
 * Fails if an example meal does not resolve to the expected foods.
 */
import { mkdirSync, readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseMeal } from '../../src/lib/parseMeal.ts'
import { LEGUMES_GRAINS } from './foods-legumes-grains.mjs'
import { FRUIT } from './foods-fruit.mjs'
import { VEG_NUTS } from './foods-veg-nuts.mjs'
import { AUDIENCE } from './audience.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const outDir = join(root, 'src/content/pages')
const UPDATED = '2026-11-25'
const DV = 28

const usda = JSON.parse(readFileSync(join(root, 'src/data/usda-foods.json'), 'utf8')).foods
const CURATED = {
  'curated:split-pea-soup': { name: 'Split pea soup (typical recipe, site estimate)', fiber100g: 2.0, kcal100g: 70 },
  'curated:white-bread': { name: 'Bread, white, commercially prepared', fiber100g: 2.7, kcal100g: 266, fdc: '174924' },
}
const rowById = Object.fromEntries(usda.map((f) => [f.id, f]))
function row(id) {
  const r = rowById[id] ?? CURATED[id]
  if (!r) throw new Error(`Unknown food row ${id}`)
  return r
}
const cleanName = (n) => n.replace(/\s*\(Includes foods for USDA's Food Distribution Program\)/, '')

const r1 = (n) => Math.round(n * 10) / 10
const fmt = (n) => (n >= 10 ? r1(n).toFixed(1) : r1(n).toFixed(1)).replace(/\.0$/, '')
const fmtG = (g) => `${Number.isInteger(g) ? g : r1(g)} g`

const CATS = {
  legumes: { label: 'Beans & legumes', plural: 'beans and legumes' },
  grains: { label: 'Grains & bread', plural: 'grains' },
  fruit: { label: 'Fruit', plural: 'fruits' },
  vegetables: { label: 'Vegetables', plural: 'vegetables' },
  nuts: { label: 'Nuts, seeds & more', plural: 'nuts, seeds, and treats' },
}

const FOODS = [...LEGUMES_GRAINS, ...FRUIT, ...VEG_NUTS]
if (FOODS.length !== 50) throw new Error(`Expected 50 foods, got ${FOODS.length}`)

// ——— Numbers ———
for (const f of FOODS) {
  f.pageSlug = `fiber-in-${f.slug}`
  f.display = f.title.replace(/^an? /, '')
  f.portionRows = f.portions.map(([label, g, id = f.row]) => {
    const r = row(id)
    return { label, g, id, fiber: (r.fiber100g * g) / 100, kcal: (r.kcal100g * g) / 100 }
  })
  const base = row(f.row)
  f.f100 = base.fiber100g
  f.k100 = base.kcal100g
  f.primary = f.portionRows[0]
  f.per100kcal = (f.f100 / f.k100) * 100
}

const bySlug = Object.fromEntries(FOODS.map((f) => [f.slug, f]))
const EXTERNAL_LINKS = {
  'chia-seeds': { label: 'chia seeds', href: '/chia-seeds', text: 'about 4.1 g per tablespoon' },
}

function tokens(text) {
  return text
    .replace(/\{\{g:([a-z-]+)\}\}/g, (_, s) => `${fmt(need(s).primary.fiber)} g`)
    .replace(/\{\{link:([a-z0-9-]+)\}\}/g, (_, s) => {
      if (EXTERNAL_LINKS[s]) {
        const e = EXTERNAL_LINKS[s]
        return `[${e.label}](${e.href}) (${e.text})`
      }
      const f = need(s)
      return `[${f.name.replace(/^an? /, '')}](/${f.pageSlug}) (${fmt(f.primary.fiber)} g, ${f.primary.label})`
    })
    .replace(/\{\{top-density\}\}/g, () =>
      [...FOODS]
        .sort((a, b) => b.per100kcal - a.per100kcal)
        .slice(0, 10)
        .map((f) => `[${f.name.replace(/^an? /, '')}](/${f.pageSlug}) (${fmt(f.per100kcal)} g)`)
        .join(', '),
    )
    .replace(/\{\{([a-z-]+)\}\}/g, (_, s) => {
      const f = need(s)
      return `about ${fmt(f.primary.fiber)} g (${f.primary.label})`
    })
}
function need(slug) {
  const f = bySlug[slug]
  if (!f) throw new Error(`Unknown food token ${slug}`)
  return f
}

// ——— Example meals must parse to the right foods ———
function checkMeal(meal, label) {
  const res = parseMeal(meal)
  const parts = meal.split(',').length
  if (res.matches.length !== parts || res.estimatedCount > 0 || res.unmatchedHints.length) {
    throw new Error(
      `${label}: "${meal}" → ${res.matches.map((m) => m.food.name).join(' | ')} (est ${res.estimatedCount}, unmatched ${res.unmatchedHints.join(',')})`,
    )
  }
  return res
}

const pctDv = (g) => Math.round((g / DV) * 100)

const TITLE_UNIT = {
  artichoke: 'Artichoke', avocado: 'Avocado', broccoli: 'Cup', 'butternut-squash': 'Cup', carrots: 'Carrot',
  dates: 'Date', 'pumpkin-seeds': 'Oz', mango: 'Cup', 'whole-wheat-pasta': 'Cup', guava: 'Guava', kiwi: 'Kiwi',
  prunes: '5 Prunes', 'dried-figs': '1/4 Cup', 'wheat-bran': '2 Tbsp', hummus: '2 Tbsp', 'peanut-butter': '2 Tbsp',
  popcorn: '3 Cups', almonds: 'Ounce', pistachios: 'Ounce', walnuts: 'Ounce', 'dark-chocolate': 'Ounce',
}
function titleUnit(label) {
  const t = label
    .replace(/\(.*?\)/g, '')
    .replace(/,.*$/, '')
    .replace(/^1 /, '')
    .trim()
  return t.charAt(0).toUpperCase() + t.slice(1)
}

function foodPage(f) {
  const p = f.primary
  const cat = CATS[f.cat]
  const peers = FOODS.filter((x) => x.cat === f.cat)
  const rankServing = [...peers].sort((a, b) => b.primary.fiber - a.primary.fiber).indexOf(f) + 1
  const rankDensity = [...peers].sort((a, b) => b.per100kcal - a.per100kcal).indexOf(f) + 1
  const neighbors = [...peers]
    .filter((x) => x !== f)
    .sort((a, b) => Math.abs(a.primary.fiber - p.fiber) - Math.abs(b.primary.fiber - p.fiber))
    .slice(0, 3)
  const allRank = [...FOODS].sort((a, b) => b.per100kcal - a.per100kcal).indexOf(f) + 1

  const meal = checkMeal(f.meal, f.slug)
  const mealFiber = r1(meal.totalFiberG)
  const ids = new Set([f.row, ...(f.calcIds ?? [])])
  const mine = meal.matches.find((m) => ids.has(m.food.id))
  if (!mine) throw new Error(`${f.slug}: example meal does not include ${f.row}`)

  const baseName = cleanName(row(f.row).name)
  const densityLine =
    f.per100kcal >= 3
      ? `That works out to ${fmt(f.per100kcal)} g of fiber per 100 calories, a high ratio: you get a lot of fiber for the calories.`
      : f.per100kcal < 1.5
        ? `That works out to ${fmt(f.per100kcal)} g of fiber per 100 calories. ${cap(f.name)} ${plural(f) ? 'are' : 'is'} calorie-dense, so the portion matters more than the fiber per gram.`
        : `That works out to ${fmt(f.per100kcal)} g of fiber per 100 calories, in the middle of the range for the foods on this site.`

  const sections = [
    {
      heading: `How much fiber is in ${f.name}?`,
      paragraphs: [
        `USDA FoodData Central lists ${baseName.toLowerCase()} at ${f.f100} g of fiber per 100 g. One serving (${p.label}; ${fmtG(p.g)}) therefore has about ${fmt(p.fiber)} g of fiber and ${Math.round(p.kcal)} calories. That is ${pctDv(p.fiber)}% of the ${DV} g Daily Value on U.S. Nutrition Facts labels, or ${Math.round((p.fiber / 25) * 100)}% of a 25 g day and ${Math.round((p.fiber / 38) * 100)}% of a 38 g day.`,
        tokens(f.why),
      ],
    },
    { heading: f.prep.heading, paragraphs: f.prep.paragraphs.map(tokens) },
    {
      heading: `How ${f.name.replace(/^an? /, '')} compare${plural(f) ? '' : 's'} with other ${cat.plural}`,
      paragraphs: [
        `Of the ${peers.length} ${cat.plural} on this site, ${f.name.replace(/^an? /, '')} rank${plural(f) ? '' : 's'} #${rankServing} for fiber per typical serving and #${rankDensity} for fiber per calorie. ${densityLine}`,
        `Close neighbors by serving: ${neighbors
          .map((n) => `[${n.name.replace(/^an? /, '')}](/${n.pageSlug}) at ${fmt(n.primary.fiber)} g (${n.primary.label})`)
          .join('; ')}. Across all 50 foods in the [fiber-in-foods table](/fiber-in-foods), ${f.name.replace(/^an? /, '')} ${plural(f) ? 'are' : 'is'} #${allRank} for fiber per calorie.`,
      ],
    },
    {
      heading: `Adding ${f.name.replace(/^an? /, '')} to your day`,
      paragraphs: [
        tokens(f.tips),
        `Example: ${f.meal}. Using the same USDA values as the calculator, that comes to about ${mealFiber} g of fiber${mine ? `, with ${fmt(mine.fiberG)} g from the ${f.name.replace(/^an? /, '')}` : ''}. Adjust the amounts in the calculator to match your plate.`,
      ],
    },
  ]

  const second = f.portionRows[1]
  const faqs = [
    {
      q: `How much fiber is in 100 g of ${f.name.replace(/^an? /, '')}?`,
      a: `${f.f100} g, according to USDA FoodData Central (${baseName}). That is the figure every portion on this page is scaled from.`,
    },
    {
      q: `How much fiber is in ${f.name.replace(/^an? /, '')} (${second.label})?`,
      a: `About ${fmt(second.fiber)} g${second.id !== f.row ? ` (${cleanName(row(second.id).name)})` : ''}, for ${fmtG(second.g)}. Weigh your portion or edit grams in the calculator for a closer estimate.`,
    },
    ...f.faqs.map((x) => ({ q: x.q, a: tokens(x.a) })),
  ]

  const rowIds = [...new Set(f.portionRows.map((r) => r.id))]
  const sources = [
    ...rowIds.map((id) => {
      const r = row(id)
      const fdc = /^\d+$/.test(id) ? id : r.fdc
      return fdc
        ? {
            label: `USDA FoodData Central: ${cleanName(r.name)} (FDC ${fdc})`,
            url: `https://fdc.nal.usda.gov/food-details/${fdc}/nutrients`,
            note: `${r.fiber100g} g fiber and ${r.kcal100g} kcal per 100 g`,
          }
        : null
    }),
    {
      label: 'U.S. FDA, Dietary Fiber on the Nutrition Facts Label',
      url: 'https://www.accessdata.fda.gov/scripts/interactiveNutritionFactsLabel/dietary-fiber.cfm',
      note: `${DV} g Daily Value used for the % figures`,
    },
    ...(f.extraSources ?? []),
    {
      label: 'Mayo Clinic, Dietary fiber: Essential for a healthy diet',
      url: 'https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/fiber/art-20043983',
      note: 'increase fiber gradually and drink enough water',
    },
  ].filter(Boolean)

  const unit = TITLE_UNIT[f.slug] ?? titleUnit(p.label)
  return {
    slug: f.pageSlug,
    publish: true,
    layout: 'bands',
    kind: 'food',
    category: f.cat,
    title: `How Much Fiber in ${f.title}? ${fmt(p.fiber)}g per ${unit}`,
    description: `${f.display}: about ${fmt(p.fiber)} g of fiber per ${p.label.replace(/\s*\(.*?\)/g, '')} (${pctDv(p.fiber)}% DV), from USDA FoodData Central. Portion table, comparisons, free calculator.`,
    h1: `How much fiber is in ${f.name}?`,
    answer: {
      value: `~${fmt(p.fiber)}`,
      unit: 'g',
      detail: p.label.includes(')') ? `fiber in ${p.label}, ${fmtG(p.g)}` : `fiber in ${p.label} (${fmtG(p.g)})`,
      note: `USDA FoodData Central, ${baseName}`,
    },
    intro: [
      `${cap(f.name.replace(/^an? /, ''))} rank${plural(f) ? '' : 's'} #${rankServing} of ${peers.length} ${cat.plural} on this site for fiber per serving. Every figure below is scaled from USDA FoodData Central, the same data the calculator uses.`,
    ],
    facts: [
      { label: cap(p.label), value: `${fmt(p.fiber)} g`, note: `${Math.round(p.kcal)} kcal` },
      { label: 'Per 100 g', value: `${f.f100} g`, note: 'USDA FoodData Central' },
      { label: 'Per 100 kcal', value: `${fmt(f.per100kcal)} g`, note: `#${allRank} of 50 foods here` },
      { label: 'Daily Value', value: `${pctDv(p.fiber)}%`, note: `of ${DV} g, per ${p.label.split(',')[0]}` },
    ],
    dataTable: {
      caption: `Fiber in ${f.display.toLowerCase()} by portion`,
      note: `Fiber and calories are scaled from USDA FoodData Central per-100 g values (rows listed under Sources). % Daily Value uses the ${DV} g reference on U.S. Nutrition Facts labels. Brands, ripeness, and cooking change real values.`,
      columns: ['Portion', 'Weight', 'Fiber', 'Calories', '% Daily Value'],
      rows: f.portionRows.map((r) => [cap(r.label), fmtG(r.g), `${fmt(r.fiber)} g`, `${Math.round(r.kcal)}`, `${pctDv(r.fiber)}%`]),
    },
    sections,
    defaultSex: 'female',
    defaultAge: '19-50',
    defaultMode: 'standard',
    defaultMeal: f.meal,
    examples: [f.meal],
    calculatorCta: 'Estimate this meal',
    articleCta: `Estimate your ${f.name.replace(/^an? /, '')} meal in the calculator`,
    faqs,
    related: [...neighbors.slice(0, 2).map((n) => n.pageSlug), 'fiber-in-foods'],
    updated: UPDATED,
    sources,
  }
}

function plural(f) {
  return !/^an? /.test(f.name) && /s$/.test(f.name) && !['hummus', 'quinoa'].includes(f.slug)
}
function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
/** "1 cup, cooked" → "1 cup of cooked"? Keep simple: "1 cup, cooked" stays; "2 tbsp" stays. */
function withArticle(label) {
  return label
}

// ——— Hub page ———
function hubPage() {
  const sorted = [...FOODS].sort((a, b) => b.primary.fiber - a.primary.fiber)
  const top = sorted[0]
  return {
    slug: 'fiber-in-foods',
    publish: true,
    layout: 'bands',
    kind: 'hub',
    title: 'Fiber in Foods: 50 Common Foods by Grams per Serving',
    description:
      'Fiber per serving, per 100 g, and per 100 calories for 50 common foods, from USDA FoodData Central. Beans, grains, fruit, vegetables, nuts and seeds.',
    h1: 'Fiber in 50 common foods',
    answer: {
      value: '50',
      detail: 'foods with fiber per serving, per 100 g, and per 100 calories, all from USDA FoodData Central.',
    },
    intro: [
      'Pick a food for its own page with portion sizes, cooked vs raw, and comparisons. The table below ranks every food by fiber per typical serving.',
    ],
    facts: [
      { label: 'Most per serving', value: `${fmt(top.primary.fiber)} g`, note: `${top.display}, ${top.primary.label}` },
      { label: 'Daily Value', value: `${DV} g`, note: 'U.S. Nutrition Facts label' },
      { label: 'Women 19–50', value: '25 g/day', note: 'U.S. Adequate Intake' },
      { label: 'Men 19–50', value: '38 g/day', note: 'U.S. Adequate Intake' },
    ],
    guideGroups: Object.entries(CATS).map(([id, c]) => ({
      title: c.label,
      items: FOODS.filter((f) => f.cat === id)
        .sort((a, b) => b.primary.fiber - a.primary.fiber)
        .map((f) => f.pageSlug),
    })),
    dataTable: {
      caption: 'All 50 foods ranked by fiber per serving',
      note: `Scaled from USDA FoodData Central per-100 g values. % Daily Value uses ${DV} g. Each food’s page links its exact USDA record.`,
      columns: ['Food', 'Serving', 'Fiber', 'Per 100 g', 'Per 100 kcal'],
      rows: sorted.map((f) => [
        f.display,
        f.primary.label,
        `${fmt(f.primary.fiber)} g`,
        `${f.f100} g`,
        `${fmt(f.per100kcal)} g`,
      ]),
    },
    sections: [
      {
        heading: 'How to read this table',
        paragraphs: [
          'Fiber per serving tells you what one realistic portion adds to your day. Fiber per 100 g compares foods by weight, which favors dry foods like bran, seeds, and dried fruit. Fiber per 100 calories shows how much fiber you get for the energy, which favors berries and cooked vegetables.',
          'No single column is the “right” one. Beans lead per serving, seeds and bran lead per gram, and vegetables and berries lead per calorie. A high-fiber day usually mixes all three.',
        ],
      },
      {
        heading: 'Why serving size changes the ranking',
        paragraphs: [
          'Cooking, drying, and packing all change how much food fits in a cup. A cup of raw spinach weighs about 30 g; a cup of cooked spinach weighs about 180 g. Dried fruit concentrates fiber and sugar by removing water. Each food page shows several portions so you can match what you actually eat.',
          'Labels on packaged foods use set reference amounts that may differ from the portions here. When you have the package, its label is the best source for that product.',
        ],
      },
      {
        heading: 'Where the numbers come from',
        paragraphs: [
          'Every figure is scaled from USDA FoodData Central (SR Legacy) fiber per 100 g, the same data the calculator uses. Each food page links its exact USDA record. Daily Value percentages use 28 g, the reference on U.S. Nutrition Facts labels. See [about and editorial standards](/about) for how figures are reviewed.',
        ],
      },
    ],
    defaultSex: 'female',
    defaultAge: '19-50',
    defaultMode: 'standard',
    defaultMeal: '1 cup black beans, 1 cup brown rice, 1 cup broccoli',
    examples: ['1 cup black beans, 1 cup brown rice, 1 cup broccoli', '1 cup raspberries, 1 cup oatmeal, 1 tbsp chia seeds'],
    calculatorCta: 'Estimate a meal',
    articleCta: 'Estimate your own meal in the calculator',
    faqs: [
      {
        q: 'Which food has the most fiber per serving?',
        a: `Among the 50 foods here, ${top.display.toLowerCase()} lead at ${fmt(top.primary.fiber)} g per ${top.primary.label}. Most beans and lentils are close behind.`,
      },
      {
        q: 'Which foods have the most fiber per calorie?',
        a: `Cooked vegetables and berries. The top three here are ${[...FOODS]
          .sort((a, b) => b.per100kcal - a.per100kcal)
          .slice(0, 3)
          .map((f) => `${f.display.toLowerCase()} (${fmt(f.per100kcal)} g per 100 kcal)`)
          .join(', ')}.`,
      },
      {
        q: 'How much fiber should I eat per day?',
        a: 'The U.S. Adequate Intake is about 25 g a day for women and 38 g for men aged 19–50, and 28 g during pregnancy. See [how much fiber per day](/how-much-fiber-per-day).',
      },
    ],
    related: ['fibermaxxing-foods', 'how-much-fiber-per-day', 'fiber-for-weight-loss'],
    updated: UPDATED,
    sources: [
      { label: 'USDA FoodData Central (SR Legacy)', url: 'https://fdc.nal.usda.gov/', note: 'fiber and calories per 100 g for every food' },
      {
        label: 'U.S. FDA, Dietary Fiber on the Nutrition Facts Label',
        url: 'https://www.accessdata.fda.gov/scripts/interactiveNutritionFactsLabel/dietary-fiber.cfm',
        note: `${DV} g Daily Value`,
      },
      {
        label: 'Dietary Guidelines for Americans, 2020–2025 (USDA/HHS)',
        url: 'https://www.dietaryguidelines.gov/sites/default/files/2020-12/Dietary_Guidelines_for_Americans_2020-2025.pdf',
        note: 'fiber targets by age and sex',
      },
    ],
  }
}

function audiencePage(a) {
  for (const m of [a.defaultMeal, ...a.examples]) checkMeal(m, a.slug)
  return {
    ...a,
    publish: true,
    layout: 'bands',
    calculatorCta: 'Estimate this meal',
    articleCta: 'Estimate a meal in the calculator',
    sections: a.sections.map((s) => ({ heading: s.heading, paragraphs: s.paragraphs.map(tokens) })),
    faqs: a.faqs.map((f) => ({ q: f.q, a: tokens(f.a) })),
  }
}

// ——— Write ———
mkdirSync(outDir, { recursive: true })
for (const f of readdirSync(outDir)) rmSync(join(outDir, f))
const pages = [...FOODS.map(foodPage), hubPage(), ...AUDIENCE.map(audiencePage)]
for (const p of pages) {
  const text = JSON.stringify(p)
  const left = text.match(/\{\{[^}]*\}\}/)
  if (left) throw new Error(`${p.slug}: unexpanded token ${left[0]}`)
  writeFileSync(join(outDir, `${p.slug}.json`), `${JSON.stringify(p, null, 2)}\n`)
}

const AUDIENCE_CARD = {
  'fiber-on-glp-1': ['Fiber on GLP-1 meds', 'Targets, small-appetite foods, and constipation tips.', '25–38 g'],
  'fiber-for-weight-loss': ['Fiber for weight loss', 'What a 30 g/day trial found, and the best foods per calorie.', '30 g'],
  'fiber-for-ibs': ['Fiber for IBS', 'Soluble vs insoluble, and lower-FODMAP fiber sources.', 'Soluble'],
  'fiber-during-pregnancy': ['Fiber in pregnancy', '28 g a day, constipation, and easy high-fiber foods.', '28 g'],
}
const index = [
  ...FOODS.map((f) => ({
    slug: f.pageSlug,
    kind: 'food',
    category: f.cat,
    title: `${cap(f.display.toLowerCase())} fiber`,
    blurb: `${fmt(f.primary.fiber)} g per ${f.primary.label}, from USDA data.`,
    stat: `${fmt(f.primary.fiber)} g`,
  })),
  { slug: 'fiber-in-foods', kind: 'hub', title: 'Fiber in 50 foods', blurb: 'Every food ranked per serving, per 100 g, and per calorie.', stat: '50' },
  ...AUDIENCE.map((a) => ({
    slug: a.slug,
    kind: 'audience',
    title: AUDIENCE_CARD[a.slug][0],
    blurb: AUDIENCE_CARD[a.slug][1],
    stat: AUDIENCE_CARD[a.slug][2],
  })),
]
writeFileSync(join(root, 'src/content/guides-index.json'), `${JSON.stringify(index, null, 2)}\n`)

for (const p of pages) if (p.title.length > 62) console.warn('long title', p.title.length, p.title)
console.log('wrote %d pages', pages.length)
