/**
 * Day-3 local acceptance: longtail SEO content + calculator remount wiring.
 * Writes reports/2026-10-28/local-acceptance.json
 */
import assert from 'node:assert/strict'
import { execSync } from 'node:child_process'
import { mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const pages = JSON.parse(readFileSync(path.join(root, 'src/content/seo-pages.json'), 'utf8'))
const published = pages.filter((p) => p.publish)
const bySlug = Object.fromEntries(pages.map((p) => [p.slug, p]))

const NEW_SLUGS = ['what-is-fibermaxxing', 'fibermaxxing-foods', 'fibermaxxing-smoothie']
const CORE_PUBLISHED = [
  ...NEW_SLUGS,
  'how-much-fiber-per-day',
  'oatmeal',
  'chia-seeds',
  'high-fiber-breakfast',
]
const FORBIDDEN_NEW = ['fibermaxxing-diet', 'fibermaxxing-trend']

const results = []
function check(name, fn) {
  try {
    fn()
    results.push({ name, ok: true })
    console.log(`PASS  ${name}`)
  } catch (err) {
    results.push({ name, ok: false, error: String(err.message || err) })
    console.error(`FAIL  ${name}: ${err.message || err}`)
  }
}

check('published set includes +3 new slugs', () => {
  for (const s of NEW_SLUGS) {
    assert.ok(bySlug[s], `missing page ${s}`)
    assert.equal(bySlug[s].publish, true, `${s} not published`)
  }
})

check('no diet/trend SEO pages', () => {
  for (const s of FORBIDDEN_NEW) assert.equal(bySlug[s], undefined, `unexpected ${s}`)
})

check('high-fiber-foods draft upgraded away', () => {
  assert.equal(bySlug['high-fiber-foods'], undefined)
})

check('each core page has answer, faqs, defaultMeal, sections', () => {
  for (const s of CORE_PUBLISHED) {
    const p = bySlug[s]
    assert.ok(p, s)
    assert.ok(p.answer?.value, `${s} missing answer`)
    assert.ok(p.defaultMeal?.trim(), `${s} missing defaultMeal`)
    assert.ok(Array.isArray(p.faqs) && p.faqs.length >= 2, `${s} faqs`)
    assert.ok(Array.isArray(p.sections) && p.sections.length >= 1, `${s} sections`)
  }
})

check('fiber-day answer still 25–38', () => {
  const a = bySlug['how-much-fiber-per-day'].answer
  assert.match(a.value, /25/)
  assert.match(a.value, /38/)
})

check('what-is definition climax; foods keeps citability grams', () => {
  const what = bySlug['what-is-fibermaxxing'].answer
  const foods = bySlug['fibermaxxing-foods'].answer
  assert.match(what.value, /fiber/i)
  assert.ok(!what.unit)
  assert.match(what.detail, /25/)
  assert.match(what.detail, /38/)
  assert.match(foods.value, /15/)
  assert.equal(foods.unit, 'g')
})

check('hero intro lede present for published pages', () => {
  for (const s of CORE_PUBLISHED) {
    const intro = bySlug[s].intro
    assert.ok(Array.isArray(intro) && intro[0]?.trim(), `${s} missing intro[0] lede`)
  }
})

check('CTAs use Estimate (not Log/Calculate this bowl default)', () => {
  for (const s of CORE_PUBLISHED) {
    const cta = bySlug[s].calculatorCta || ''
    assert.match(cta, /Estimate/i, `${s} cta=${cta}`)
    assert.doesNotMatch(cta, /\bLog\b/)
  }
})

check('what-is definition has no Cite this prefix', () => {
  const blob = JSON.stringify(bySlug['what-is-fibermaxxing'].sections || [])
  assert.doesNotMatch(blob, /Cite this:/i)
  assert.match(blob, /Fibermaxxing means deliberately eating enough dietary fiber/i)
})

check('foods copy describes paste-a-mix (not per-food deep links)', () => {
  const foods = bySlug['fibermaxxing-foods']
  assert.match(foods.calculatorCta || '', /sample meal|mixed meal|Estimate/i)
  const faq = (foods.faqs || []).find((f) => /calculator|list/i.test(f.q))
  assert.ok(faq, 'foods calculator FAQ')
  assert.match(faq.a, /Paste/i)
  const how = (foods.sections || []).find((s) => /estimate from this list|Paste a mix/i.test(s.heading))
  assert.ok(how, 'foods how-to section')
})

check('footer-ready: oatmeal related trimmed to 4', () => {
  assert.equal(bySlug.oatmeal.related.length, 4)
})

check('published defaultMeals are unique (no shared prefill)', () => {
  const meals = published.map((p) => [p.slug, p.defaultMeal.trim().toLowerCase()])
  const seen = new Map()
  for (const [slug, meal] of meals) {
    if (seen.has(meal)) {
      throw new Error(`duplicate defaultMeal: ${seen.get(meal)} and ${slug}`)
    }
    seen.set(meal, slug)
  }
})

check('oatmeal vs breakfast meals differ', () => {
  assert.notEqual(
    bySlug.oatmeal.defaultMeal.trim().toLowerCase(),
    bySlug['high-fiber-breakfast'].defaultMeal.trim().toLowerCase(),
  )
})

check('related links only point at published pages', () => {
  for (const p of published) {
    for (const rel of p.related || []) {
      assert.ok(bySlug[rel]?.publish, `${p.slug} related→${rel} not published`)
    }
  }
})

check('change-scope mutual links', () => {
  const has = (slug, rel) => (bySlug[slug].related || []).includes(rel)
  assert.ok(has('how-much-fiber-per-day', 'what-is-fibermaxxing'))
  assert.ok(has('oatmeal', 'fibermaxxing-foods'))
  assert.ok(has('oatmeal', 'chia-seeds'))
  assert.ok(has('oatmeal', 'how-much-fiber-per-day'))
  // smoothie ↔ breakfast / foods (oatmeal related trimmed; smoothie still reaches oats via foods)
  assert.ok(has('fibermaxxing-foods', 'high-fiber-breakfast'))
  assert.ok(has('high-fiber-breakfast', 'fibermaxxing-smoothie'))
  assert.ok(has('chia-seeds', 'fibermaxxing-smoothie') || has('chia-seeds', 'fibermaxxing-foods'))
})

check('GuidesStrip has 7 cards incl. new three', () => {
  const src = readFileSync(path.join(root, 'src/components/GuidesStrip.tsx'), 'utf8')
  const tos = [...src.matchAll(/to:\s*'(\/[^']+)'/g)].map((m) => m[1])
  assert.equal(tos.length, 7, `expected 7 guides, got ${tos.length}: ${tos}`)
  for (const s of NEW_SLUGS) assert.ok(tos.includes(`/${s}`), `Guides missing /${s}`)
})

check('FiberCalculator remounts per slug (key={page.slug})', () => {
  const src = readFileSync(path.join(root, 'src/pages/SeoLandingPage.tsx'), 'utf8')
  assert.match(src, /key=\{page\.slug\}/)
})

check('phrase answer CSS present', () => {
  const css = readFileSync(path.join(root, 'src/index.css'), 'utf8')
  assert.match(css, /seo-answer--phrase/)
  assert.match(css, /seo-answer-value--phrase/)
  const ans = readFileSync(path.join(root, 'src/components/SeoAnswer.tsx'), 'utf8')
  assert.match(ans, /isPhraseAnswer/)
  assert.match(ans, /showNote/)
})

check('privacy/terms pages untouched in git diff', () => {
  const diff = execSync('git diff HEAD --name-only -- src/pages/LegalPage.tsx', {
    cwd: root,
    encoding: 'utf8',
  }).trim()
  assert.equal(diff, '')
})

check('each published defaultMeal parses (≥1 matched food)', () => {
  const tmp = path.join(root, 'scripts/.tmp-parse-default-meals.mjs')
  writeFileSync(
    tmp,
    `import { parseMeal } from '../src/lib/parseMeal.ts'
import pages from '../src/content/seo-pages.json' with { type: 'json' }
const pub = pages.filter((p) => p.publish)
const fails = []
for (const p of pub) {
  const r = parseMeal(p.defaultMeal)
  if ((r.matches?.length ?? 0) < 1) fails.push(p.slug + ': ' + (r.error || 'no matches'))
}
if (fails.length) {
  console.error(fails.join('\\n'))
  process.exit(1)
}
console.log('parsed', pub.length, 'meals')
`,
  )
  try {
    execSync(`node --import tsx ${JSON.stringify(tmp)}`, {
      cwd: root,
      stdio: 'pipe',
      encoding: 'utf8',
    })
  } finally {
    try {
      unlinkSync(tmp)
    } catch {
      /* ignore */
    }
  }
})

const failed = results.filter((r) => !r.ok)
const summary = {
  at: new Date().toISOString(),
  total: results.length,
  passed: results.filter((r) => r.ok).length,
  failed: failed.length,
  publishedSlugs: published.map((p) => p.slug),
  defaultMeals: Object.fromEntries(published.map((p) => [p.slug, p.defaultMeal])),
  results,
}

const outDir = path.join(root, 'reports/2026-10-28')
mkdirSync(outDir, { recursive: true })
writeFileSync(path.join(outDir, 'local-acceptance.json'), JSON.stringify(summary, null, 2) + '\n')

console.log('\n---')
console.log(`Day3 content checks: ${summary.passed}/${summary.total} passed`)
if (failed.length) {
  console.error('FAILED:', failed.map((f) => f.name).join(', '))
  process.exit(1)
}
