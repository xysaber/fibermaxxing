import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { DocumentMeta } from '../components/DocumentMeta'
import { FaqBlock } from '../components/FaqBlock'
import { FiberCalculator } from '../components/FiberCalculator'
import { GuideCards } from '../components/GuideCards'
import { InfoBand } from '../components/InfoBand'
import { MethodStrip } from '../components/MethodStrip'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import { getSeoPage, SEO_PAGE_MAP } from '../content/seoPages'
import { track } from '../lib/analytics'
import { NotFoundPage } from './NotFoundPage'

function shortBlurb(text: string, max = 96) {
  const t = text.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max - 1).trimEnd()}…`
}

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

  // Bands is the SEO default; set layout: "default" to keep the old stacked-left copy.
  const useBands = page.layout !== 'default'
  const [heroIntro, ...moreIntros] = page.intro
  const facts = page.facts ?? []

  const relatedCards = [
    ...related.map((r) => ({
      to: `/${r.slug}`,
      title: r.h1,
      blurb: shortBlurb(r.description),
    })),
    {
      to: '/',
      title: 'Daily fiber calculator',
      blurb: 'Paste any meal and compare to your daily target.',
    },
  ]

  return (
    <div className="app">
      <DocumentMeta
        title={page.title}
        description={page.description}
        path={`/${page.slug}`}
        faqs={page.faqs}
      />
      <SiteHeader />

      <section className={useBands ? 'hero seo-split' : 'hero'}>
        <div className="hero-copy seo-landing-copy">
          <p className="seo-kicker">
            <Link to="/">Fibermax</Link>
            <span aria-hidden> / </span>
            <span>{page.slug.replace(/-/g, ' ')}</span>
          </p>
          <h1>{page.h1}</h1>

          {useBands ? (
            <>
              {heroIntro ? <p className="lede">{heroIntro}</p> : null}
              <a className="hero-method-link" href="#calculator">
                Jump to calculator
              </a>
            </>
          ) : (
            <>
              {page.intro.map((para) => (
                <p key={para.slice(0, 48)} className="lede">
                  {para}
                </p>
              ))}
              {facts.length > 0 ? (
                <InfoBand tiles={facts} ariaLabel="Key figures" />
              ) : null}
              <a className="hero-method-link" href="#calculator">
                Jump to calculator
              </a>
            </>
          )}
        </div>

        <FiberCalculator
          initialSex={page.defaultSex}
          initialAge={page.defaultAge}
          initialMode={page.defaultMode}
          initialMeal={page.defaultMeal}
          examples={page.examples?.length ? page.examples : [page.defaultMeal]}
          panelLabel="Estimate this meal — or paste your own"
        />
      </section>

      {useBands && (moreIntros.length > 0 || facts.length > 0) ? (
        <InfoBand
          id="seo-facts"
          ariaLabel="Key figures"
          notes={moreIntros}
          tiles={facts}
        />
      ) : null}

      <FaqBlock title="FAQ" faqs={page.faqs} />

      <GuideCards
        id="related"
        title="Related guides"
        subtitle="More short answers — same calculator, different starting meal."
        items={relatedCards}
      />

      <MethodStrip />
      <SiteFooter />
    </div>
  )
}
