import { useEffect, type MouseEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { DocumentMeta } from '../components/DocumentMeta'
import { EmailSignup } from '../components/EmailSignup'
import { FaqBlock } from '../components/FaqBlock'
import { FiberCalculator } from '../components/FiberCalculator'
import { GuideCards } from '../components/GuideCards'
import { HOME_GUIDES } from '../components/GuidesStrip'
import { GuideByline, GuideSources } from '../components/GuideSources'
import { SeoAnswer } from '../components/SeoAnswer'
import { SeoArticle } from '../components/SeoArticle'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import { getSeoPage, SEO_PAGE_MAP, type SeoPortionTable } from '../content/seoPages'
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

function PortionComparison({
  table,
  headingId = 'portion-table-heading',
  className = 'seo-portion-table',
}: {
  table: SeoPortionTable
  headingId?: string
  className?: string
}) {
  return (
    <section className={className} aria-labelledby={headingId}>
      <h2 id={headingId}>{table.caption}</h2>
      <div className="seo-portion-table-wrap">
        <table>
          <thead>
            <tr>
              {table.columns.map((c) => (
                <th key={c} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => (
              <tr key={row[0]}>
                {row.map((cell, i) =>
                  i === 0 ? (
                    <th key={i} scope="row">
                      {cell}
                    </th>
                  ) : (
                    <td key={i}>{cell}</td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
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

  const oatmeal = page.slug === 'oatmeal'
  const calculatorJump = page.calculatorCtaNote ? (
    <div className="hero-cta-row">
      {/* Ghost on desktop, where the calculator is already on screen.
          Mobile restores the primary fill — the panel sits below the fold. */}
      <a className="btn btn-ghost hero-cta" href="#calculator" onClick={focusCalculator}>
        {page.calculatorCta ?? 'Estimate this meal'}
      </a>
      <p className="hero-cta-note">{page.calculatorCtaNote}</p>
    </div>
  ) : (
    <a
      className={useBands ? 'hero-method-link hero-calc-link' : 'hero-method-link'}
      href="#calculator"
      onClick={focusCalculator}
    >
      {page.calculatorCta ?? 'Estimate this meal'}
    </a>
  )

  const relatedCards = [
    ...related.slice(0, 3).map((r) => {
      const g = HOME_GUIDES.find((x) => x.to === `/${r.slug}`)
      return {
        to: `/${r.slug}`,
        title: g?.title ?? r.h1,
        blurb: g?.blurb ?? shortBlurb(r.description),
        stat: g?.stat,
      }
    }),
    {
      to: '/',
      title: 'Daily fiber calculator',
      blurb: 'Paste any meal and compare to your daily target.',
      stat: '25 g',
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

      <section
        className={['hero', useBands ? 'seo-split' : '', oatmeal ? 'hero-oatmeal' : '']
          .filter(Boolean)
          .join(' ')}
      >
        <div className="hero-copy seo-landing-copy">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link to="/#guides">Guides</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{page.h1.replace(/\?$/, '')}</span>
          </nav>
          <h1>{page.h1}</h1>

          {page.updated ? <GuideByline updated={page.updated} /> : null}

          {page.answer || facts.length > 0 ? (
            <div className="quick-answer">
              <p className="quick-answer-kicker">Quick answer</p>
              {page.answer ? <SeoAnswer answer={page.answer} showNote={false} /> : null}
              {facts.length > 0 ? (
                <ul className="quick-answer-stats" data-count={Math.min(4, facts.length)}>
                  {facts.map((f) => (
                    <li key={f.label}>
                      <span>{f.label}</span>
                      <strong>{f.value}</strong>
                      {f.note ? <em>{f.note}</em> : null}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          {heroLede ? <p className="lede">{heroLede}</p> : null}

          {page.portionTable && !oatmeal ? <PortionComparison table={page.portionTable} /> : null}

          {!oatmeal ? calculatorJump : null}
        </div>

        {/* Same source order as before (answer, table, jump, calculator). Desktop
            grid keeps the calculator in the right column; mobile flex lifts it
            under the ~4g answer and drops the portion table below the form. */}
        {oatmeal && page.portionTable ? <PortionComparison table={page.portionTable} /> : null}
        {oatmeal ? calculatorJump : null}

        <FiberCalculator
          key={page.slug}
          initialSex={page.defaultSex}
          initialAge={page.defaultAge}
          initialMode={page.defaultMode}
          initialMeal={page.defaultMeal}
          examples={page.examples?.length ? page.examples : [page.defaultMeal]}
          starters={page.quickPills}
          panelLabel="Estimate this meal — or paste your own"
          anchorOnInput={oatmeal}
        />
      </section>

      {page.portionTable ? (
        <div className="seo-portion-follow">
          {page.portionTable.note ? <p className="seo-portion-table-note">{page.portionTable.note}</p> : null}
          <p className="seo-portion-table-links">
            Prefill a portion in the calculator, then add toppings — or open{' '}
            <a href="/chia-seeds">chia seeds</a>,{' '}
            <a href="/high-fiber-breakfast">high-fiber breakfast</a>, or the{' '}
            <a href="/">daily calculator</a> for a full bowl estimate.
          </p>
        </div>
      ) : null}


      {page.dataTable ? (
        <div className="seo-data-table-wrap">
          <PortionComparison
            table={page.dataTable}
            headingId="data-table-heading"
            className="seo-portion-table seo-data-table"
          />
          {page.dataTable.note ? <p className="seo-portion-table-note">{page.dataTable.note}</p> : null}
        </div>
      ) : null}

      {(() => {
        const faq = <FaqBlock title="Questions" faqs={page.faqs} />
        const sources =
          page.sources && page.sources.length > 0 ? (
            <GuideSources sources={page.sources} updated={page.updated} />
          ) : null
        const signup = (
          <EmailSignup
            source={`guide-${page.slug}`}
            variant="aside"
            kicker=""
            title="Reach your target without the bloating"
            copy="Free 7-day starter plan, one email a day."
            button="Get the plan"
          />
        )
        return page.sections && page.sections.length > 0 ? (
          <SeoArticle
            sections={page.sections}
            showContents
            ctaAfter={2}
            ctaHref="#calculator"
            ctaLabel={page.articleCta ?? 'Estimate your bowl in the calculator'}
            onCtaClick={focusCalculator}
            after={
              <>
                {faq}
                {sources}
              </>
            }
            extraToc={[
              ...(page.faqs.length ? [{ href: '#faq', label: 'Questions' }] : []),
              ...(sources ? [{ href: '#sources', label: 'Sources' }] : []),
            ]}
            asideExtra={signup}
          />
        ) : (
          <>
            {faq}
            {sources}
          </>
        )
      })()}

      <GuideCards
        id="related"
        title="Keep reading"
        items={relatedCards}
      />

      <SiteFooter />
    </div>
  )
}
