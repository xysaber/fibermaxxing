import { useEffect } from 'react'

/**
 * Scroll reveal for home sections (motion spec, board 31 note): elements with
 * [data-reveal] that start below the fold rise 8 px and fade in over 400 ms,
 * once. Content above the fold is never hidden (protects LCP), prerendered HTML
 * stays fully visible without JS, and reduced motion turns it off.
 */
export function useReveal() {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    const below = els.filter((el) => el.getBoundingClientRect().top > window.innerHeight)
    if (below.length === 0) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          e.target.classList.add('is-in')
          io.unobserve(e.target)
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    for (const el of below) {
      el.classList.add('reveal-armed')
      io.observe(el)
    }
    return () => {
      io.disconnect()
      for (const el of below) el.classList.remove('reveal-armed', 'is-in')
    }
  }, [])
}
