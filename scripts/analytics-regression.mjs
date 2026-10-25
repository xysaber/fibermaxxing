import assert from 'node:assert/strict'
import { createServer } from 'vite'
const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
try {
  const { track, trackPageView } = await server.ssrLoadModule('/src/lib/analytics.ts')
  const calls = []
  globalThis.window = { location: { pathname: '/', origin: 'https://www.getfibermaxxing.com' }, dataLayer: [], gtag: (...args) => calls.push(args) }
  globalThis.document = { title: 'Fibermax' }
  track('calculate_attempt', { source: 'own', input_origin: 'typed' })
  assert.equal(calls.length, 1)
  assert.equal(window.dataLayer.length, 0, 'Do not dispatch a second copy through dataLayer')
  assert.equal(calls[0][2].page_path, '/')
  trackPageView('/'); trackPageView('/')
  assert.equal(calls.filter(c => c[1] === 'page_view').length, 1)
  window.location.pathname = '/oatmeal'
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
