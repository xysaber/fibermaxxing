import { useEffect, type MouseEvent } from 'react'
import { useParams } from 'react-router-dom'
import { DocumentMeta } from '../components/DocumentMeta'
import { FaqBlock } from '../components/FaqBlock'
import { FiberCalculator } from '../components/FiberCalculator'
import { GuideCards } from '../components/GuideCards'
import { InfoBand } from '../components/InfoBand'
import { MethodStrip } from '../components/MethodStrip'
import { SeoAnswer } from '../components/SeoAnswer'
import { SeoArticle } from '../components/SeoArticle'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import { getSeoPage, SEO_PAGE_MAP } from '../content/seoPages'
import { trackPageView } from '../lib/analytics'
import { NotFoundPage } from './NotFoundPage'

function shortBlurb(text: string, max = 96) {
  const t = text.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max - 1).trimEnd()}…`
}

function focusCalculator(e: MouseEvent<HTMLAnchorElement>) {
  e.preventDefault()
  const panel = document.getElementById('calculator')
  const meal = document.getElementById('meal') as HTMLTextAreaElement | null
  panel?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  window.setTimeout(() => meal?.focus({ preventScroll: true }), 280)
}

export function SeoLandingPage() {
  const { slug } = useParams<{ slug: string }>()
  const page = slug ? getSeoPage(slug) : undefined

  useEffect(() => {
    if (page) trackPageView(`/${page.slug}`)
  }, [page])

  if (!page) {
    return <NotFoundPage />
  }

  const related = page.related
    .map((s) => SEO_PAGE_MAP[s])
    .filter((p): p is NonNullable<typeof p> => Boolean(p?.publish))

  const useBands = page.layout !== 'default'
  const facts = page.facts ?? []
  const heroLede = page.intro?.[0]?.trim() || null

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
          <h1>{page.h1}</h1>

          {page.answer ? <SeoAnswer answer={page.answer} showNote={false} /> : null}

          {heroLede ? <p className="lede">{heroLede}</p> : null}

          <a
            className={useBands ? 'hero-method-link hero-calc-link' : 'hero-method-link'}
            href="#calculator"
            onClick={focusCalculator}
          >
            {page.calculatorCta ?? 'Estimate this meal'}
          </a>
        </div>

        <FiberCalculator
          key={page.slug}
          initialSex={page.defaultSex}
          initialAge={page.defaultAge}
          initialMode={page.defaultMode}
          initialMeal={page.defaultMeal}
          examples={page.examples?.length ? page.examples : [page.defaultMeal]}
          panelLabel="Estimate this meal — or paste your own"
        />
      </section>

      {facts.length > 0 ? (
        <InfoBand id="seo-facts" ariaLabel="Key figures" tiles={facts} />
      ) : null}

      {page.sections && page.sections.length > 0 ? (
        <SeoArticle
          sections={page.sections}
          showContents
          ctaAfter={2}
          ctaHref="#calculator"
          ctaLabel={page.articleCta ?? 'Estimate your bowl in the calculator'}
          onCtaClick={focusCalculator}
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
