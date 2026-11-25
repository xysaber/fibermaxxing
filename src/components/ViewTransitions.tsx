import { useEffect } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate } from 'react-router-dom'

type VTDocument = Document & { startViewTransition?: (cb: () => void) => unknown }

/**
 * Cross-fade between pages with the View Transitions API (motion spec).
 * Declarative <BrowserRouter> has no `viewTransition` option, so this catches
 * plain left-clicks on internal links in the capture phase, cancels the default
 * (React Router's <Link> then skips its own navigation, but onClick tracking
 * still runs), and navigates inside startViewTransition. Browsers without the
 * API, reduced motion, modified clicks, new-tab links and same-page hash links
 * behave exactly as before.
 */
export function ViewTransitions() {
  const navigate = useNavigate()
  useEffect(() => {
    const doc = document as VTDocument
    if (typeof doc.startViewTransition !== 'function') return
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const a = (e.target as Element | null)?.closest?.('a')
      if (!a || !a.href || (a.target && a.target !== '_self') || a.hasAttribute('download')) return
      const url = new URL(a.href, location.href)
      if (url.origin !== location.origin) return
      if (url.pathname === location.pathname) return
      e.preventDefault()
      const to = url.pathname + url.search + url.hash
      doc.startViewTransition!(() => {
        flushSync(() => navigate(to))
        if (!url.hash) window.scrollTo(0, 0)
      })
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [navigate])
  return null
}
