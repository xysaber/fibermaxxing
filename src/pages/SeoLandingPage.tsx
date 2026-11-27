import { useEffect, useState, type MouseEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { DocumentMeta } from '../components/DocumentMeta'
import { EmailSignup } from '../components/EmailSignup'
import { FaqBlock } from '../components/FaqBlock'
import { FiberCalculator } from '../components/FiberCalculator'
import { FoodHeroPhoto, FoodThumb, PhotoCredits } from '../components/FoodPhoto'
import { GuideCards } from '../components/GuideCards'
import { HOME_GUIDES } from '../components/GuidesStrip'
import { GuideByline, GuideSources } from '../components/GuideSources'
import { SeoAnswer } from '../components/SeoAnswer'
import { SeoArticle } from '../components/SeoArticle'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import {
  getSeoPage,
  GUIDE_INDEX_MAP,
  hasLazyPage,
  loadSeoPage,
  SEO_PAGE_MAP,
  type SeoPortionTable,
} from '../content/seoPages'
import { foodPhotoFor, type FoodPhoto } from '../content/foodPhotos'
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

function cellNumber(text: string) {
  const m = text.replace(/,/g, '').match(/\d+(\.\d+)?/)
  return m ? Number(m[0]) : 0
}

/** Full-width data table (design board 19): numbers right-aligned, a bar on the Fiber column. */
function PortionComparison({
  table,
  headingId = 'portion-table-heading',
  className = 'seo-portion-table',
}: {
  table: SeoPortionTable
  headingId?: string
  className?: string
}) {
  const fiberIdx = table.columns.findIndex((c, i) => i > 0 && /^fiber$/i.test(c.trim()))
  const max = fiberIdx > 0 ? Math.max(...table.rows.map((r) => cellNumber(r[fiberIdx] ?? ''))) : 0
  const isText = (i: number) => i === 0 || /^(portion|serving)$/i.test(table.columns[i]?.trim() ?? '')
  const colClass = (i: number) =>
    i === fiberIdx && max > 0 ? 'col-fiber' : isText(i) ? undefined : 'col-num'

  return (
    <section className={`${className} data-table-v2`} aria-labelledby={headingId}>
      <div className="data-table-head">
        <h2 id={headingId}>{table.caption}</h2>
        {table.note ? <p className="data-table-note">{table.note}</p> : null}
      </div>
      <div className="seo-portion-table-wrap data-table-scroll">
        <table>
          <thead>
            <tr>
              {table.columns.map((c, i) => (
                <th key={c} scope="col" className={colClass(i)}>
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
                  ) : i === fiberIdx && max > 0 ? (
                    <td key={i} className="col-fiber">
                      <span className="fiber-cell">
                        <b>{cell}</b>
                        <span className="fiber-bar" aria-hidden="true">
                          <i style={{ width: `${Math.max(4, Math.round((cellNumber(cell) / max) * 100))}%` }} />
                        </span>
                      </span>
                    </td>
                  ) : (
                    <td key={i} className={colClass(i)}>
                      {cell}
                    </td>
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

type HubItem = { to: string; name: string; serving: string; fiber: string; photo?: FoodPhoto }

/** Hub: one panel per category, foods as a two-column list (design board 16) — no orphan cards. */
function CategoryPanel({ id, title, items }: { id: string; title: string; items: HubItem[] }) {
  if (items.length === 0) return null
  const max = Math.max(...items.map((it) => cellNumber(it.fiber)))
  const top = items.reduce((a, b) => (cellNumber(b.fiber) > cellNumber(a.fiber) ? b : a))
  return (
    <section className="category-panel" id={id} aria-labelledby={`${id}-heading`}>
      <div className="category-panel-head">
        <h3 id={`${id}-heading`}>
          {title} <span>{items.length} foods</span>
        </h3>
        <p>
          Most per serving:{' '}
          <b>
            {top.name}, {top.fiber}
          </b>
        </p>
      </div>
      <ul className="category-list">
        {items.map((it) => (
          <li key={it.to}>
            <Link to={it.to}>
              {it.photo ? <FoodThumb photo={it.photo} size={44} className="category-thumb" /> : (
                <span className="category-thumb category-thumb--empty" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 20 20">
                    <path d="M10 17V9M10 9c0-3 2-5 5-5 0 3-2 5-5 5zM10 12c0-2.5-1.8-4.5-4.5-4.5 0 2.5 1.8 4.5 4.5 4.5z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
              <span className="category-food">
                <b>{it.name}</b>
                <span>{it.serving}</span>
              </span>
              <span className="fiber-bar" aria-hidden="true">
                <i style={{ width: `${Math.max(4, Math.round((cellNumber(it.fiber) / max) * 100))}%` }} />
              </span>
              <b className="category-fiber">{it.fiber}</b>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

const CALC_CHECKS = [
  'Prefilled with an example you can edit',
  'Matches each food to USDA FoodData Central',
  'Same target and calculator as the home page',
]

function calculatorHeading(h1: string) {
  const m = h1.match(/^How much fiber is in (.+)\?$/i)
  return m ? `Add ${m[1]} to a meal and see your total` : 'Estimate a meal and see your total'
}

export function SeoLandingPage() {
  const { slug } = useParams<{ slug: string }>()
  const page = slug ? getSeoPage(slug) : undefined
  const pending = Boolean(slug && !page && hasLazyPage(slug))
  const [, setLoadedSlug] = useState<string | null>(null)

  useEffect(() => {
    if (!pending || !slug) return
    let live = true
    loadSeoPage(slug).then(() => {
      if (live) setLoadedSlug(slug)
    })
    return () => {
      live = false
    }
  }, [pending, slug])

  useEffect(() => {
    if (page) trackPageView(`/${page.slug}`)
  }, [page])

  if (pending) {
    // Client-side navigation to a code-split guide: keep the shell while its chunk loads.
    return (
      <div className="app">
        <SiteHeader />
        <div className="seo-loading" aria-busy="true" />
        <SiteFooter />
      </div>
    )
  }

  if (!page) {
    return <NotFoundPage />
  }

  const cardFor = (s: string) => {
    const core = SEO_PAGE_MAP[s]
    if (core?.publish) {
      const g = HOME_GUIDES.find((x) => x.to === `/${core.slug}`)
      return {
        to: `/${core.slug}`,
        title: g?.title ?? core.h1,
        blurb: g?.blurb ?? shortBlurb(core.description),
        stat: g?.stat as string | undefined,
      }
    }
    const idx = GUIDE_INDEX_MAP[s]
    return idx ? { to: `/${idx.slug}`, title: idx.title, blurb: idx.blurb, stat: idx.stat } : null
  }

  const useBands = page.layout !== 'default'
  const facts = page.facts ?? []
  const heroLede = page.intro?.[0]?.trim() || null
  const heroPhoto = page.kind === 'hub' ? undefined : foodPhotoFor(page.slug)

  const wideHero = page.kind === 'hub' || facts.length > 4 || Boolean(page.callout)
  const calculatorJump = (
    <div className="hero-cta-row">
      <a className="btn btn-ghost hero-cta" href="#calculator" onClick={focusCalculator}>
        {page.calculatorCta ?? 'Estimate this meal'} <span aria-hidden="true">↓</span>
      </a>
      {page.calculatorCtaNote ? <p className="hero-cta-note">{page.calculatorCtaNote}</p> : null}
    </div>
  )

  const hubItems = (slugs: string[]): HubItem[] =>
    slugs
      .map((s) => GUIDE_INDEX_MAP[s])
      .filter((g): g is NonNullable<typeof g> => Boolean(g?.name))
      .map((g) => ({
        to: `/${g.slug}`,
        name: g.name!,
        serving: g.serving ?? '',
        fiber: g.stat ?? '',
        photo: foodPhotoFor(g.slug),
      }))

  // Calculator: same width and style as the home page, in its own band (design boards 21–22).
  // The hub keeps its food list first (board 16), so its calculator follows the table.
  const calcBand = (
      <section className="calc-band" aria-labelledby="calc-band-heading">
        <div className="calc-band-copy">
          <p className="hero-kicker">Free fiber calculator · no signup</p>
          <h2 id="calc-band-heading">{calculatorHeading(page.h1)}</h2>
          <p className="lede">
            Type what you ate the way you’d say it. Edit any portion before you trust the total.
          </p>
          <ul className="hero-proof">
            {CALC_CHECKS.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>

        <FiberCalculator
          key={page.slug}
          initialSex={page.defaultSex}
          initialAge={page.defaultAge}
          initialMode={page.defaultMode}
          initialMeal={page.defaultMeal}
          examples={page.examples?.length ? page.examples : [page.defaultMeal]}
          starters={page.quickPills}
          panelLabel="Estimate this meal"
        />
      </section>
  )

  const relatedCards = [
    ...page.related
      .map(cardFor)
      .filter((c): c is NonNullable<typeof c> => Boolean(c))
      .slice(0, 3),
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
        className={['hero', useBands ? 'seo-split' : '', 'seo-hero', wideHero ? 'seo-hero--wide' : '']
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

          {heroLede ? <p className="lede">{heroLede}</p> : null}

          {page.callout ? (
            <aside className="seo-callout" role="note" aria-label={page.callout.title}>
              <strong>{page.callout.title}</strong>
              <p>{page.callout.text}</p>
            </aside>
          ) : null}

          {calculatorJump}
        </div>

        {page.answer || facts.length > 0 ? (
          <div
            className={`quick-answer${wideHero && facts.length <= 4 ? ' quick-answer--split' : ''}${heroPhoto ? ' quick-answer--photo' : ''}`}
          >
            {heroPhoto ? <FoodHeroPhoto photo={heroPhoto} /> : null}
            <div className="quick-answer-main">
              <p className="quick-answer-kicker">Quick answer</p>
              {page.answer ? <SeoAnswer answer={page.answer} showNote={false} /> : null}
            </div>
            {facts.length > 0 ? (
              <ul className="quick-answer-stats" data-count={Math.min(5, facts.length)}>
                {facts.map((f) => (
                  <li key={f.label}>
                    <span>{f.label}</span>
                    <strong>{f.value}</strong>
                    {f.note ? <em>{f.note}</em> : null}
                  </li>
                ))}
              </ul>
            ) : null}
            {page.answer?.note ? <p className="quick-answer-note">{page.answer.note}</p> : null}
          </div>
        ) : null}
      </section>

      {page.kind !== 'hub' ? calcBand : null}

      {page.guideGroups?.length ? (
        <section className="seo-hub-groups" aria-labelledby="hub-groups-heading">
          <div className="hub-groups-head">
            <h2 id="hub-groups-heading">Browse by category</h2>
            <nav className="hub-jump" aria-label="Categories">
              {page.guideGroups.map((group, i) => (
                <a key={group.title} href={`#group-${i}`}>
                  {group.title} <span>{hubItems(group.items).length}</span>
                </a>
              ))}
            </nav>
          </div>
          {page.guideGroups.map((group, i) => (
            <CategoryPanel key={group.title} id={`group-${i}`} title={group.title} items={hubItems(group.items)} />
          ))}
          <PhotoCredits
            className="photo-credits hub-photo-credits"
            photos={page.guideGroups.flatMap((g) => hubItems(g.items).flatMap((it) => (it.photo ? [it.photo] : [])))}
          />
        </section>
      ) : null}

      {page.portionTable ? (
        <div className="seo-data-table-wrap">
          <PortionComparison table={page.portionTable} />
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
        </div>
      ) : null}

      {page.kind === 'hub' ? calcBand : null}

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
