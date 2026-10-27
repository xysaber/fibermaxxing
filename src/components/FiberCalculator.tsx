import { useMemo, useRef, useState, type FormEvent } from 'react'
import { buildSuggestions } from '../data/suggestions'
import { track } from '../lib/analytics'
import {
  fiberTarget,
  parseMeal,
  standardFiberAi,
  summarizeMatches,
  updateMatchGrams,
  updateMatchServings,
  type AgeGroup,
  type GoalMode,
  type ParseResult,
  type Sex,
} from '../lib/parseMeal'
import { buildMealLogPayload, postMealLog } from '../lib/mealLog'
import { buildShareText, downloadReportPng } from '../lib/shareReport'

const DEFAULT_EXAMPLES = [
  'I ate 2 eggs, 1 bowl of oatmeal, and an apple',
  'Breakfast: chia pudding, raspberries, Greek yogurt',
  'Lentils, broccoli, brown rice, and avocado for dinner',
  'Psyllium husk in water, salad, hummus, and a pear',
]

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
        />
      </svg>
      <div className="ring-label">
        <div className="pct">{Math.round(clamped)}%</div>
        <div className="sub">of goal</div>
      </div>
    </div>
  )
}

export type FiberCalculatorProps = {
  initialSex?: Sex
  initialAge?: AgeGroup
  initialMode?: GoalMode
  initialMeal?: string
  examples?: string[]
  panelLabel?: string
}

export function FiberCalculator({
  initialSex = 'female',
  initialAge = '19-50',
  initialMode = 'standard',
  initialMeal = '',
  examples = DEFAULT_EXAMPLES,
  panelLabel = 'Fiber intake estimator',
}: FiberCalculatorProps) {
  const [sex, setSex] = useState<Sex>(initialSex)
  const [age, setAge] = useState<AgeGroup>(initialAge)
  const [mode, setMode] = useState<GoalMode>(initialMode)
  const [meal, setMeal] = useState(initialMeal)
  const [result, setResult] = useState<ParseResult | null>(null)
  const [mealError, setMealError] = useState<'not_food' | 'consumable_untracked' | null>(null)
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [activeExample, setActiveExample] = useState<string | null>(null)
  const [showExamples, setShowExamples] = useState(false)
  const resultsRef = useRef<HTMLElement>(null)
  const reportCardRef = useRef<HTMLDivElement>(null)
  const [reportDate] = useState(() =>
    new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
  )

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

  const shareFoods = useMemo(() => {
    if (!hasMatches || !result) return []
    return result.matches.map((m) => ({ name: m.food.name, fiberG: m.fiberG }))
  }, [hasMatches, result])

  function runCalc(rawText: string, source: 'own' | 'example' = 'own') {
    const text = rawText.trim()
    const isExample = source === 'example' || (activeExample !== null && text === activeExample.trim())
    const eventParams: {
      source: 'own' | 'example'
      input_origin: 'typed' | 'example' | 'prefill'
    } = {
      source: isExample ? 'example' : 'own',
      input_origin: isExample ? 'example' : initialMeal && text === initialMeal.trim() ? 'prefill' : 'typed',
    }
    track('calculate_attempt', eventParams)
    if (!text) {
      track('calculate_result', { ...eventParams, status: 'empty' })
      setResult(null)
      setMealError(null)
      return
    }
    let parsed: ParseResult
    try {
      parsed = parseMeal(text)
    } catch {
      track('calculate_result', { ...eventParams, status: 'error' })
      setResult(null)
      setMealError('not_food')
      return
    }
    // Structured I/O log (separate from GA — may include input_text). Fire-and-forget.
    postMealLog(
      buildMealLogPayload({
        inputText: text,
        parsed,
        source: eventParams.source,
        inputOrigin: eventParams.input_origin,
      }),
    )
    track('calculate_result', {
      ...eventParams,
      // reliability: reliable | assumed | estimated | partial | empty — never meal text
      status: parsed.reliability === 'empty' ? 'no_match' : parsed.reliability,
      foods: parsed.matches.length,
      unmatched_count: parsed.unmatchedHints.length,
      estimated_count: parsed.estimatedCount,
      assumed_count: parsed.assumedCount,
      needs_confirm_count: parsed.needsConfirmCount,
    })
    setResult(parsed)
    setCopied(false)

    if (parsed.matches.length === 0) {
      setMealError(parsed.emptyKind ?? 'not_food')
      return
    }

    setMealError(null)
    track(isExample ? 'run_example' : 'calculate_own', {
      foods: parsed.matches.length,
      fiber: parsed.totalFiberG,
    })
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  function patchResult(nextMatches: ParseResult['matches']) {
    if (!result) return
    const summary = summarizeMatches(nextMatches)
    setResult({
      ...result,
      matches: nextMatches,
      ...summary,
    })
    track('edit_portion', { foods: nextMatches.length, fiber: summary.totalFiberG })
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    runCalc(meal, 'own')
  }

  const shareText =
    hasMatches && result
      ? buildShareText({
          totalFiberG: result.totalFiberG,
          target,
          pct,
          gap,
          hasEstimates: result.estimatedCount > 0,
          dateLabel: reportDate,
          topFoods: shareFoods,
        })
      : ''

  async function copyShare() {
    if (!shareText) return
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      track('share_copy')
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
      track('share_png')
    } catch {
      // ignore
    } finally {
      setDownloading(false)
    }
  }

  return (
    <>
      <form className="panel panel-calc" onSubmit={onSubmit} id="calculator">
        <p className="panel-label">{panelLabel}</p>

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
              ? `U.S. Adequate Intake reference · ~${standardAi}g for this profile`
              : `Fibermaxxing stretch · ${standardAi}g × 1.5 (max 50g)`}
          </p>
        </div>

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

        <div className="field field-meal">
          <label htmlFor="meal">What did you eat today?</label>
          <textarea
            id="meal"
            className={`meal-box${mealError ? ' meal-box-error' : ''}`}
            value={meal}
            onChange={(e) => {
              setMeal(e.target.value)
              setActiveExample(null)
              if (mealError) setMealError(null)
            }}
            placeholder="e.g. I ate oatmeal, an apple, and chia seeds"
            rows={3}
            enterKeyHint="done"
            aria-invalid={Boolean(mealError)}
            aria-describedby={mealError ? 'meal-error' : undefined}
          />
          {mealError === 'not_food' && (
            <p id="meal-error" className="field-error" role="alert">
              No foods detected. Try naming specific foods (e.g. oatmeal, apple, chia seeds) and
              calculate again.
            </p>
          )}
          {mealError === 'consumable_untracked' && (
            <p id="meal-error" className="field-error" role="alert">
              We recognized something you can drink or eat, but can’t estimate fiber for it yet. Try
              adding fiber-containing foods (e.g. oatmeal, beans, fruit).
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
              {examples.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  className={activeExample === ex ? 'is-active' : undefined}
                  onClick={() => {
                    setMeal(ex)
                    setActiveExample(ex)
                    runCalc(ex, 'example')
                  }}
                >
                  {ex}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="actions">
          <button type="submit" className="btn btn-primary btn-calc">
            Calculate fiber
          </button>
          <button
            type="button"
            className="btn btn-text"
            onClick={() => {
              setMeal('')
              setResult(null)
              setMealError(null)
              setActiveExample(null)
            }}
          >
            Clear
          </button>
        </div>
      </form>

      {hasMatches && result && (
        <section className="results" aria-live="polite" ref={resultsRef}>
          <div className="score-card">
            <p className="score-kicker">Today’s fiber score</p>
            <div className="score-hero">
              <div className="score-hero-copy">
                <p className="score-total">
                  {result.totalFiberG}
                  <small>g</small>
                </p>
                <p className="score-of">
                  of {target}g {mode === 'maxxing' ? 'fibermaxxing' : 'daily'} target
                </p>
                <h2 className="score-status">
                  {pct >= 100
                    ? mode === 'maxxing'
                      ? 'Fibermaxxing goal reached'
                      : 'Daily fiber goal reached'
                    : gap > 0
                      ? `${gap}g still to go`
                      : 'On track for today'}
                </h2>
                <p className="score-meta">
                  {result.matches.length} food{result.matches.length === 1 ? '' : 's'}
                  {result.estimatedCount > 0
                    ? ` · ${result.estimatedCount} estimated`
                    : ' matched'}{' '}
                  · {result.totalCalories} kcal
                </p>
              </div>
              <ProgressRing pct={pct} />
            </div>

            <div className="metrics metrics-2">
              <div className="metric">
                <div className="k">Daily target</div>
                <div className="v">
                  {target}
                  <small>g</small>
                </div>
              </div>
              <div className="metric metric-accent">
                <div className="k">{gap <= 0 ? 'Over goal' : 'Still to go'}</div>
                <div className="v">
                  {gap <= 0
                    ? Math.round((result.totalFiberG - target) * 10) / 10
                    : gap}
                  <small>g</small>
                </div>
              </div>
            </div>

            <p className="score-estimate-note">
              Totals are estimates from reference servings — edit portions on the right if needed.
              {result.estimatedCount > 0 ? ' Includes category-based estimates.' : ''}
            </p>
            {result.warnings.length > 0 && (
              <p className="score-estimate-note">{result.warnings[0]}</p>
            )}

            {suggestions && (
              <div className={`suggestions suggestions-${suggestions.tone} suggestions-in-score`}>
                <h3>{suggestions.headline}</h3>
                <p className="suggestions-detail">{suggestions.detail}</p>
                {suggestions.items.length > 0 && (
                  <ul className="suggestions-list">
                    {suggestions.items.map((item) => (
                      <li key={item.id}>
                        <div className="suggestions-copy">
                          <strong>{item.name}</strong>
                          <span>
                            {item.serving} · ~{item.fiberG}g fiber (optional add-on — not added to
                            your log)
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="detail-panel">
            <h3>Matched foods</h3>
            <p className="estimate-note">
              Adjust servings or weight — fiber updates live.
            </p>
            <ul className="food-list food-list-editable">
              {result.matches.map((m, idx) => (
                <li key={`${m.food.id}-${m.matchedAlias}-${idx}`}>
                  <div className="food-row-head">
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
                  </div>
                  <div className="food-row-data">
                    <label className="qty-edit">
                      <span className="qty-edit-label">Servings</span>
                      <span className="qty-edit-controls">
                        <input
                          type="number"
                          min={0}
                          step={0.25}
                          value={m.qty}
                          aria-label={`Servings of ${m.food.serving}`}
                          onChange={(e) => {
                            const v = parseFloat(e.target.value)
                            if (!Number.isFinite(v)) return
                            const next = result.matches.map((row, i) =>
                              i === idx ? updateMatchServings(row, v) : row,
                            )
                            patchResult(next)
                          }}
                        />
                        <span className="qty-unit">× {m.food.serving}</span>
                      </span>
                    </label>
                    <label className="qty-edit">
                      <span className="qty-edit-label">Weight</span>
                      <span className="qty-edit-controls">
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={m.grams}
                          aria-label="Weight in grams"
                          onChange={(e) => {
                            const v = parseFloat(e.target.value)
                            if (!Number.isFinite(v)) return
                            const next = result.matches.map((row, i) =>
                              i === idx ? updateMatchGrams(row, v) : row,
                            )
                            patchResult(next)
                          }}
                        />
                        <span className="qty-unit">g</span>
                      </span>
                    </label>
                    <div className="fib-result">
                      <span className="fib-result-label">Fiber</span>
                      <span className="fib">{m.fiberG}g</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {result.unmatchedHints.length > 0 && (
              <p className="unmatched-note">
                Couldn’t match: {result.unmatchedHints.slice(0, 8).join(', ')}
                {result.unmatchedHints.length > 8 ? '…' : ''}
              </p>
            )}

            <div className="share-block">
              <p className="share-label">Share results</p>
              <div className="share-row">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={onDownload}
                  disabled={downloading}
                >
                  {downloading ? 'Preparing…' : 'Download PNG'}
                </button>
                <button
                  type="button"
                  className={`btn btn-ghost${copied ? ' is-copied' : ''}`}
                  onClick={copyShare}
                >
                  {copied ? 'Copied' : 'Copy text report'}
                </button>
              </div>
            </div>

            <div className="report-card-capture" ref={reportCardRef} id="share-card" aria-hidden>
              <div className="report-card-portrait">
                <div className="rcp-top">
                  <div className="rcp-brand">
                    GetFiber<span>maxxing</span>
                  </div>
                  <div className="rcp-date">{reportDate}</div>
                </div>
                <p className="rcp-kicker">Your fiber estimate</p>
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
                {shareFoods.length > 0 && (
                  <div
                    className="rcp-foods-block"
                    data-count={shareFoods.length}
                    data-dense={shareFoods.length >= 4 ? 'true' : undefined}
                  >
                    <p className="rcp-foods-label">Matched foods</p>
                    <ul className="rcp-foods">
                      {shareFoods.map((f, i) => (
                        <li key={`${f.name}-${i}`}>
                          <span>{f.name}</span>
                          <span>{f.fiberG}g</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="rcp-est">Estimated values · Based on the foods entered</p>
                {result.estimatedCount > 0 && (
                  <p className="rcp-est rcp-est-extra">Includes rough category estimates</p>
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
    </>
  )
}
