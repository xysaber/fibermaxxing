import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { DocumentMeta } from '../components/DocumentMeta'
import { FaqBlock } from '../components/FaqBlock'
import { FiberCalculator } from '../components/FiberCalculator'
import { MethodStrip } from '../components/MethodStrip'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import { getSeoPage, SEO_PAGE_MAP } from '../content/seoPages'
import { track } from '../lib/analytics'
import { NotFoundPage } from './NotFoundPage'

export function SeoLandingPage() {
  const { slug } = useParams<{ slug: string }>()
  const page = slug ? getSeoPage(slug) : undefined

  useEffect(() => {
    if (page) track('page_view', { path: `/${page.slug}` })
  }, [page])

  if (!page) {
    return <NotFoundPage />
  }

  const related = page.related
    .map((s) => SEO_PAGE_MAP[s])
    .filter((p): p is NonNullable<typeof p> => Boolean(p?.publish))

  return (
    <div className="app">
      <DocumentMeta
        title={page.title}
        description={page.description}
        path={`/${page.slug}`}
        faqs={page.faqs}
      />
      <SiteHeader />

      <section className="hero">
        <div className="hero-copy seo-landing-copy">
          <p className="seo-kicker">
            <Link to="/">Fibermax</Link>
            <span aria-hidden> / </span>
            <span>{page.slug.replace(/-/g, ' ')}</span>
          </p>
          <h1>{page.h1}</h1>
          {page.intro.map((para) => (
            <p key={para.slice(0, 48)} className="lede">
              {para}
            </p>
          ))}
          {page.facts && page.facts.length > 0 && (
            <ul className="seo-facts">
              {page.facts.map((f) => (
                <li key={f.label}>
                  <strong>{f.label}</strong>
                  <span>{f.value}</span>
                  {f.note ? <em>{f.note}</em> : null}
                </li>
              ))}
            </ul>
          )}
          <a className="hero-method-link" href="#calculator">
            Jump to calculator
          </a>
        </div>

        <FiberCalculator
          initialSex={page.defaultSex}
          initialAge={page.defaultAge}
          initialMode={page.defaultMode}
          initialMeal={page.defaultMeal}
          examples={[page.defaultMeal]}
          panelLabel="Estimate this meal — or paste your own"
        />
      </section>

      <FaqBlock title="FAQ" faqs={page.faqs} />

      {related.length > 0 && (
        <section className="related-strip" aria-label="Related guides">
          <h2>Related guides</h2>
          <ul className="related-list">
            {related.map((r) => (
              <li key={r.slug}>
                <Link to={`/${r.slug}`}>{r.h1}</Link>
              </li>
            ))}
            <li>
              <Link to="/">Daily fiber calculator</Link>
            </li>
          </ul>
        </section>
      )}

      <MethodStrip />
      <SiteFooter />
    </div>
  )
}
