import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const pages = JSON.parse(readFileSync('src/content/seo-pages.json', 'utf8')).filter(p => p.publish)
const legalSlugs = ['privacy', 'terms']
for (const path of ['index', ...pages.map(p => p.slug)]) {
  const html = readFileSync(`dist/${path}.html`, 'utf8')
  assert.match(html, /<div id="root"><div class="app">/)
  assert.doesNotMatch(html, /<noscript/)
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1)
  assert.match(html, new RegExp(`<link rel="canonical" href="https://www.getfibermaxxing.com/${path === 'index' ? '' : path}"`))
  if (path !== 'index') {
    assert.equal((html.match(/<article /g) || []).length, pages.find(p => p.slug === path).sections.length)
    assert.match(html, /aria-label="On this page"/)
  }
  for (const json of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)) JSON.parse(json[1])
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
assert.equal((sitemap.match(/<loc>/g) || []).length, pages.length + 1 + legalSlugs.length)
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
])
for (const page of pages) {
  const html = readFileSync(`dist/${page.slug}.html`, 'utf8')
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map((m) => JSON.parse(m[1]))
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

console.log('404 and sitemap verified')
