import { useMemo, useState } from 'react'
import { FOOD_COUNT } from './data/foods'
import { fiberTarget, parseMeal, type ParseResult } from './lib/parseMeal'
import './App.css'

const EXAMPLES = [
  'I ate 2 eggs, 1 bowl of oatmeal, and an apple',
  'Breakfast: chia pudding, raspberries, Greek yogurt',
  'Lentils, broccoli, brown rice, and avocado for dinner',
  'Psyllium husk in water, salad, hummus, and a pear',
]

type Sex = 'female' | 'male' | 'other'
type Mode = 'standard' | 'maxxing'

function ProgressRing({ pct }: { pct: number }) {
  const r = 46
  const c = 2 * Math.PI * r
  const clamped = Math.min(100, Math.max(0, pct))
  const offset = c - (clamped / 100) * c

  return (
    <div className="ring-wrap" aria-hidden>
      <svg viewBox="0 0 108 108">
        <circle cx="54" cy="54" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
        <circle
          cx="54"
          cy="54"
          r={r}
          fill="none"
          stroke="#b8e04a"
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
  const [mode, setMode] = useState<Mode>('maxxing')
  const [meal, setMeal] = useState(EXAMPLES[0]!)
  const [result, setResult] = useState<ParseResult | null>(null)
  const [copied, setCopied] = useState(false)
  const [showShareCard, setShowShareCard] = useState(false)

  const target = useMemo(() => fiberTarget(sex, mode), [sex, mode])

  function runCalc(text = meal) {
    const parsed = parseMeal(text)
    setResult(parsed)
    setShowShareCard(false)
    setCopied(false)
  }

  const pct = result ? Math.min(150, (result.totalFiberG / target) * 100) : 0
  const gap = result ? Math.max(0, Math.round((target - result.totalFiberG) * 10) / 10) : 0
  const gutScore = result
    ? Math.min(100, Math.round((result.totalFiberG / target) * 70 + result.avgGlpScore * 3))
    : 0

  const shareText = result
    ? `Fibermaxxing check-in 🌿\n${result.totalFiberG}g fiber · ${Math.round(pct)}% of ${target}g goal\nGut Score ${gutScore}/100 · GLP-1 proxy ${result.avgGlpScore}/10\nTrack yours free → fibermaxxing.app`
    : ''

  async function copyShare() {
    if (!shareText) return
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setShowShareCard(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setShowShareCard(true)
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="/">
          <span className="brand-mark">
            Fiber<span>max</span>
          </span>
          <span className="brand-tag">daily calculator</span>
        </a>
        <span className="pill-meta">No signup · {FOOD_COUNT}+ foods · Instant</span>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <h1>
            How much fiber did you <em>actually</em> eat today?
          </h1>
          <p className="lede">
            Paste what you ate in plain English. Get your Fibermaxxing score, gap to goal, and a
            shareable gut-health report — in under 3 seconds.
          </p>
        </div>

        <div className="panel">
          <p className="panel-label">Daily intake</p>
          <div className="row">
            <div className="field">
              <label htmlFor="sex">Sex</label>
              <select id="sex" value={sex} onChange={(e) => setSex(e.target.value as Sex)}>
                <option value="female">Female · 25g / 40g</option>
                <option value="male">Male · 38g / 50g</option>
                <option value="other">Other · 30g / 50g</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="mode">Target mode</label>
              <select id="mode" value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
                <option value="standard">Standard RDA</option>
                <option value="maxxing">Fibermaxxing</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="meal">What did you eat?</label>
            <textarea
              id="meal"
              className="meal-box"
              value={meal}
              onChange={(e) => setMeal(e.target.value)}
              placeholder="I ate 2 eggs, oatmeal, an apple…"
              rows={4}
            />
          </div>

          <div className="examples">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => {
                  setMeal(ex)
                  runCalc(ex)
                }}
              >
                {ex.length > 42 ? `${ex.slice(0, 40)}…` : ex}
              </button>
            ))}
          </div>

          <div className="actions">
            <button type="button" className="btn btn-primary" onClick={() => runCalc()}>
              Calculate fiber
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setMeal('')
                setResult(null)
              }}
            >
              Clear
            </button>
            <p className="hint">Goal right now: {target}g · client-side parse, $0 API</p>
          </div>
        </div>
      </section>

      {result && (
        <section className="results" aria-live="polite">
          <div className="score-card">
            <div className="score-head">
              <div>
                <h2>
                  {pct >= 100 ? 'Fibermaxxing unlocked' : gap > 0 ? `${gap}g still to go` : 'On track'}
                </h2>
                <p>
                  {result.matches.length} food{result.matches.length === 1 ? '' : 's'} matched ·{' '}
                  {result.totalCalories} kcal logged
                </p>
              </div>
              <ProgressRing pct={pct} />
            </div>
            <div className="metrics">
              <div className="metric">
                <div className="k">Fiber</div>
                <div className="v">
                  {result.totalFiberG}
                  <small>g</small>
                </div>
              </div>
              <div className="metric">
                <div className="k">Gut score</div>
                <div className="v">
                  {gutScore}
                  <small>/100</small>
                </div>
              </div>
              <div className="metric">
                <div className="k">GLP-1 proxy</div>
                <div className="v">
                  {result.avgGlpScore || '—'}
                  <small>/10</small>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-panel">
            <h3>Matched foods</h3>
            {result.matches.length === 0 ? (
              <p className="empty-match">
                No foods recognized yet. Try oatmeal, chia, lentils, apple, broccoli…
              </p>
            ) : (
              <ul className="food-list">
                {result.matches.map((m) => (
                  <li key={m.food.id}>
                    <span>{m.food.name}</span>
                    <span className="qty">
                      ×{m.qty} · {m.food.serving}
                    </span>
                    <span className="fib">{m.fiberG}g</span>
                  </li>
                ))}
              </ul>
            )}
            {result.unmatchedHints.length > 0 && result.matches.length > 0 && (
              <p className="warn">Possible misses near: {result.unmatchedHints.join(', ')}</p>
            )}

            <div className="share-row">
              <button type="button" className="btn btn-primary" onClick={copyShare}>
                {copied ? 'Copied ✓' : 'Copy TikTok / X report'}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowShareCard((v) => !v)}
              >
                {showShareCard ? 'Hide card' : 'Show share card'}
              </button>
            </div>

            {showShareCard && (
              <div className="share-card" id="share-card">
                <div className="brand-line">Fibermax · Daily Report</div>
                <p className="headline">
                  {result.totalFiberG}g fiber · {Math.round(pct)}% of goal
                </p>
                <div className="stats">
                  <span>Gut {gutScore}</span>
                  <span>GLP-1 {result.avgGlpScore}/10</span>
                  <span>Target {target}g</span>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {result && gap > 0 && (
        <section className="affiliate">
          <h2>Close the {gap}g gap</h2>
          <p className="sub">
            Affiliate picks that map to your shortfall — swap placeholders for Amazon Associates links
            before launch.
          </p>
          <div className="aff-grid">
            <a className="aff-item" href="#affiliate-psyllium" onClick={(e) => e.preventDefault()}>
              <p className="name">Psyllium husk</p>
              <p className="why">~7g soluble fiber per tbsp. Strongest GLP-1 / satiety proxy in our set.</p>
              <p className="cta">View on Amazon →</p>
            </a>
            <a className="aff-item" href="#affiliate-chia" onClick={(e) => e.preventDefault()}>
              <p className="name">Chia seeds</p>
              <p className="why">~10g fiber per 2 tbsp. Easy add to yogurt or oatmeal.</p>
              <p className="cta">View on Amazon →</p>
            </a>
            <a className="aff-item" href="#affiliate-inulin" onClick={(e) => e.preventDefault()}>
              <p className="name">Inulin powder</p>
              <p className="why">~9g per 2 tsp. Neutral taste for coffee or smoothies.</p>
              <p className="cta">View on Amazon →</p>
            </a>
          </div>
          <div className="ads-slot">AdSense / display slot — place below results, never above the tool</div>
        </section>
      )}

      <section className="seo-strip">
        <h2>Fibermaxxing FAQ</h2>
        <div className="faq">
          <details open>
            <summary>What is fibermaxxing?</summary>
            <p>
              Fibermaxxing is the social trend of deliberately pushing daily fiber toward or past RDA —
              often 40–50g — for gut health, satiety, and GLP-1-adjacent metabolic effects. This tool
              turns that trend into a quantified daily check-in.
            </p>
          </details>
          <details>
            <summary>How much fiber should I eat?</summary>
            <p>
              Standard guidance is about 25g/day for women and 38g/day for men. Fibermaxxing mode uses
              40g / 50g as stretch targets. Increase gradually and drink water.
            </p>
          </details>
          <details>
            <summary>Is this medical advice?</summary>
            <p>
              No. Values are approximate (USDA-style servings) for education and tracking only. Talk to
              a clinician before major diet changes, especially with GI conditions.
            </p>
          </details>
        </div>
      </section>

      <footer className="footer">
        Fibermax MVP · Not medical advice · Food fiber values are approximate. Competitor watch:
        experience &gt; exact-match domain. See PRODUCT.md for pSEO matrix and 48h launch checklist.
      </footer>
    </div>
  )
}

export default App
