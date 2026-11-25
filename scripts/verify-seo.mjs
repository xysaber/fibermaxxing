import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'

function parseJsonLd(html) {
  return [...html.matchAll(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/g)].map((m) =>
    JSON.parse(m[1]),
  )
}

const longTail = readdirSync('src/content/pages').filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(`src/content/pages/${f}`, 'utf8')))
const pages = [...JSON.parse(readFileSync('src/content/seo-pages.json', 'utf8')), ...longTail].filter(p => p.publish)
assert.equal(longTail.filter((p) => p.kind === 'food').length, 50, '50 per-food pages')
for (const p of longTail) {
  assert.ok(p.title.length <= 62, `${p.slug}: title too long`)
  assert.ok(p.description.length <= 160, `${p.slug}: description too long`)
  assert.ok(p.sources?.length >= 3, `${p.slug}: needs sources`)
  if (p.kind === 'audience') assert.ok(p.callout?.text?.includes('not medical advice'), `${p.slug}: medical callout`)
}
const legalSlugs = ['privacy', 'terms']
const homeSchema = JSON.parse(readFileSync('src/content/schema/home.json', 'utf8'))
const oatmealSchema = JSON.parse(readFileSync('src/content/schema/oatmeal.json', 'utf8'))
for (const path of ['index', ...pages.map(p => p.slug)]) {
  const html = readFileSync(`dist/${path}.html`, 'utf8')
  assert.match(html, /<div id="root"><div class="app( home-v3)?">/)
  assert.doesNotMatch(html, /<noscript/)
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1)
  assert.match(html, new RegExp(`<link rel="canonical" href="https://www.getfibermaxxing.com/${path === 'index' ? '' : path}"`))
  if (path !== 'index') {
    assert.equal((html.match(/<article /g) || []).length, pages.find(p => p.slug === path).sections.length)
    assert.match(html, /aria-label="On this page"/)
  }
  // Guides carry one Article (byline + dateModified); home carries none.
  const articles = parseJsonLd(html).filter((b) => b['@type'] === 'Article')
  if (path === 'index') assert.equal(articles.length, 0)
  else {
    assert.equal(articles.length, 1)
    assert.equal(articles[0].author.name, 'Mira Xin')
    assert.equal(articles[0].dateModified, pages.find((p) => p.slug === path).updated)
  }
  console.log('Static HTML verified:', path)
}
for (const slug of legalSlugs) {
  const html = readFileSync(`dist/${slug}.html`, 'utf8')
  assert.match(html, /<div id="root"><div class="app">/)
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1)
  assert.match(html, new RegExp(`<link rel="canonical" href="https://www.getfibermaxxing.com/${slug}"`))
  assert.match(html, /class="legal-page"/)
  assert.match(html, /href="\/privacy"/)
  assert.match(html, /href="\/terms"/)
  console.log('Static HTML verified:', slug)
}
assert.match(readFileSync('dist/404.html','utf8'), /content="noindex, follow"/)
const sitemap = readFileSync('dist/sitemap.xml', 'utf8')
assert.equal((sitemap.match(/<loc>/g) || []).length, pages.length + 2 + legalSlugs.length)
assert.match(sitemap, /<loc>https:\/\/www.getfibermaxxing.com\/about<\/loc>/)
{
  const html = readFileSync('dist/about.html', 'utf8')
  assert.match(html, /<div id="root"><div class="app">/)
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1)
  assert.match(html, /<link rel="canonical" href="https:\/\/www.getfibermaxxing.com\/about"/)
  assert.match(html, /content="index, follow"/)
  assert.match(html, /fdc.nal.usda.gov/)
  console.log('Static HTML verified: about')
}
for (const page of pages) {
  if (!page.sources?.length) continue
  const html = readFileSync(`dist/${page.slug}.html`, 'utf8')
  assert.match(html, /id="sources"/, `${page.slug}: sources block`)
  for (const src of page.sources) assert.ok(html.includes(src.url.replaceAll('&', '&amp;')), `${page.slug}: ${src.url}`)
  if (page.updated) {
    assert.match(html, new RegExp(`<time dateTime="${page.updated}"`, 'i'), `${page.slug}: review date`)
    assert.match(sitemap, new RegExp(`<loc>https://www.getfibermaxxing.com/${page.slug}</loc>\\n    <lastmod>${page.updated}</lastmod>`))
  }
  if (page.dataTable) assert.match(html, /id="data-table-heading"/, `${page.slug}: data table`)
  assert.doesNotMatch(JSON.stringify(page), /you searched/i, `${page.slug}: search-engine phrasing`)
  console.log('Sources verified:', page.slug)
}
for (const slug of legalSlugs) {
  assert.match(sitemap, new RegExp(`<loc>https://www.getfibermaxxing.com/${slug}</loc>`))
}

const FAQ_SCHEMA_SLUGS = new Set([
  'oatmeal',
  'chia-seeds',
  'high-fiber-breakfast',
  'how-much-fiber-per-day',
  'what-is-fibermaxxing',
  'fibermaxxing-foods',
  'fibermaxxing-smoothie',
])
for (const page of pages) {
  const html = readFileSync(`dist/${page.slug}.html`, 'utf8')
  const blocks = parseJsonLd(html)
  const faq = blocks.find((b) => b['@type'] === 'FAQPage')
  if (FAQ_SCHEMA_SLUGS.has(page.slug)) {
    assert.ok(faq, `${page.slug} should have FAQPage JSON-LD`)
    const names = faq.mainEntity.map((e) => e.name)
    for (const f of page.faqs || []) {
      assert.ok(names.includes(f.q), `${page.slug} FAQPage missing: ${f.q}`)
      const ent = faq.mainEntity.find((e) => e.name === f.q)
      assert.equal(ent.acceptedAnswer.text, f.a)
    }
  } else {
    assert.equal(faq, undefined, `${page.slug} must not have FAQPage JSON-LD this round`)
  }
  console.log('FAQ schema verified:', page.slug, faq ? 'FAQPage' : 'no FAQPage')
}

const indexBlocks = parseJsonLd(readFileSync('dist/index.html', 'utf8'))
const indexFaq = indexBlocks.find((b) => b['@type'] === 'FAQPage')
assert.ok(indexFaq, 'home should keep FAQPage JSON-LD')
// Home FAQPage must mirror the visible FAQ block (same source: src/content/homeFaqs.ts).
{
  const indexHtml = readFileSync('dist/index.html', 'utf8')
  assert.ok(indexFaq.mainEntity.length >= 4)
  for (const q of indexFaq.mainEntity) assert.ok(indexHtml.includes(`>${q.name}<`), `visible FAQ missing: ${q.name}`)
}
assert.equal(indexBlocks.filter((b) => b['@graph']).length, 1, 'home should have one extra JSON-LD graph')
assert.deepEqual(
  indexBlocks.find((b) => b['@graph']),
  homeSchema,
)
assert.deepEqual(
  homeSchema['@graph'].map((node) => node['@type']),
  ['Organization', 'WebSite', 'WebApplication'],
)
assert.match(readFileSync('dist/index.html', 'utf8'), /<script type="application\/ld\+json" id="ld-page">/)
console.log('Home entity schema verified: Organization + WebSite + WebApplication')

const oatmealHtml = readFileSync('dist/oatmeal.html', 'utf8')
const oatmealBlocks = parseJsonLd(oatmealHtml)
assert.equal(oatmealBlocks.filter((b) => b['@type'] === 'FAQPage').length, 1, 'oatmeal FAQPage must stay')
assert.equal(oatmealBlocks.filter((b) => b['@type'] === 'WebApplication').length, 1)
assert.deepEqual(
  oatmealBlocks.find((b) => b['@type'] === 'WebApplication'),
  oatmealSchema,
)
assert.equal((oatmealHtml.match(/<script type="application\/ld\+json"/g) || []).length, 3) // FAQPage + WebApplication + Article
console.log('Oatmeal entity schema verified: WebApplication + FAQPage')

for (const file of ['index.html', 'oatmeal.html', ...pages.map((p) => `${p.slug}.html`), 'privacy.html', 'terms.html', '404.html']) {
  const html = readFileSync(`dist/${file}`, 'utf8')
  if (['index.html', 'privacy.html', 'terms.html', '404.html'].includes(file)) assert.doesNotMatch(html, /"@type":"Article"/)
  assert.doesNotMatch(html, /https:\/\/getfibermaxxing\.com(?!\/)/)
}
for (const page of pages) {
  if (page.slug === 'oatmeal') continue
  const html = readFileSync(`dist/${page.slug}.html`, 'utf8')
  assert.doesNotMatch(html, /id="ld-page"/)
}
assert.doesNotMatch(readFileSync('dist/privacy.html', 'utf8'), /id="ld-page"/)
assert.doesNotMatch(readFileSync('dist/terms.html', 'utf8'), /id="ld-page"/)
assert.doesNotMatch(readFileSync('dist/404.html', 'utf8'), /id="ld-page"/)

console.log('404 and sitemap verified')
