type EventName = 'page_view' | 'calculate_attempt' | 'calculate_result' | 'run_example' | 'calculate_own' | 'edit_portion' | 'share_png' | 'share_copy'

type GtagFn = (...args: unknown[]) => void

function gtagWindow() {
  return window as Window & {
    dataLayer?: unknown[]
    gtag?: GtagFn
  }
}

/** Read landing UTMs once per page_view for campaign attribution (belt + suspenders with page_location). */
function campaignFromSearch(search = window.location.search) {
  try {
    const q = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
    const source = q.get('utm_source')?.trim()
    const medium = q.get('utm_medium')?.trim()
    const name = q.get('utm_campaign')?.trim()
    const content = q.get('utm_content')?.trim()
    const term = q.get('utm_term')?.trim()
    if (!source && !medium && !name && !content && !term) return undefined
    return {
      ...(source ? { source } : {}),
      ...(medium ? { medium } : {}),
      ...(name ? { name } : {}),
      ...(content ? { content } : {}),
      ...(term ? { term } : {}),
    }
  } catch {
    return undefined
  }
}

/** Never send meal text, food names, or matched/unmatched phrases. */
export function track(event: EventName, props?: Record<string, string | number | boolean>) {
  try {
    const w = gtagWindow()
    const params = { page_path: window.location.pathname, ...props }
    // gtag already writes to dataLayer: dispatch once, not via both channels.
    if (typeof w.gtag === 'function') w.gtag('event', event, params)
    else w.dataLayer?.push({ event, ...params })
    if (import.meta.env.DEV) console.debug('[analytics]', event, params)
  } catch {
    // Analytics must never interrupt the calculator.
  }
}

let lastPage: string | undefined
export function trackPageView(path: string) {
  if (lastPage === path) return // React StrictMode repeats effects in development.
  lastPage = path
  // Prefer the real browser URL so ?utm_* is never dropped (was the (direct) bug).
  // path arg is only for dedupe key / SPA route identity.
  const page_location =
    window.location.pathname === path || window.location.pathname === `${path}/`
      ? window.location.href
      : `${window.location.origin}${path}${window.location.search || ''}`

  const campaign = campaignFromSearch()
  const w = gtagWindow()
  if (campaign && typeof w.gtag === 'function') {
    try {
      // Explicit campaign fields — helps when reports lag or session already open as (direct).
      w.gtag('set', 'campaign', campaign)
    } catch {
      /* ignore */
    }
  }

  track('page_view', {
    page_location,
    page_title: document.title,
  })
}
