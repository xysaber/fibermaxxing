import { Link } from 'react-router-dom'
import type { SeoSource } from '../content/seoPages'

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

/** "2026-11-24" → "November 24, 2026" without locale/timezone drift between SSR and client. */
export function formatReviewDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return iso
  return `${MONTHS[Number(m[2]) - 1]} ${Number(m[3])}, ${m[1]}`
}

/** One-line review stamp under the H1. */
export function GuideByline({ updated }: { updated: string }) {
  return (
    <p className="guide-byline">
      Reviewed <time dateTime={updated}>{formatReviewDate(updated)}</time>
      <span aria-hidden="true"> · </span>
      <a href="#sources">Sources</a>
      <span aria-hidden="true"> · </span>
      <Link to="/about">Editorial standards</Link>
    </p>
  )
}

/** Sources + review note near the end of each guide. */
export function GuideSources({ sources, updated }: { sources: SeoSource[]; updated?: string }) {
  return (
    <section id="sources" className="seo-strip guide-sources" aria-labelledby="sources-heading">
      <h2 id="sources-heading">Sources and how we checked these numbers</h2>
      <ul>
        {sources.map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noopener noreferrer">
              {s.label}
            </a>
            {s.note ? <span className="guide-sources-note"> — {s.note}</span> : null}
          </li>
        ))}
      </ul>
      <p className="guide-sources-meta">
        Written and reviewed by <Link to="/about#editor">Mira Xin</Link>, Founder &amp; Editor.{' '}
        {updated ? (
          <>
            Figures last reviewed <time dateTime={updated}>{formatReviewDate(updated)}</time>.{' '}
          </>
        ) : null}
        Food values are per-portion estimates scaled from USDA per-100 g data; brands, ripeness, and
        cooking change real values. This guide is for education and self-tracking, not medical advice.
        Read our <Link to="/about">editorial standards</Link> or report an error to{' '}
        <a href="mailto:hello@getfibermaxxing.com">hello@getfibermaxxing.com</a>.
      </p>
    </section>
  )
}
