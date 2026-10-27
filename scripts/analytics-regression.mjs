import assert from 'node:assert/strict'
import { createServer } from 'vite'
const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
try {
  const { track, trackPageView } = await server.ssrLoadModule('/src/lib/analytics.ts')
  const calls = []
  globalThis.window = {
    location: {
      pathname: '/',
      origin: 'https://www.getfibermaxxing.com',
      href: 'https://www.getfibermaxxing.com/?utm_source=self&utm_medium=test&utm_campaign=internal_qa',
      search: '?utm_source=self&utm_medium=test&utm_campaign=internal_qa',
    },
    dataLayer: [],
    gtag: (...args) => calls.push(args),
  }
  globalThis.document = { title: 'Fibermax' }
  track('calculate_attempt', { source: 'own', input_origin: 'typed' })
  assert.equal(calls.length, 1)
  assert.equal(window.dataLayer.length, 0, 'Do not dispatch a second copy through dataLayer')
  assert.equal(calls[0][2].page_path, '/')
  trackPageView('/'); trackPageView('/')
  assert.equal(calls.filter(c => c[1] === 'page_view').length, 1)
  const pv = calls.find(c => c[1] === 'page_view')
  assert.equal(pv[2].page_location.includes('utm_source=self'), true, 'page_location must keep UTMs')
  assert.ok(calls.some(c => c[0] === 'set' && c[1] === 'campaign' && c[2]?.source === 'self'), 'set campaign from UTM')
  window.location.pathname = '/oatmeal'
  window.location.href = 'https://www.getfibermaxxing.com/oatmeal'
  window.location.search = ''
  trackPageView('/oatmeal'); trackPageView('/')
  assert.equal(calls.filter(c => c[1] === 'page_view').length, 3, 'Count a real return visit')
  delete window.gtag
  track('calculate_result', { status: 'no_match' })
  assert.equal(window.dataLayer.length, 1)
  assert.equal(window.dataLayer[0].status, 'no_match')
  window.gtag = () => { throw new Error('blocked') }
  assert.doesNotThrow(() => track('calculate_attempt'))
  console.log('Analytics dispatch, page view deduplication, fallback and failure isolation passed')
} finally { await server.close() }
