import { memo, useEffect, useRef, useState, type RefObject } from 'react'
import { SeedSprout } from '../SeedSprout'
import { clamp01, easeBack, easeOut, numWidth, prefersReducedMotion, runFrames } from '../../lib/motion'

/**
 * M1 + M2 (canvas boards "M1+M2 v2"): the home calculator's progress ring and its
 * top-foods list. On first load it plays one example day: each food is typed into
 * the meal box, drops into the list, and its grams flow into the ring; the seed
 * sprouts when the total crosses the daily target.
 *
 * Performance: the prerendered HTML holds the final state (crawlers and no-JS see
 * it); the frame loop writes straight to the DOM for ~3.8 s, once, so React does
 * not re-render per frame. Reduced motion shows the final state.
 */

export type HeroRingFood = { name: string; portion?: string; g: number }

const DEMO: (HeroRingFood & { typed: string })[] = [
  { name: 'Oatmeal, cooked', portion: '1 cup', g: 4.0, typed: '1 cup oatmeal' },
  { name: 'Chia seeds', portion: '1 tbsp', g: 4.1, typed: '1 tbsp chia seeds' },
  { name: 'Black beans', portion: '½ cup', g: 7.5, typed: '1/2 cup black beans' },
  { name: 'Raspberries', portion: '1 cup', g: 8.0, typed: '1 cup raspberries' },
  { name: 'Pear', portion: '1 medium', g: 5.5, typed: 'a pear' },
]
/** The example day as a meal. The real parser returns the same 29.1 g for it. */
export const HERO_DEMO_MEAL = DEMO.map((f) => f.typed).join(', ')
const DEMO_TOTAL = Math.round(DEMO.reduce((s, f) => s + f.g, 0) * 10) / 10

const R = 84
const C = 2 * Math.PI * R
/** Each food starts 600 ms after the previous one; its text types in the 420 ms before. */
const STEP = 600
const FIRST = 500
const TYPE = 400

type Props = {
  target: number
  mode: 'demo' | 'typing' | 'result'
  resultTotal?: number
  resultFoods?: HeroRingFood[]
  /** Foods beyond the five shown (result mode). */
  moreCount?: number
  /** Text node host the demo types the example day into (the meal box overlay). */
  typeRef?: RefObject<HTMLElement | null>
  /** The last Calculate found no foods: the empty state points at the error. */
  emptyError?: boolean
}

export const HeroRing = memo(function HeroRing({
  target,
  mode,
  resultTotal = 0,
  resultFoods = [],
  moreCount = 0,
  typeRef,
  emptyError = false,
}: Props) {
  const [live, setLive] = useState(false)
  const modeRef = useRef(mode)
  useEffect(() => {
    modeRef.current = mode
  }, [mode])
  const arcRef = useRef<SVGCircleElement>(null)
  const numRef = useRef<HTMLSpanElement>(null)
  const bubbleRef = useRef<HTMLSpanElement>(null)
  const hitRef = useRef<HTMLSpanElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const scale = Math.max(38, Math.ceil(target))

  const total = mode === 'demo' ? DEMO_TOTAL : mode === 'result' ? resultTotal : 0
  const foods = mode === 'demo' ? DEMO : mode === 'result' ? resultFoods.slice(0, 5) : []
  const hit = total >= target
  const frac = Math.min(total, scale) / scale
  const pct = Math.round((total / target) * 100)

  useEffect(() => {
    const root = rootRef.current
    const arc = arcRef.current
    const num = numRef.current?.firstChild
    if (modeRef.current !== 'demo' || prefersReducedMotion() || !root || !arc || !num) {
      setLive(true)
      return
    }
    const rows = Array.from(root.querySelectorAll<HTMLElement>('.hero-ring-foods li'))
    const leaves = root.querySelector<SVGGElement>('.seed-sprout-leaves')
    const pctEl = root.querySelector<HTMLElement>('.hero-ring-pct')
    const tickEl = root.querySelector<SVGLineElement>('.hero-ring-tick')
    const bubble = bubbleRef.current
    const pill = hitRef.current
    const finalTarget = () => Number(root.dataset.target) || 25
    const paint = (t: number) => {
      let sum = 0
      let bubbleText = ''
      let bubbleP = -1
      let typed = ''
      DEMO.forEach((f, i) => {
        const s = FIRST + i * STEP
        const o = easeOut(clamp01((t - s) / 260))
        const row = rows[i]
        if (row) {
          row.style.opacity = String(o)
          row.style.transform = `translateX(${(-12 * (1 - o)).toFixed(1)}px)`
        }
        sum += f.g * easeBack(clamp01((t - s - 140) / 460))
        const bp = (t - s - 140) / 700
        if (bp > 0 && bp < 1) {
          bubbleText = `+${f.g.toFixed(1)} g`
          bubbleP = bp
        }
        const tp = clamp01((t - s + TYPE + 20) / TYPE)
        if (tp > 0) typed += (i ? ', ' : '') + f.typed.slice(0, Math.round(f.typed.length * tp))
      })
      sum = Math.max(0, sum)
      const tg = finalTarget()
      const sc = Math.max(38, Math.ceil(tg))
      arc.style.opacity = sum > 0.05 ? '' : '0'
      arc.setAttribute('stroke-dasharray', `${((C * Math.min(sum, sc)) / sc).toFixed(1)} ${C.toFixed(1)}`)
      if (tickEl) tickEl.style.stroke = sum >= tg ? '' : 'var(--amber)'
      const n = sum.toFixed(1)
      if (num.nodeValue !== n) num.nodeValue = n
      const pc = String(Math.round((sum / tg) * 100))
      if (pctEl && pctEl.textContent !== pc) pctEl.textContent = pc
      const host = typeRef?.current
      if (host && host.textContent !== typed) host.textContent = typed
      if (bubble) {
        bubble.textContent = bubbleText
        const p = Math.max(0, bubbleP)
        bubble.style.opacity = bubbleP < 0 ? '0' : String(p < 0.2 ? p / 0.2 : 1 - (p - 0.2) / 0.8)
        bubble.style.transform = `translate(-50%, ${(-24 * easeOut(p)).toFixed(1)}px)`
      }
      return sum
    }
    let hitAt = -1
    const end = FIRST + (DEMO.length - 1) * STEP + 1500
    let cancel = () => {}
    // Start in its own task, after the first render's work, so it never adds to it.
    const timer = window.setTimeout(() => {
      paint(0)
      setLive(true)
      cancel = runFrames(frame)
    }, 0)
    function frame(t: number) {
      if (modeRef.current !== 'demo') {
        cleanup()
        return false
      }
      const sum = paint(t)
      if (hitAt < 0 && sum >= finalTarget()) hitAt = t
      const sp = hitAt < 0 ? 0 : easeBack(clamp01((t - hitAt) / 520), 1.6)
      if (leaves) leaves.style.transform = `scale(${sp.toFixed(3)})`
      if (pill) {
        pill.style.opacity = String(clamp01(hitAt < 0 ? 0 : (t - hitAt) / 260))
        pill.style.transform = `scale(${(0.85 + 0.15 * sp).toFixed(3)})`
      }
      if (t < end) return true
      cleanup()
      return false
    }
    function cleanup() {
      for (const el of [...rows, bubble, pill, leaves, arc, tickEl]) el?.removeAttribute('style')
      if (bubble) bubble.textContent = ''
      if (typeRef?.current) typeRef.current.textContent = HERO_DEMO_MEAL
    }
    return () => {
      window.clearTimeout(timer)
      cancel()
      cleanup()
    }
  }, [typeRef])

  const tickA = (Math.min(target, scale) / scale) * 2 * Math.PI
  const tick = (r: number) => ({ x: 100 + r * Math.sin(tickA), y: 100 - r * Math.cos(tickA) })
  const t1 = tick(70)
  const t2 = tick(98)

  return (
    <div
      ref={rootRef}
      data-target={target}
      className={`hero-ring hero-ring--${mode}${hit ? ' is-hit' : ''}${live ? ' is-live' : ''}`}
    >
      <div className="hero-ring-side">
        <div className="hero-ring-dial">
          <svg viewBox="0 0 200 200" className="hero-ring-svg" aria-hidden="true">
            <circle cx="100" cy="100" r={R} className="hero-ring-track" />
            <circle
              ref={arcRef}
              cx="100"
              cy="100"
              r={R}
              className="hero-ring-arc"
              strokeDasharray={`${(C * frac).toFixed(1)} ${C.toFixed(1)}`}
              transform="rotate(-90 100 100)"
            />
            <line x1={t1.x} y1={t1.y} x2={t2.x} y2={t2.y} className="hero-ring-tick" />
          </svg>
          <div className="hero-ring-center">
            <SeedSprout size={36} />
            <span className="sr-only">
              {total.toFixed(1)} g of fiber, {pct}% of your {target} g target.
            </span>
            <span className="hero-ring-total" aria-hidden="true">
              <span
                ref={numRef}
                className={mode === 'demo' ? 'hm-fixed-num' : undefined}
                style={mode === 'demo' ? { minWidth: numWidth(DEMO_TOTAL.toFixed(1)) } : undefined}
              >{total.toFixed(1)}</span>
              <small> g</small>
            </span>
            <span className="hero-ring-of" aria-hidden="true">
              of {target} g · <span className="hero-ring-pct">{pct}</span>%
            </span>
          </div>
          <span ref={bubbleRef} className="hero-ring-bubble" aria-hidden="true" />
        </div>
        <span ref={hitRef} className="hero-ring-hit">
          Target hit · {target} g
        </span>
      </div>
      <div className="hero-ring-foodbox">
        {foods.length > 0 ? (
          <>
            <p className="hero-ring-label">
              {mode === 'demo' ? 'Example day' : 'Top foods'}
              {moreCount > 0 && mode === 'result' ? ` · +${moreCount} more below` : ''}
            </p>
            <ul className="hero-ring-foods" aria-label={mode === 'demo' ? 'Example day' : 'Top foods today'}>
              {foods.map((f, i) => (
                <li key={`${f.name}-${i}`}>
                  <span>
                    {f.name}
                    {f.portion ? <span className="hero-ring-portion"> · {f.portion}</span> : null}
                  </span>{' '}
                  <b>+{f.g.toFixed(1)} g</b>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="hero-ring-empty">
            <b>{emptyError ? 'Nothing to add yet' : 'Ready when you are'}</b>
            <span>
              {emptyError
                ? 'Fix the meal below and calculate again.'
                : 'Press Calculate and each food drops into the ring.'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
})
