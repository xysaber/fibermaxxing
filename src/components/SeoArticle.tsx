import { useEffect, useState, type MouseEventHandler } from 'react'

export type SeoArticleSection = {
  heading: string
  paragraphs: string[]
}

type Props = {
  id?: string
  sections: SeoArticleSection[]
  /** Insert a return-to-calculator CTA after this many sections (1-based). */
  showContents?: boolean
  ctaAfter?: number
  ctaHref?: string
  ctaLabel?: string
  onCtaClick?: MouseEventHandler<HTMLAnchorElement>
}

/** Long-form SEO body for guide pages — keeps the hero short, content crawlable. */
export function SeoArticle({
  id = 'guide-article',
  sections,
  showContents = false,
  ctaAfter = 2,
  ctaHref = '#calculator',
  ctaLabel = 'Estimate your bowl in the calculator',
  onCtaClick,
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (!showContents) return
    const updateActive = () => {
      let current = 0
      sections.forEach((_, i) => {
        const heading = document.getElementById(`${id}-section-${i + 1}`)
        if (heading && heading.getBoundingClientRect().top <= 160) current = i
      })
      setActiveIndex(current)
    }
    updateActive()
    window.addEventListener('scroll', updateActive, { passive: true })
    return () => window.removeEventListener('scroll', updateActive)
  }, [id, sections, showContents])

  if (!sections.length) return null

  const insertAt = Math.min(Math.max(ctaAfter, 1), sections.length) - 1

  return (
    <section className={`seo-article${showContents ? ' seo-article-with-contents' : ''}`} id={id} aria-label="Guide">
      {showContents ? (
        <aside className="seo-article-sidebar">
          <nav className="seo-contents" aria-label="On this page">
            <p className="seo-contents-label">On this page</p>
            <ol>
              {sections.map((s, i) => (
                <li key={s.heading}>
                  <a href={`#${id}-section-${i + 1}`} aria-current={activeIndex === i ? 'location' : undefined}>
                    <span className="seo-contents-number" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                    <span>{s.heading}</span>
                  </a>
                </li>
              ))}
            </ol>
            <div className="seo-contents-action">
              <p>Put the guide into practice.</p>
              <a className="hero-method-link" href={ctaHref} onClick={onCtaClick}>Back to calculator <span aria-hidden="true">↑</span></a>
            </div>
          </nav>
        </aside>
      ) : null}
      <div className="seo-article-inner">
        {sections.map((s, i) => (
          <div key={s.heading} className="seo-article-unit">
            <article className="seo-article-block">
              <h2 id={showContents ? `${id}-section-${i + 1}` : undefined}>{s.heading}</h2>
              {s.paragraphs.map((p) => (
                <p key={p.slice(0, 56)}>{p}</p>
              ))}
            </article>
            {i === insertAt ? (
              <p className="seo-article-cta">
                <a className="hero-method-link" href={ctaHref} onClick={onCtaClick}>
                  {ctaLabel}
                </a>
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  )
}
