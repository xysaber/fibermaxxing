import { useMemo, useRef, useState, type FormEvent } from 'react'
import { FOOD_COUNT, FOOD_SOURCE } from './data/foods'
import { buildSuggestions } from './data/suggestions'
import {
  fiberTarget,
  parseMeal,
  standardFiberAi,
  type AgeGroup,
  type GoalMode,
  type ParseResult,
  type Sex,
} from './lib/parseMeal'
import { buildShareText, downloadReportPng } from './lib/shareReport'
import './App.css'

const EXAMPLES = [
  'I ate 2 eggs, 1 bowl of oatmeal, and an apple',
  'Breakfast: chia pudding, raspberries, Greek yogurt',
  'Lentils, broccoli, brown rice, and avocado for dinner',
  'Psyllium husk in water, salad, hummus, and a pear',
]

const USDA_FDC_URL = 'https://fdc.nal.usda.gov/'

function ProgressRing({ pct, tone = 'dark' }: { pct: number; tone?: 'dark' | 'light' }) {
  const r = 46
  const c = 2 * Math.PI * r
  const clamped = Math.min(100, Math.max(0, pct))
  const offset = c - (clamped / 100) * c
  const track = tone === 'light' ? 'rgba(26, 34, 56, 0.1)' : 'rgba(255,255,255,0.15)'
  const progress = tone === 'light' ? '#2f5bff' : '#5b8cff'

  return (
    <div className={`ring-wrap ring-wrap-${tone}`} aria-hidden>
      <svg viewBox="0 0 108 108">
        <circle cx="54" cy="54" r={r} fill="none" stroke={track} strokeWidth="8" />
        <circle
          cx="54"
          cy="54"
          r={r}
          fill="none"
          stroke={progress}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="ring-label">
        <div className="pct">{Math.round(clamped)}%</div>
        <div className="sub">of goal</div>
      </div>
    </div>
  )
}

function App() {
  const [sex, setSex] = useState<Sex>('female')
  const [age, setAge] = useState<AgeGroup>('19-50')
  const [mode, setMode] = useState<GoalMode>('maxxing')
  const [meal, setMeal] = useState('')
  const [result, setResult] = useState<ParseResult | null>(null)
  const [noFoodsError, setNoFoodsError] = useState(false)
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [activeExample, setActiveExample] = useState<string | null>(null)
  const [showExamples, setShowExamples] = useState(false)
  const resultsRef = useRef<HTMLElement>(null)
  const reportCardRef = useRef<HTMLDivElement>(null)

  const standardAi = useMemo(() => standardFiberAi(sex, age), [sex, age])
  const target = useMemo(() => fiberTarget(sex, age, mode), [sex, age, mode])

  const hasMatches = !!result && result.matches.length > 0
  const pct = hasMatches ? Math.min(150, (result.totalFiberG / target) * 100) : 0
  const gap = hasMatches ? Math.max(0, Math.round((target - result.totalFiberG) * 10) / 10) : 0

  const suggestions = useMemo(() => {
    if (!hasMatches || !result) return null
    const eaten = new Set(result.matches.map((m) => m.food.id))
    return buildSuggestions(gap, eaten, result.estimatedCount)
  }, [hasMatches, result, gap])

  const topFoods = useMemo(() => {
    if (!hasMatches || !result) return []
    return [...result.matches].sort((a, b) => b.fiberG - a.fiberG).slice(0, 2)
  }, [hasMatches, result])

  function runCalc(rawText: string) {
    const text = rawText.trim()
    if (!text) {
      setResult(null)
      setNoFoodsError(false)
      return
    }
    const parsed = parseMeal(text)
    setResult(parsed)
    setCopied(false)

    if (parsed.matches.length === 0) {
      setNoFoodsError(true)
      return
    }

    setNoFoodsError(false)
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    runCalc(meal)
  }

  const shareText = hasMatches && result
    ? buildShareText({
        totalFiberG: result.totalFiberG,
        target,
        pct,
        gap,
        hasEstimates: result.estimatedCount > 0,
      })
    : ''

  async function copyShare() {
    if (!shareText) return
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  async function onDownload() {
    if (!reportCardRef.current || downloading) return
    setDownloading(true)
    try {
      await downloadReportPng(reportCardRef.current)
    } catch {
      // ignore export failures on restricted browsers
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="/">
          <svg className="brand-icon" viewBox="0 0 32 32" aria-hidden>
            <rect width="32" height="32" rx="8" fill="#151b2e" />
            <circle cx="16" cy="16" r="8.5" fill="none" stroke="#3d4660" strokeWidth="2.75" />
            <path
              d="M16 7.5a8.5 8.5 0 0 1 7.36 12.75"
              fill="none"
              stroke="#2f5bff"
              strokeWidth="2.75"
              strokeLinecap="round"
            />
            <circle cx="16" cy="7.5" r="2.4" fill="#5b8cff" />
          </svg>
          <span className="brand-lockup">
            <span className="brand-mark">
              Fiber<span className="brand-max">max</span>
            </span>
            <span className="brand-tag">Daily fibermaxxing calculator</span>
          </span>
        </a>
        <span className="pill-meta">
          {FOOD_COUNT.toLocaleString()} foods · USDA-based · Instant
        </span>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <h1>
            How much fiber did you <em>actually</em> eat today?
          </h1>
          <p className="lede">
            Free fibermaxxing calculator: log what you ate, estimate daily fiber from USDA-based data,
            and compare it to U.S. Adequate Intake targets — no signup.
          </p>
          <ul className="hero-points">
            <li>USDA-based fiber estimates for real foods</li>
            <li>Daily targets from U.S. Adequate Intake (by sex &amp; age)</li>
            <li>Instant fibermaxxing score vs your gram goal</li>
          </ul>
          <a className="hero-method-link" href="#method">
            How we calculate
          </a>
        </div>

        <form className="panel" onSubmit={onSubmit}>
          <p className="panel-label">Daily fiber tracker</p>
          <div className="row row-profile">
            <div className="field">
              <label htmlFor="sex">Sex</label>
              <select id="sex" value={sex} onChange={(e) => setSex(e.target.value as Sex)}>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="unspecified">Prefer not to say</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="age">Age</label>
              <select id="age" value={age} onChange={(e) => setAge(e.target.value as AgeGroup)}>
                <option value="19-50">19–50</option>
                <option value="51+">51+</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="mode">Goal</label>
              <select id="mode" value={mode} onChange={(e) => setMode(e.target.value as GoalMode)}>
                <option value="standard">Standard</option>
                <option value="maxxing">Fibermaxxing</option>
              </select>
            </div>
          </div>

          <div className="target-banner" aria-live="polite">
            <div className="target-banner-main">
              <span className="target-banner-label">Your daily target</span>
              <span className="target-banner-value">
                {target}
                <small>g</small>
              </span>
            </div>
            <p className="target-banner-note">
              {mode === 'standard'
                ? 'Based on commonly cited U.S. Adequate Intake levels (~14g fiber per 1,000 kcal).'
                : `Stretch goal: ${standardAi}g Adequate Intake × 1.5 (capped at 50g). Not an official recommendation — increase gradually.`}
            </p>
          </div>

          <div className="field">
            <label htmlFor="meal">What did you eat today?</label>
            <textarea
              id="meal"
              className={`meal-box${noFoodsError ? ' meal-box-error' : ''}`}
              value={meal}
              onChange={(e) => {
                setMeal(e.target.value)
                setActiveExample(null)
                if (noFoodsError) setNoFoodsError(false)
              }}
              placeholder="e.g. I ate oatmeal, an apple, and chia seeds"
              rows={4}
              enterKeyHint="done"
              aria-invalid={noFoodsError}
              aria-describedby={noFoodsError ? 'meal-error' : undefined}
            />
            {noFoodsError && (
              <p id="meal-error" className="field-error" role="alert">
                No foods detected. Try naming specific foods (e.g. oatmeal, apple, chia seeds) and
                calculate again.
              </p>
            )}
          </div>

          <div className="examples">
            <button
              type="button"
              className="examples-toggle"
              aria-expanded={showExamples}
              aria-controls="examples-list"
              onClick={() => setShowExamples((v) => !v)}
            >
              {showExamples ? 'Hide examples' : 'Show examples'}
            </button>
            {showExamples && (
              <div className="examples-grid" id="examples-list">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    className={activeExample === ex ? 'is-active' : undefined}
                    onClick={() => {
                      setMeal(ex)
                      setActiveExample(ex)
                      runCalc(ex)
                    }}
                  >
                    {ex}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="actions">
            <button type="submit" className="btn btn-primary">
              Calculate fiber
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setMeal('')
                setResult(null)
                setNoFoodsError(false)
                setActiveExample(null)
              }}
            >
              Clear
            </button>
          </div>
        </form>
      </section>

      {hasMatches && result && (
        <section className="results" aria-live="polite" ref={resultsRef}>
          <div className="score-card">
            <div className="score-head">
              <div>
                <h2>
                  {pct >= 100
                    ? mode === 'maxxing'
                      ? 'Fibermaxxing goal reached'
                      : 'Daily fiber goal reached'
                    : gap > 0
                      ? `${gap}g fiber still to go`
                      : 'On track for today'}
                </h2>
                <p>
                  {result.matches.length} food{result.matches.length === 1 ? '' : 's'}
                  {result.estimatedCount > 0
                    ? ` · ${result.estimatedCount} estimated`
                    : ' matched'}{' '}
                  · {result.totalCalories} kcal logged · target {target}g
                </p>
              </div>
              <ProgressRing pct={pct} />
            </div>
            <div className="metrics metrics-3">
              <div className="metric">
                <div className="k">Fiber today</div>
                <div className="v">
                  {result.totalFiberG}
                  <small>g</small>
                </div>
              </div>
              <div className="metric">
                <div className="k">Daily target</div>
                <div className="v">
                  {target}
                  <small>g</small>
                </div>
              </div>
              <div className="metric">
                <div className="k">{gap <= 0 ? 'Over goal' : 'Still to go'}</div>
                <div className="v">
                  {gap <= 0
                    ? Math.round((result.totalFiberG - target) * 10) / 10
                    : gap}
                  <small>g</small>
                </div>
              </div>
            </div>
            {result.estimatedCount > 0 && (
              <p className="score-estimate-note">
                Includes estimated items — totals are approximate.
              </p>
            )}
            <div className="score-fill">
              {suggestions && (
                <div className="score-tip">
                  <h3>{gap <= 0 ? 'Goal reached' : 'Almost there'}</h3>
                  <p>
                    {gap <= 0
                      ? 'You hit today’s fiber target. Keep mixing sources and drink enough water.'
                      : 'A small add-on may close today’s gap. Full suggestions are on the right.'}
                  </p>
                </div>
              )}
              {topFoods.length > 0 && (
                <ul className="score-top-foods">
                  {topFoods.map((m) => (
                    <li key={`top-${m.food.id}-${m.matchedAlias}`}>
                      <span>{m.food.name}</span>
                      <span className="g">{m.fiberG}g</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="detail-panel">
            <h3>Matched foods</h3>
            {result.estimatedCount > 0 && (
              <p className="estimate-note">
                Items marked <strong>Estimated</strong> use a category-based fiber estimate when the
                food is not a verified database line. Prefer specific food names for better accuracy.
              </p>
            )}
            <ul className="food-list">
              {result.matches.map((m) => (
                <li key={`${m.food.id}-${m.matchedAlias}`}>
                  <span className="food-name">
                    {m.food.name}
                    {m.source === 'estimate' ? (
                      <span
                        className="src-badge src-estimate"
                        title="Category-based estimate — not a verified USDA line item"
                      >
                        Estimated
                      </span>
                    ) : (
                      <span className="src-badge src-db" title="Matched in food database">
                        Database
                      </span>
                    )}
                  </span>
                  <span className="qty">
                    ×{m.qty} · {m.food.serving}
                  </span>
                  <span className="fib">{m.fiberG}g</span>
                </li>
              ))}
            </ul>
            {result.unmatchedHints.length > 0 && (
              <p className="unmatched-note">
                Couldn’t match: {result.unmatchedHints.slice(0, 8).join(', ')}
                {result.unmatchedHints.length > 8 ? '…' : ''}
              </p>
            )}

            {suggestions && (
              <div className={`suggestions suggestions-${suggestions.tone}`}>
                <h3>{suggestions.headline}</h3>
                <p className="suggestions-detail">{suggestions.detail}</p>
                {suggestions.items.length > 0 && (
                  <ul className="suggestions-list">
                    {suggestions.items.map((item) => (
                      <li key={item.id}>
                        <div className="suggestions-copy">
                          <strong>{item.name}</strong>
                          <span>
                            {item.serving} · ~{item.fiberG}g fiber
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="share-row">
              <button type="button" className="btn btn-primary" onClick={onDownload} disabled={downloading}>
                {downloading ? 'Preparing…' : 'Download PNG'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={copyShare}>
                {copied ? 'Copied' : 'Copy text report'}
              </button>
            </div>

            <div className="report-card-capture" ref={reportCardRef} id="share-card" aria-hidden>
              <div className="report-card-portrait">
                <div className="rcp-top">
                  <div className="rcp-brand">
                    Fiber<span>max</span>
                  </div>
                  <div className="rcp-date">
                    {new Date().toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>
                <p className="rcp-kicker">Daily fiber report</p>
                <div className="rcp-ring-wrap">
                  <ProgressRing pct={pct} tone="light" />
                </div>
                <p className="rcp-total">
                  {result.totalFiberG}
                  <small>g</small>
                  <span className="rcp-of">/ {target}g target</span>
                </p>
                <p className="rcp-status">
                  {gap <= 0 ? 'Goal reached' : `${gap}g still to go`}
                </p>
                {topFoods.length > 0 && (
                  <div className="rcp-foods-block">
                    <p className="rcp-foods-label">Top foods today</p>
                    <ul className="rcp-foods">
                      {topFoods.map((m) => (
                        <li key={`rcp-${m.food.id}`}>
                          <span>{m.food.name}</span>
                          <span>{m.fiberG}g</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.estimatedCount > 0 && (
                  <p className="rcp-est">Includes estimated foods</p>
                )}
                <div className="rcp-footer">
                  <p className="rcp-url">getfibermaxxing.com</p>
                  <p className="rcp-tag">Free fibermaxxing calculator</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="method-strip" id="method">
        <h2>How we calculate</h2>
        <div className="method-grid">
          <div className="method-col">
            <h3>Daily fiber target</h3>
            <p>
              The <strong>Standard</strong> goal follows commonly cited U.S. Adequate Intake levels —
              about <strong>14g per 1,000 kcal</strong> — shown as daily grams by sex and age (for
              example, women 19–50 ≈ 25g; men 19–50 ≈ 38g; lower after age 50).
            </p>
            <p>
              <strong>Fibermaxxing</strong> here is Standard × 1.5, capped at 50g. It is a personal
              stretch rule on this site, not an official recommendation.
            </p>
          </div>
          <div className="method-col">
            <h3>Food fiber values</h3>
            <p>
              Food matches use{' '}
              <a href={USDA_FDC_URL} target="_blank" rel="noopener noreferrer">
                USDA FoodData Central
              </a>{' '}
              (SR Legacy) plus a few curated staples. Servings are typical reference amounts; real
              portions vary. <strong>Estimated</strong> means a category-based approximation when a
              food is not a verified line item.
            </p>
            <p className="method-source">Data source: {FOOD_SOURCE}</p>
          </div>
        </div>
        <p className="method-limit">
          Fibermax is for education and self-tracking only — not medical advice. Talk to a clinician
          before major diet changes.
        </p>
      </section>

      <section className="seo-strip">
        <h2>Fibermaxxing FAQ</h2>
        <div className="faq">
          <details open>
            <summary>What is fibermaxxing?</summary>
            <p>
              Fibermaxxing means intentionally increasing daily dietary fiber — often toward stretch
              targets above standard adequate intake — to support digestive wellness and fullness. This
              calculator helps you estimate intake against a clear daily gram goal.
            </p>
          </details>
          <details>
            <summary>How much fiber should I eat per day?</summary>
            <p>
              In the U.S., adequate intake is often cited as about 25g/day for women ages 19–50 and
              38g/day for men ages 19–50 (21g and 30g after age 50), based on roughly 14g of fiber per
              1,000 calories. This calculator’s Standard goal uses those estimates. Fibermaxxing on
              this site is Standard × 1.5 (max 50g) and is not an official recommendation. Increase
              gradually and drink enough water.
            </p>
          </details>
          <details>
            <summary>Where do fiber values come from?</summary>
            <p>
              Primarily{' '}
              <a href={USDA_FDC_URL} target="_blank" rel="noopener noreferrer">
                USDA FoodData Central
              </a>{' '}
              reference data, with typical servings. See{' '}
              <a href="#method">How we calculate</a> for details on targets, estimates, and limits.
            </p>
          </details>
          <details>
            <summary>Is this fibermaxxing calculator medical advice?</summary>
            <p>
              No. Fiber totals are approximate estimates for education and self-tracking only. If you
              have a digestive condition or take medication, check with a qualified clinician before
              making large diet changes.
            </p>
          </details>
        </div>
      </section>

      <footer className="footer">
        <nav className="footer-nav" aria-label="Footer">
          <a href="#method">Method &amp; Sources</a>
        </nav>
        <p>
          © {new Date().getFullYear()} Fibermax — free fibermaxxing calculator and daily fiber tracker.
          Food fiber values are approximate (USDA FoodData Central and curated staples) and are not a
          substitute for professional medical advice.
        </p>
      </footer>
    </div>
  )
}

export default App
