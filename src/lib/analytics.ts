type EventName = 'page_view' | 'calculate_attempt' | 'calculate_result' | 'run_example' | 'calculate_own' | 'edit_portion' | 'share_png' | 'share_copy'

/** Never send meal text, food names, or matched/unmatched phrases. */
export function track(event: EventName, props?: Record<string, string | number | boolean>) {
  try {
    const w = window as Window & {
      dataLayer?: unknown[]
      gtag?: (...args: unknown[]) => void
    }
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
  track('page_view', {
    page_location: `${window.location.origin}${path}`,
    page_title: document.title,
  })
}
