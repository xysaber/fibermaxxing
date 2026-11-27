import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { DocumentMeta } from '../components/DocumentMeta'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import { STARTER_DAYS } from '../content/starterPlan'
import { STARTER_PHOTOS, photoUrl } from '../content/starterPhotos'
import { track, trackPageView } from '../lib/analytics'
import '../styles/plan.css'
import '../styles/starter-plan.css'

export const STARTER_PLAN_META = {
  path: '/7-day-plan',
  title: 'Free 7-Day Fiber Plan: Easy Meal Ideas | GetFibermaxxing',
  description:
    'A free 7-day plan for eating more fiber without the bloating: breakfast, lunch, snack and dinner ideas with gram counts from USDA data.',
}

const UTM = 'utm_source=plan7&utm_medium=web'

function calcLink(meal: string): string {
  return `/?meal=${encodeURIComponent(meal)}&${UTM}#calculator`
}

function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
      <path d="M5 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function daySub(d: (typeof STARTER_DAYS)[number]): string {
  if (d.day === 1) return 'A 60-second check'
  if (d.day === 6) return 'Keeping it comfortable'
  if (d.day === 7) return 'Compare with Day 1'
  return `${d.options.length} options · ${(d.adds ?? '').replace('+', '')}`
}

export function StarterPlanPage() {
  const [params, setParams] = useSearchParams()
  // Prerendered HTML shows Day 1; the ?day= choice applies after hydration so markup matches.
  const [hydrated, setHydrated] = useState(false)
  const raw = hydrated ? Number(params.get('day')) : 1
  const sel = Number.isInteger(raw) && raw >= 1 && raw <= 7 ? raw : 1
  const cur = STARTER_DAYS[sel - 1]

  useEffect(() => {
    setHydrated(true)
    trackPageView(STARTER_PLAN_META.path)
  }, [])

  function pick(day: number) {
    const next = new URLSearchParams(params)
    next.set('day', String(day))
    setParams(next, { replace: true })
    track('plan7_day_view', { day })
    document.getElementById('plan-day')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="app">
      <DocumentMeta title={STARTER_PLAN_META.title} description={STARTER_PLAN_META.description} path={STARTER_PLAN_META.path} />
      <SiteHeader />

      <section className="sp-wrap">
        <p className="pl-kicker">Free starter plan</p>
        <h1 className="sp-title">Your 7-day fiber plan</h1>
        <p className="sp-lede">
          One small idea a day, about 3–8 g each. Pick the options that fit how you already eat. Each one opens in the
          calculator so you can adjust the portions.
        </p>

        <div className="sp-layout">
          <nav className="sp-days" aria-label="Plan days">
            {STARTER_DAYS.map((d) => (
              <button
                key={d.day}
                type="button"
                className="sp-day-btn"
                aria-label={`Day ${d.day}: ${d.heading}`}
                aria-current={d.day === sel ? 'step' : undefined}
                data-past={d.day < sel ? '' : undefined}
                onClick={() => pick(d.day)}
              >
                <span className="sp-day-n">
                  <span className="sp-day-word">Day</span>
                  {d.day}
                </span>
                <span className="sp-day-text">
                  <b>{d.heading}</b>
                  <span>{daySub(d)}</span>
                </span>
              </button>
            ))}
          </nav>

          <main className="sp-main" id="plan-day">
            <div className="sp-card">
              <div className="sp-card-meta">
                <span className="pl-kicker">Day {cur.day} of 7</span>
                {cur.adds && <span className="sp-adds">{cur.adds}</span>}
              </div>
              <h2>{cur.heading}</h2>
              <p className="sp-idea">{cur.idea}</p>

              {cur.options.length > 0 && (
                <div className="sp-options">
                  {cur.options.map((o) => {
                    const p = o.photo ? STARTER_PHOTOS[o.photo] : undefined
                    return (
                      <article className="sp-option" key={o.name}>
                        <div className="sp-photo">
                          {p && (
                            <img src={photoUrl(p, 640, 427)} alt={o.name} width={640} height={427} loading="lazy" decoding="async" />
                          )}
                          {p && (
                            <span className="sp-credit">
                              Photo:{' '}
                              <a href={p.authorUrl} target="_blank" rel="noopener noreferrer">
                                {p.author}
                              </a>{' '}
                              /{' '}
                              <a href={p.photoUrl} target="_blank" rel="noopener noreferrer">
                                Unsplash
                              </a>
                            </span>
                          )}
                        </div>
                        <div className="sp-option-body">
                          <div className="sp-option-head">
                            <h3>{o.name}</h3>
                            <span className="sp-grams">≈{o.grams} g</span>
                          </div>
                          <p>{o.detail}</p>
                          <Link
                            to={calcLink(o.meal)}
                            className="sp-open"
                            onClick={() => track('plan7_open_calculator', { day: cur.day, option: o.name })}
                          >
                            Open in calculator
                            <Arrow />
                          </Link>
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}

              {cur.paragraphs.map((t) => (
                <p className="sp-para" key={t}>
                  {t}
                </p>
              ))}
              <div className="sp-tip">
                <p className="sp-tip-label">Tip</p>
                <p>{cur.tip}</p>
              </div>
              {cur.options.length === 0 && cur.day !== 6 && (
                <Link to={`/?${UTM}#calculator`} className="pl-btn pl-btn-primary sp-calc-btn">
                  Open the calculator
                </Link>
              )}

              <div className="sp-pager">
                <button type="button" className="pl-btn pl-btn-ghost" disabled={sel === 1} onClick={() => pick(sel - 1)}>
                  Previous day
                </button>
                <button type="button" className="pl-btn pl-btn-primary" disabled={sel === 7} onClick={() => pick(sel + 1)}>
                  Next day
                </button>
              </div>
            </div>

            <aside className="sp-upsell">
              <div>
                <p className="sp-upsell-title">Want menus planned for you?</p>
                <p>The 30-day plan has daily menus and weekly shopping lists sized to your target.</p>
              </div>
              <Link to="/30-day-plan" className="pl-btn pl-btn-ghost">
                See the 30-day plan
              </Link>
            </aside>
            <p className="pl-fine">Fiber values are approximate, from USDA FoodData Central, and not medical advice.</p>
          </main>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
