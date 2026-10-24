type EventName = 'page_view' | 'run_example' | 'calculate_own' | 'edit_portion' | 'share_png' | 'share_copy'

/** Minimal no-op-safe analytics. Hooks to window.dataLayer / gtag when present. */
export function track(event: EventName, props?: Record<string, string | number | boolean>) {
  try {
    const payload = { event, ...props, ts: Date.now() }
    const w = window as Window & {
      dataLayer?: unknown[]
      gtag?: (...args: unknown[]) => void
    }
    w.dataLayer?.push(payload)
    if (typeof w.gtag === 'function') w.gtag('event', event, props)
    if (import.meta.env.DEV) console.debug('[analytics]', payload)
  } catch {
    // ignore
  }
}
