import { memo, useEffect, useRef, useState } from 'react'
import { SeedSprout } from '../SeedSprout'
import { clamp01, easeBack, easeOut, numWidth, prefersReducedMotion, runFrames } from '../../lib/motion'

/**
 * M1 (design page "首页大胆动效"): the home calculator's progress ring. On first
 * load it plays one example day: five foods drop in, each one's grams flow into
 * the ring, and the seed sprouts when the total crosses the daily target.
 *
 * Performance: the prerendered HTML holds the final state (crawlers and no-JS see
 * it); the frame loop writes straight to the DOM for ~3.6 s, once, so React does
 * not re-render per frame. Reduced motion shows the final state.
 */

export type HeroRingFood = { name: string; g: number }

const DEMO: HeroRingFood[] = [
  { name: 'Oatmeal', g: 4.0 },
  { name: 'Chia seeds', g: 4.1 },
  { name: 'Black beans', g: 7.5 },
  { name: 'Raspberries', g: 8.0 },
  { name: 'Pear', g: 5.5 },
]
const DEMO_TOTAL = Math.round(DEMO.reduce((s, f) => s + f.g, 0) * 10) / 10

const R = 50
const C = 2 * Math.PI * R
/** Each food starts 560 ms after the previous one. */
const STEP = 560
const FIRST = 300

type Props = {
  target: number
  note: string
  mode: 'demo' | 'typing' | 'result'
  resultTotal?: number
  resultFoods?: HeroRingFood[]
}

export const HeroRing = memo(function HeroRing({ target, note, mode, resultTotal = 0, resultFoods = [] }: Props) {
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

  useEffect(() => {
    const root = rootRef.current
    const arc = arcRef.current
    const num = numRef.current?.firstChild
    if (modeRef.current !== 'demo' || prefersReducedMotion() || !root || !arc || !num) {
      setLive(true)
      return
    }
    const chips = Array.from(root.querySelectorAll<HTMLElement>('.hero-ring-foods li'))
    const leaves = root.querySelector<SVGGElement>('.seed-sprout-leaves')
    const bubble = bubbleRef.current
    const pill = hitRef.current
    const finalTarget = () => Number(root.dataset.target) || 25
    const paint = (t: number) => {
      let sum = 0
      let bubbleText = ''
      let bubbleP = -1
      DEMO.forEach((f, i) => {
        const s = FIRST + i * STEP
        const o = easeOut(clamp01((t - s) / 260))
        const chip = chips[i]
        if (chip) {
          chip.style.opacity = String(o)
          chip.style.transform = `translateY(${(8 * (1 - o)).toFixed(1)}px)`
        }
        sum += f.g * easeBack(clamp01((t - s - 140) / 460))
        const bp = (t - s - 140) / 700
        if (bp > 0 && bp < 1) {
          bubbleText = `+${f.g.toFixed(1)} g`
          bubbleP = bp
        }
      })
      sum = Math.max(0, sum)
      const sc = Math.max(38, Math.ceil(finalTarget()))
      arc.setAttribute('stroke-dasharray', `${((C * Math.min(sum, sc)) / sc).toFixed(1)} ${C.toFixed(1)}`)
      num.nodeValue = sum.toFixed(1)
      if (bubble) {
        bubble.textContent = bubbleText
        const p = Math.max(0, bubbleP)
        bubble.style.opacity = bubbleP < 0 ? '0' : String(p < 0.2 ? p / 0.2 : 1 - (p - 0.2) / 0.8)
        bubble.style.transform = `translate(-50%, ${(-22 * easeOut(p)).toFixed(1)}px)`
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
      for (const el of [...chips, bubble, pill, leaves]) el?.removeAttribute('style')
      if (bubble) bubble.textContent = ''
    }
    return () => {
      window.clearTimeout(timer)
      cancel()
      cleanup()
    }
  }, [])

  const tickA = (Math.min(target, scale) / scale) * 2 * Math.PI
  const tick = (r: number) => ({ x: 60 + r * Math.sin(tickA), y: 60 - r * Math.cos(tickA) })
  const t1 = tick(41)
  const t2 = tick(59)
  const label = mode === 'demo' ? 'Example day' : 'Your day so far'

  return (
    <div
      ref={rootRef}
      data-target={target}
      className={`hero-ring hero-ring--${mode}${hit ? ' is-hit' : ''}${live ? ' is-live' : ''}`}
    >
      <div className="hero-ring-top">
        <div className="hero-ring-dial" aria-hidden="true">
          <svg viewBox="0 0 120 120" className="hero-ring-svg">
            <circle cx="60" cy="60" r={R} className="hero-ring-track" />
            <circle
              ref={arcRef}
              cx="60"
              cy="60"
              r={R}
              className="hero-ring-arc"
              strokeDasharray={`${(C * frac).toFixed(1)} ${C.toFixed(1)}`}
              transform="rotate(-90 60 60)"
            />
            <line x1={t1.x} y1={t1.y} x2={t2.x} y2={t2.y} className="hero-ring-tick" />
          </svg>
          <SeedSprout size={44} />
          <span ref={bubbleRef} className="hero-ring-bubble" />
        </div>
        <div className="hero-ring-copy">
          <span className="sr-only" aria-live="polite">
            Your daily target: {target} g.
          </span>
          <span className="hero-ring-label">{label}</span>
          <span className="sr-only">
            {total.toFixed(1)} g of fiber.
          </span>
          <span className="hero-ring-total" aria-hidden="true">
            <span
              ref={numRef}
              className={mode === 'demo' ? 'hm-fixed-num' : undefined}
              style={mode === 'demo' ? { minWidth: numWidth(DEMO_TOTAL.toFixed(1)) } : undefined}
            >{total.toFixed(1)}</span>
            <small> g</small>
          </span>
          <span className="hero-ring-of">
            of your {target} g daily target
          </span>
          <span className="hero-ring-note">{note}</span>
          <span ref={hitRef} className="hero-ring-hit">
            Target hit · {target} g
          </span>
        </div>
      </div>
      <div className="hero-ring-foodbox">
      {foods.length > 0 ? (
        <ul className="hero-ring-foods" aria-label={mode === 'demo' ? 'Example day' : 'Top foods today'}>
          {foods.map((f, i) => (
            <li key={`${f.name}-${i}`}>
              <span>{f.name}</span> <b>+{f.g.toFixed(1)} g</b>
            </li>
          ))}
        </ul>
      ) : (
        <p className="hero-ring-empty">Calculate to fill the ring.</p>
      )}
      </div>
    </div>
  )
})
