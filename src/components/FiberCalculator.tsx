import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import { buildSuggestions, type SuggestionItem } from '../data/suggestions'
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
  type MatchedFood,
  type ParseResult,
  type Sex,
} from '../lib/parseMeal'
import {
  buildMealLogPayload,
  postMealLog,
  type MealLogInputOrigin,
} from '../lib/mealLog'
import { buildShareText, downloadReportPng } from '../lib/shareReport'

const STARTERS = [
  {
    id: 'starter_oat_bowl',
    label: 'Oat breakfast',
    meal: '1 cup cooked oatmeal, 1 tbsp chia seeds, 1/2 cup blueberries',
  },
  {
    id: 'starter_simple_day',
    label: 'Simple day',
    meal: '2 eggs, 1 bowl of oatmeal, and an apple',
  },
  {
    id: 'starter_lentil_dinner',
    label: 'Lentil dinner',
    meal: '1 cup cooked lentils, broccoli, and brown rice',
  },
] as const

const DEFAULT_EXAMPLES = [
  '20g chia seeds, 1/2 cup raspberries, 170g yogurt greek plain nonfat',
  '2 slices whole-wheat toast, 1/2 avocado, 1 cup raspberries',
  '1 cup cooked oatmeal with 1 medium pear',
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

/** Empty-state typewriter over the three Quick start meals (visual only). */
function useStarterTypewriter(enabled: boolean, meals: string[]) {
  const [text, setText] = useState('')
  const [index, setIndex] = useState(0)
  const mealsKey = meals.join('\0')

  useEffect(() => {
    if (!enabled || meals.length === 0) {
      setText('')
      setIndex(0)
      return
    }

    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    let i = 0
    let pos = 0
    let phase: 'type' | 'hold' | 'delete' = 'type'
    setIndex(0)

    const tick = () => {
      if (cancelled) return
      const full = meals[i] ?? ''
      if (phase === 'type') {
        pos += 1
        setText(full.slice(0, pos))
        if (pos >= full.length) {
          phase = 'hold'
          timer = setTimeout(tick, 1600)
          return
        }
        timer = setTimeout(tick, 28 + (pos % 5 === 0 ? 18 : 0))
        return
      }
      if (phase === 'hold') {
        phase = 'delete'
        timer = setTimeout(tick, 36)
        return
      }
      pos -= 1
      setText(full.slice(0, Math.max(0, pos)))
      if (pos <= 0) {
        i = (i + 1) % meals.length
        setIndex(i)
        phase = 'type'
        timer = setTimeout(tick, 320)
        return
      }
      timer = setTimeout(tick, 16)
    }

    timer = setTimeout(tick, 400)
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [enabled, mealsKey])

  return { text, index }
}

function trustBadge(m: MatchedFood): ReactNode {
  if (m.needsConfirm || m.tag === 'needs_confirm') {
    return (
      <span
        className="src-badge src-confirm"
        title="Closest match may be wrong — adjust servings or weight"
      >
        Check match
      </span>
    )
  }
  if (m.assumed || m.tag === 'assumed') {
    return (
      <span
        className="src-badge src-assumed"
        title="We used a default serving — adjust weight if needed"
      >
        Assumed portion
      </span>
    )
  }
  if (m.source === 'estimate' || m.tag === 'estimated') {
    return (
      <span
        className="src-badge src-estimate"
        title="Category-based estimate — not a verified USDA line item"
      >
        Estimated
      </span>
    )
  }
  return (
    <span className="src-badge src-db" title="Matched USDA/curated line + portion as entered">
      Database
    </span>
  )
}

function foodRowClass(m: MatchedFood): string | undefined {
  if (m.needsConfirm || m.tag === 'needs_confirm') return 'food-row--confirm'
  if (m.assumed || m.tag === 'assumed') return 'food-row--assumed'
  return undefined
}

function rowTrustHint(m: MatchedFood): string | null {
  if (m.needsConfirm || m.tag === 'needs_confirm') {
    return 'Closest match may be wrong — adjust servings or weight so the total isn’t misleading.'
  }
  if (m.assumed || m.tag === 'assumed') {
    return 'We used a default serving — adjust weight if needed.'
  }
  return null
}

function scoreMetaLine(result: ParseResult): string {
  const n = result.matches.length
  const parts = [`${n} food${n === 1 ? '' : 's'} matched`]
  if (result.needsConfirmCount > 0) parts.push(`${result.needsConfirmCount} need check`)
  if (result.assumedCount > 0) parts.push(`${result.assumedCount} assumed portion`)
  if (result.estimatedCount > 0) parts.push(`${result.estimatedCount} estimated`)
  parts.push(`~${result.totalCalories} kcal`)
  return parts.join(' · ')
}

function SuggestionsRefreshIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M14.5 9a5.5 5.5 0 0 1-9.3 3.95M3.5 9A5.5 5.5 0 0 1 12.8 5.05"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12.5 3.5v2.8H15M5.5 14.5v-2.8H3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function combosKey(combos: SuggestionItem[][]): string {
  return combos.map((c) => c.map((i) => i.id).join('+')).join('||')
}

export type CalculatorStarter = {
  id: string
  label: string
  meal: string
}

export type FiberCalculatorProps = {
  initialSex?: Sex
  initialAge?: AgeGroup
  initialMode?: GoalMode
  initialMeal?: string
  examples?: string[]
  /** When set, replaces the default Quick start chips (and typewriter demos). */
  starters?: CalculatorStarter[]
  panelLabel?: string
}

/** Hero CTA can adopt the current typewriter Quick start (full meal, not partial text). */
export type FiberCalculatorHandle = {
  adoptCurrentDemo: () => void
}

export const FiberCalculator = forwardRef<FiberCalculatorHandle, FiberCalculatorProps>(
  function FiberCalculator(
    {
      initialSex = 'female',
      initialAge = '19-50',
      initialMode = 'standard',
      initialMeal = '',
      examples = DEFAULT_EXAMPLES,
      starters,
      panelLabel = 'Fiber intake estimator',
    },
    ref,
  ) {
  const starterList: CalculatorStarter[] = starters?.length
    ? starters
    : STARTERS.map((s) => ({ id: s.id, label: s.label, meal: s.meal }))
  const starterDemoMeals = starterList.map((s) => s.meal)
  const [sex, setSex] = useState<Sex>(initialSex)
  const [age, setAge] = useState<AgeGroup>(initialAge)
  const [mode, setMode] = useState<GoalMode>(initialMode)
  const [meal, setMeal] = useState(initialMeal)
  const [mealFocused, setMealFocused] = useState(false)
  const [result, setResult] = useState<ParseResult | null>(null)
  const [mealError, setMealError] = useState<'not_food' | 'consumable_untracked' | null>(null)
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [activeStarterId, setActiveStarterId] = useState<string | null>(null)
  const [activeExample, setActiveExample] = useState<string | null>(null)
  const [showExamples, setShowExamples] = useState(false)
  const [suggestionComboIndex, setSuggestionComboIndex] = useState(0)
  const resultsRef = useRef<HTMLElement>(null)
  const reportCardRef = useRef<HTMLDivElement>(null)
  const mealInputRef = useRef<HTMLTextAreaElement>(null)
  const [reportDate] = useState(() =>
    new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
  )

  const showTypewriter = !meal.trim() && !mealFocused
  const { text: demoText, index: demoIndex } = useStarterTypewriter(showTypewriter, starterDemoMeals)

  const standardAi = useMemo(() => standardFiberAi(sex, age), [sex, age])
  const target = useMemo(() => fiberTarget(sex, age, mode), [sex, age, mode])

  const hasMatches = !!result && result.matches.length > 0
  const pct = hasMatches ? Math.min(150, (result.totalFiberG / target) * 100) : 0
  const gap = hasMatches ? Math.max(0, Math.round((target - result.totalFiberG) * 10) / 10) : 0
  const calcReady = Boolean(meal.trim()) && !hasMatches

  const suggestions = useMemo(() => {
    if (!hasMatches || !result) return null
    const eaten = new Set(result.matches.map((m) => m.food.id))
    return buildSuggestions(gap, eaten, result.estimatedCount)
  }, [hasMatches, result, gap])

  const suggestionCombosKey = suggestions ? combosKey(suggestions.combos) : ''
  useEffect(() => {
    setSuggestionComboIndex(0)
  }, [suggestionCombosKey])

  const suggestionItems =
    suggestions && suggestions.combos.length > 0
      ? suggestions.combos[suggestionComboIndex % suggestions.combos.length]
      : suggestions?.items ?? []

  const shareFoods = useMemo(() => {
    if (!hasMatches || !result) return []
    return result.matches.map((m) => ({ name: m.food.name, fiberG: m.fiberG }))
  }, [hasMatches, result])

  function resolveInputOrigin(text: string): MealLogInputOrigin {
    const starter = starterList.find((s) => s.id === activeStarterId)
    if (starter && text === starter.meal.trim()) return 'starter'
    if (activeExample !== null && text === activeExample.trim()) return 'example'
    if (initialMeal && text === initialMeal.trim()) return 'prefill'
    return 'typed'
  }

  function runCalc(rawText: string) {
    const text = rawText.trim()
    const inputOrigin = resolveInputOrigin(text)
    const source: 'own' | 'example' = inputOrigin === 'example' ? 'example' : 'own'
    const eventParams = { source, input_origin: inputOrigin }

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
        source,
        inputOrigin,
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
    if (inputOrigin === 'example') {
      track('run_example', { foods: parsed.matches.length, fiber: parsed.totalFiberG })
    } else if (inputOrigin === 'starter') {
      track('run_starter', {
        foods: parsed.matches.length,
        fiber: parsed.totalFiberG,
        starter_id: activeStarterId ?? '',
      })
    } else if (inputOrigin === 'typed') {
      track('calculate_own', { foods: parsed.matches.length, fiber: parsed.totalFiberG })
    }
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  function pickStarter(id: string, mealText: string) {
    setActiveStarterId(id)
    setActiveExample(null)
    setMeal(mealText)
    setResult(null)
    setMealError(null)
    track('select_starter', { starter_id: id })
  }

  function pickExample(ex: string) {
    setMeal(ex)
    setActiveExample(ex)
    setActiveStarterId(null)
    setResult(null)
    setMealError(null)
  }

  useImperativeHandle(
    ref,
    () => ({
      adoptCurrentDemo() {
        document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        // Don't overwrite an in-progress meal or existing result.
        if (meal.trim() || result) return
        const starter = starterList[demoIndex] ?? starterList[0]
        pickStarter(starter.id, starter.meal)
        track('try_calculator_cta', { starter_id: starter.id })
      },
    }),
    [demoIndex, meal, result],
  )

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
    if (!meal.trim()) return
    runCalc(meal)
  }

  function onClear() {
    setMeal('')
    setResult(null)
    setMealError(null)
    setActiveExample(null)
    setActiveStarterId(null)
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
          <div className={`meal-box-wrap${showTypewriter ? ' meal-box-wrap--demo' : ''}`}>
            <textarea
              ref={mealInputRef}
              id="meal"
              className={`meal-box${mealError ? ' meal-box-error' : ''}${
                meal.trim() ? ' meal-box--active' : ''
              }${showTypewriter ? ' meal-box--demo-host' : ''}`}
              value={meal}
              onChange={(e) => {
                setMeal(e.target.value)
                setActiveExample(null)
                setActiveStarterId(null)
                if (mealError) setMealError(null)
              }}
              onFocus={() => setMealFocused(true)}
              onBlur={() => setMealFocused(false)}
              placeholder={showTypewriter ? '' : 'e.g. oatmeal, apple, chia seeds'}
              rows={3}
              enterKeyHint="done"
              aria-invalid={Boolean(mealError)}
              aria-describedby={mealError ? 'meal-error' : undefined}
            />
            {showTypewriter && (
              <div className="meal-box-demo" aria-hidden="true">
                <span className="meal-box-demo-text">{demoText}</span>
                <span className="meal-box-demo-caret" />
              </div>
            )}
          </div>
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

        <div className="starter-block" aria-label="Meal starters">
          <p className="starter-label">{starters?.length ? 'Quick portions' : 'Quick start'}</p>
          <div className="starter-chips">
            {starterList.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className={`starter-chip${
                  activeStarterId === s.id || (showTypewriter && demoIndex === i) ? ' is-active' : ''
                }`}
                onClick={() => pickStarter(s.id, s.meal)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="examples">
          <button
            type="button"
            className="examples-toggle"
            aria-expanded={showExamples}
            aria-controls="examples-list"
            onClick={() => setShowExamples((v) => !v)}
          >
            {showExamples ? 'Hide more examples' : 'More example meals'}
          </button>
          {showExamples && (
            <div className="examples-grid" id="examples-list">
              {examples.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  className={activeExample === ex ? 'is-active' : undefined}
                  onClick={() => pickExample(ex)}
                >
                  {ex}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="actions">
          <button
            type="submit"
            className={`btn btn-primary btn-calc${calcReady ? ' btn-calc--ready' : ''}`}
            disabled={!meal.trim()}
            aria-disabled={!meal.trim()}
          >
            Calculate fiber
          </button>
          <button
            type="button"
            className="btn btn-text"
            onClick={onClear}
            disabled={!meal && !result && !mealError}
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
                <p className="score-meta">{scoreMetaLine(result)}</p>
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

            {result.warnings.length > 0 && (
              <p className="score-estimate-note">{result.warnings[0]}</p>
            )}

            {suggestions && (
              <div className={`suggestions suggestions-${suggestions.tone} suggestions-in-score`}>
                <div className="suggestions-title-row">
                  <h3>{suggestions.headline}</h3>
                  {suggestions.combos.length > 1 && (
                    <button
                      type="button"
                      className="suggestions-refresh"
                      aria-label="Show another combination"
                      title="Show another combination"
                      onClick={() => setSuggestionComboIndex((i) => i + 1)}
                    >
                      <SuggestionsRefreshIcon />
                    </button>
                  )}
                </div>
                {suggestions.detail ? (
                  <p className="suggestions-detail">{suggestions.detail}</p>
                ) : null}
                {suggestionItems.length > 0 && (
                  <ul className="suggestions-list">
                    {suggestionItems.map((item) => (
                      <li key={`${suggestionComboIndex}-${item.id}`}>
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
          </div>

          <div className="detail-panel">
            <h3>Matched foods</h3>
            <ul className="food-list food-list-editable">
              {result.matches.map((m, idx) => {
                const hint = rowTrustHint(m)
                return (
                  <li
                    key={`${m.food.id}-${m.matchedAlias}-${idx}`}
                    className={foodRowClass(m)}
                  >
                    <div className="food-row-head">
                      <span className="food-name">
                        {m.food.name}
                        {trustBadge(m)}
                      </span>
                    </div>
                    {hint ? (
                      <p
                        className={`row-trust-hint${
                          m.needsConfirm || m.tag === 'needs_confirm'
                            ? ' row-trust-hint--confirm'
                            : ''
                        }`}
                      >
                        {hint}
                      </p>
                    ) : null}
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
                )
              })}
            </ul>
            {result.unmatchedHints.length > 0 && (
              <p className="unmatched-note">
                Couldn’t match: {result.unmatchedHints.slice(0, 8).join(', ')}
                {result.unmatchedHints.length > 8 ? '…' : ''}. Try simpler food names or add them as
                separate lines.
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
  },
)
