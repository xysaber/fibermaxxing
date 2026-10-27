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
console.log('404 and sitemap verified')
