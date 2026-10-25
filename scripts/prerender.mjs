/**
 * Post-build: write dist/<slug>.html with route-specific meta + static SEO
 * copy for published pages only. Also writes 404.html, _redirects, and sitemap.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const siteUrl = 'https://www.getfibermaxxing.com'
const allPages = JSON.parse(readFileSync(join(root, 'src/content/seo-pages.json'), 'utf8'))
const pages = allPages.filter((p) => p.publish)

const shell = readFileSync(join(dist, 'index.html'), 'utf8')

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function injectHead(html, { title, description, path, faqs, noindex = false }) {
  const url = path === '/' ? `${siteUrl}/` : `${siteUrl}${path}`
  const ogImage = `${siteUrl}/og.svg`
  const faqLd =
    faqs && faqs.length
      ? `<script type="application/ld+json">${JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        })}</script>`
      : ''

  let out = html
  out = out.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`)
  out = out.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
    `<meta name="description" content="${escapeHtml(description)}" />`,
  )
  out = out.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/,
    `<link rel="canonical" href="${url}" />`,
  )
  out = out.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:url" content="${url}" />`,
  )
  out = out.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
  )
  out = out.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
  )
  out = out.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
  )
  out = out.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
  )

  const robots = noindex
    ? `<meta name="robots" content="noindex, follow" />`
    : `<meta name="robots" content="index, follow" />`
  out = out.replace(/<meta\s+name="robots"\s+content="[^"]*"\s*\/>/, robots)

  if (!out.includes('property="og:image"')) {
    out = out.replace(
      '</head>',
      `    <meta property="og:image" content="${ogImage}" />\n    <meta name="twitter:image" content="${ogImage}" />\n${faqLd}\n  </head>`,
    )
  } else {
    out = out.replace('</head>', `${faqLd}\n  </head>`)
  }

  return out
}

function staticArticle(page) {
  const paras = page.intro.map((p) => `<p>${escapeHtml(p)}</p>`).join('\n')
  const facts = (page.facts || [])
    .map(
      (f) =>
        `<li><strong>${escapeHtml(f.label)}:</strong> ${escapeHtml(f.value)}${
          f.note ? ` <em>(${escapeHtml(f.note)})</em>` : ''
        }</li>`,
    )
    .join('\n')
  const sections = (page.sections || [])
    .map(
      (s) =>
        `<h2>${escapeHtml(s.heading)}</h2>\n${(s.paragraphs || [])
          .map((p) => `<p>${escapeHtml(p)}</p>`)
          .join('\n')}`,
    )
    .join('\n')
  const faqs = (page.faqs || [])
    .map(
      (f) =>
        `<details><summary>${escapeHtml(f.q)}</summary><p>${escapeHtml(f.a)}</p></details>`,
    )
    .join('\n')
  // noscript: visible only when JS is off — avoids FOUC for normal visitors.
  // Head still has unique title/description/canonical/FAQ JSON-LD for crawlers.
  return `
<noscript id="prerender-seo">
<section style="max-width:46rem;margin:1.5rem auto;padding:0 1.25rem;font-family:system-ui,sans-serif;color:#1a2238">
  <p><a href="/">Fibermax</a> · fiber calculator</p>
  <h1>${escapeHtml(page.h1)}</h1>
  ${paras}
  ${facts ? `<ul>${facts}</ul>` : ''}
  ${sections}
  <p>JavaScript is required for the interactive calculator.</p>
  <h2>FAQ</h2>
  ${faqs}
</section>
</noscript>`
}

function homeArticle() {
  return `
<noscript id="prerender-seo">
<section style="max-width:46rem;margin:1.5rem auto;padding:0 1.25rem;font-family:system-ui,sans-serif;color:#1a2238">
  <h1>How much fiber have you <em>actually</em> eaten today?</h1>
  <p>Free fibermaxxing calculator: paste what you ate, get USDA-based fiber totals, edit portions, and compare to U.S. Adequate Intake targets — no signup.</p>
  <ul>
    <li>USDA-based fiber estimates for real foods</li>
    <li>Daily targets from U.S. Adequate Intake (by sex &amp; age)</li>
    <li>Edit matched portions after you calculate</li>
  </ul>
  <p><a href="/how-much-fiber-per-day">How much fiber per day</a> · <a href="/oatmeal">Oatmeal fiber</a></p>
</section>
</noscript>`
}

function writePageHtml(slug, html) {
  // Flat dist/<slug>.html so Cloudflare Pretty URLs serve /<slug> without
  // 307 → /<slug>/ (which fought canonicals that omit the trailing slash).
  writeFileSync(join(dist, `${slug}.html`), html)
}

// Homepage
{
  const html = injectHead(shell, {
    title: 'Fibermaxxing Calculator & Daily Fiber Tracker | GetFibermaxxing',
    description:
      'Free fibermaxxing calculator. Estimate daily fiber from your meals with USDA-based values and U.S. Adequate Intake targets. No signup.',
    path: '/',
    faqs: [
      {
        q: 'What is fibermaxxing?',
        a: 'Fibermaxxing means intentionally increasing daily dietary fiber — often toward stretch targets above standard adequate intake.',
      },
      {
        q: 'How much fiber should I eat per day?',
        a: 'Commonly cited U.S. Adequate Intake: about 25g/day for women 19–50 and 38g/day for men 19–50 (lower after 50).',
      },
    ],
  }).replace('<div id="root"></div>', `${homeArticle()}\n    <div id="root"></div>`)
  writeFileSync(join(dist, 'index.html'), html)
  console.log('prerender /')
}

for (const page of pages) {
  const html = injectHead(shell, {
    title: page.title,
    description: page.description,
    path: `/${page.slug}`,
    faqs: page.faqs,
  }).replace('<div id="root"></div>', `${staticArticle(page)}\n    <div id="root"></div>`)
  writePageHtml(page.slug, html)
  console.log('prerender', `/${page.slug}`)
}

// 404 page for Cloudflare
{
  const html = injectHead(shell, {
    title: 'Page not found | GetFibermaxxing',
    description: 'That page does not exist.',
    path: '/404',
    faqs: [],
    noindex: true,
  }).replace(
    '<div id="root"></div>',
    `<noscript id="prerender-seo">
<section style="max-width:40rem;margin:2rem auto;padding:0 1.25rem;font-family:system-ui,sans-serif">
  <h1>Page not found</h1>
  <p><a href="/">Back to the fiber calculator</a></p>
</section>
</noscript>
<div id="root"></div>`,
  )
  writeFileSync(join(dist, '404.html'), html)
  console.log('prerender /404.html')
}

// Workers static assets _redirects: relative URLs only (absolute hosts → API error 100324).
// Never add /* → /index.html 200. Unknown paths use 404.html via wrangler not_found_handling.
// Apex → www belongs in a Cloudflare Redirect Rule, not this file.
const redirects = `# Workers _redirects — relative URLs only; no SPA catch-all.
# Apex → www: Cloudflare Redirect Rule on the zone (absolute hosts invalid here).
`
writeFileSync(join(dist, '_redirects'), redirects)
writeFileSync(join(root, 'public/_redirects'), redirects)

const urls = [
  `  <url>\n    <loc>${siteUrl}/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>`,
  ...pages.map(
    (p) =>
      `  <url>\n    <loc>${siteUrl}/${p.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`,
  ),
]
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
writeFileSync(join(dist, 'sitemap.xml'), sitemap)
writeFileSync(join(root, 'public/sitemap.xml'), sitemap)
console.log('wrote sitemap.xml (%d urls)', pages.length + 1)
