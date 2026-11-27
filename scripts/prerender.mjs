/**
 * Post-build: write dist/<slug>.html with route-specific meta + static SEO
 * copy for published pages only. Also writes 404.html, _redirects, and sitemap.
 */
import { createServer } from 'vite'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const siteUrl = 'https://www.getfibermaxxing.com'
const allPages = JSON.parse(readFileSync(join(root, 'src/content/seo-pages.json'), 'utf8'))
// Long-tail pages (per-food, hub, audience) live one JSON per page; see scripts/food-pages/build.mjs.
const longTailDir = join(root, 'src/content/pages')
const longTail = readdirSync(longTailDir)
  .filter((f) => f.endsWith('.json'))
  .sort()
  .map((f) => JSON.parse(readFileSync(join(longTailDir, f), 'utf8')))
const pages = [...allPages, ...longTail].filter((p) => p.publish)

const ssrServer = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
const { renderPage } = await ssrServer.ssrLoadModule('/scripts/render-pages.tsx')
const { pageJsonLd, PAGE_JSON_LD_ID } = await ssrServer.ssrLoadModule('/src/lib/pageJsonLd.ts')
const { loadAllSeoPages } = await ssrServer.ssrLoadModule('/src/content/seoPages.ts')
const { HOME_FAQS } = await ssrServer.ssrLoadModule('/src/content/homeFaqs.ts')
await loadAllSeoPages()
await ssrServer.close()

const shell = readFileSync(join(dist, 'index.html'), 'utf8')

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function articleLd(page, url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.h1 || page.title,
    description: page.description,
    mainEntityOfPage: url,
    dateModified: page.updated,
    author: { '@type': 'Person', name: 'Mira Xin', jobTitle: 'Founder & Editor', url: `${siteUrl}/about#editor` },
    publisher: { '@type': 'Organization', name: 'GetFibermaxxing', url: `${siteUrl}/` },
    image: `${siteUrl}/og.png`,
  }
}

function injectHead(html, { title, description, path, faqs, noindex = false, article }) {
  const url = path === '/' ? `${siteUrl}/` : `${siteUrl}${path}`
  const ogImage = `${siteUrl}/og.png`
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

  // One extra entity script beside FAQPage. Home and /oatmeal only; FAQ payload above is unchanged.
  const extra = pageJsonLd(path)
  const extraLd = extra
    ? `<script type="application/ld+json" id="${PAGE_JSON_LD_ID}">${JSON.stringify(extra)}</script>`
    : ''
  // Article + dateModified for guides and long-tail pages (byline: Mira Xin).
  const artLd = article
    ? `<script type="application/ld+json" id="ld-article">${JSON.stringify(articleLd(article, url))}</script>`
    : ''
  const schemaLd = [faqLd, extraLd, artLd].filter(Boolean).join('\n')

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
      `    <meta property="og:image" content="${ogImage}" />\n    <meta name="twitter:image" content="${ogImage}" />\n${schemaLd}\n  </head>`,
    )
  } else {
    out = out.replace('</head>', `${schemaLd}\n  </head>`)
  }

  return out
}

function writePageHtml(slug, html) {
  if (html.includes('class="qa-photo"')) {
    // Guide hero photos are the LCP image on phones: open the image CDN connection early.
    html = html.replace('</head>', '    <link rel="preconnect" href="https://images.unsplash.com" />\n  </head>')
  }
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
    faqs: HOME_FAQS,
  }).replace('<div id="root"></div>', `<div id="root">${renderPage('/')}</div>`)
  writeFileSync(join(dist, 'index.html'), html)
  console.log('prerender /')
}

// FAQPage JSON-LD for published guides with a visible FAQ (same payload as the FAQ block).
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
  const html = injectHead(shell, {
    title: page.title,
    description: page.description,
    path: `/${page.slug}`,
    faqs: FAQ_SCHEMA_SLUGS.has(page.slug) ? page.faqs : [],
    article: page.updated ? page : undefined,
  }).replace('<div id="root"></div>', `<div id="root">${renderPage(`/${page.slug}`)}</div>`)
  writePageHtml(page.slug, html)
  console.log('prerender', `/${page.slug}`)
}

const legalPages = [
  {
    slug: 'privacy',
    title: 'Privacy Policy | GetFibermaxxing',
    description:
      'How GetFibermaxxing collects and uses information for the free fibermaxxing calculator, including meal logs and analytics.',
  },
  {
    slug: 'terms',
    title: 'Terms of Service | GetFibermaxxing',
    description:
      'Terms of Service for the GetFibermaxxing fiber intake estimator and fibermaxxing calculator.',
  },
]
for (const page of legalPages) {
  const html = injectHead(shell, {
    title: page.title,
    description: page.description,
    path: `/${page.slug}`,
    faqs: [],
  }).replace('<div id="root"></div>', `<div id="root">${renderPage(`/${page.slug}`)}</div>`)
  writePageHtml(page.slug, html)
  console.log('prerender', `/${page.slug}`)
}

// About / editorial standards
const aboutPage = {
  slug: 'about',
  title: 'About GetFibermaxxing & Editorial Standards',
  description:
    'Who runs GetFibermaxxing, where the fiber numbers come from (USDA FoodData Central), how guides are reviewed, and what this site is not.',
}
{
  const html = injectHead(shell, {
    title: aboutPage.title,
    description: aboutPage.description,
    path: '/about',
    faqs: [],
  }).replace('<div id="root"></div>', `<div id="root">${renderPage('/about')}</div>`)
  writePageHtml(aboutPage.slug, html)
  console.log('prerender /about')
}

// 30-day plan: sales page (indexed) + thank-you and reader shells (noindex, client-rendered data)
const { PLAN_SALES_META, PLAN_FAQS, STARTER_PLAN_META } = await (async () => {
  const srv = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
  try {
    const sales = await srv.ssrLoadModule('/src/pages/PlanSalesPage.tsx')
    const starter = await srv.ssrLoadModule('/src/pages/StarterPlanPage.tsx')
    return { ...sales, STARTER_PLAN_META: starter.STARTER_PLAN_META }
  } finally {
    await srv.close()
  }
})()
const planPages = [
  { slug: '30-day-plan', title: PLAN_SALES_META.title, description: PLAN_SALES_META.description, faqs: PLAN_FAQS, noindex: false },
  { slug: '30-day-plan-thanks', title: 'Your plan is ready | GetFibermaxxing', description: 'Payment received. Open your 30-day fiber plan.', faqs: [], noindex: true },
  { slug: '7-day-plan', title: STARTER_PLAN_META.title, description: STARTER_PLAN_META.description, faqs: [], noindex: true },
  { slug: 'my-plan', title: 'Your 30-day plan | GetFibermaxxing', description: 'Your 30-day fiber plan.', faqs: [], noindex: true },
]
for (const page of planPages) {
  const html = injectHead(shell, {
    title: page.title,
    description: page.description,
    path: `/${page.slug}`,
    faqs: page.faqs,
    noindex: page.noindex,
  }).replace('<div id="root"></div>', `<div id="root">${renderPage(`/${page.slug}`)}</div>`)
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
  }).replace('<div id="root"></div>', `<div id="root">${renderPage('/404')}</div>`)
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

const urls = [
  `  <url>\n    <loc>${siteUrl}/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>`,
  ...pages.map(
    (p) =>
      `  <url>\n    <loc>${siteUrl}/${p.slug}</loc>\n${p.updated ? `    <lastmod>${p.updated}</lastmod>\n` : ''}    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`,
  ),
  `  <url>\n    <loc>${siteUrl}/30-day-plan</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`,
  `  <url>\n    <loc>${siteUrl}/about</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.5</priority>\n  </url>`,
  ...legalPages.map(
    (p) =>
      `  <url>\n    <loc>${siteUrl}/${p.slug}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.3</priority>\n  </url>`,
  ),
]
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
writeFileSync(join(dist, 'sitemap.xml'), sitemap)
writeFileSync(join(root, 'public/sitemap.xml'), sitemap)
console.log('wrote sitemap.xml (%d urls)', pages.length + 3 + legalPages.length)
