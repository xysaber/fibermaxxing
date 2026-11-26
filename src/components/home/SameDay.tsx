import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { SAME_DAY } from '../../content/homeWeek'
import { numWidth, prefersReducedMotion, useTween } from '../../lib/motion'
import { SeedSprout } from '../SeedSprout'
import { Arrow } from './Arrow'

const round1 = (n: number) => Math.round(n * 10) / 10
const LOW = round1(SAME_DAY.reduce((s, r) => s + r.typicalG, 0))
const HIGH = round1(SAME_DAY.reduce((s, r) => s + r.highG, 0))
/** The meter is drawn against the highest adult target, with the 25 g line marked. */
const SCALE = 38
const TARGET = 25

/**
 * "Same day, two ways" (boards 28, 32, 33) with M3 motion: as each meal row
 * passes 62% of the viewport its swap plays (old food struck through, new food
 * slides in) and the sticky meter adds the grams. Scrolling back reverses it.
 * One IntersectionObserver, no scroll listener. The prerendered HTML shows the
 * finished day, so crawlers and no-JS readers get every row.
 */
export function SameDay({ onTry }: { onTry: (meal: string) => void }) {
  const highDay = SAME_DAY.map((r) => r.high.replace('½', '1/2')).join(', ')
  const rowsRef = useRef<(HTMLDivElement | null)[]>([])
  const [on, setOn] = useState<number>(SAME_DAY.length)

  const [instant, setInstant] = useState(true)

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined' || prefersReducedMotion()) return
    const rows = rowsRef.current.filter((el): el is HTMLDivElement => !!el)
    // A row counts once its top passes 62% of the viewport. Positions come from the
    // observer's entries, so nothing forces a layout on load or while scrolling.
    const past = rows.map(() => true)
    let first = true
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const i = rows.indexOf(e.target as HTMLDivElement)
          const line = e.rootBounds ? e.rootBounds.bottom : window.innerHeight * 0.62
          past[i] = e.isIntersecting || e.boundingClientRect.top < line
        }
        setOn(past.filter(Boolean).length)
        // The first answer only resets rows that are off screen: no tween for it.
        if (first) {
          first = false
          requestAnimationFrame(() => setInstant(false))
        }
      },
      { rootMargin: '0px 0px -38% 0px' },
    )
    for (const el of rows) io.observe(el)
    return () => io.disconnect()
  }, [])

  let running = LOW
  SAME_DAY.forEach((r, i) => {
    if (i < on) running += r.highG - r.typicalG
  })
  const total = useTween(round1(running), 480, instant)
  const hit = total >= TARGET

  return (
    <section className="hv-band hv-band--white hv-same" aria-labelledby="same-heading" data-reveal>
      <div className="hv-head hv-same-grid">
        <h2 id="same-heading" className="hv-h2 hv-same-title">
          Same day,
          <br />
          two ways.
        </h2>
        <p className="hv-intro hv-same-intro">
          Four swaps, no new recipes. The same breakfast, lunch, snack and dinner go from {LOW} g to{' '}
          {HIGH} g of fiber.
        </p>
      </div>

      <div className="hv-same-body">
        <aside className={`hv-same-meter${hit ? ' is-hit' : ''}`} aria-label="Running total">
          <span className="hv-same-meter-label">Today’s total</span>
          <span className="hv-same-meter-num hv-num" aria-hidden="true">
            <span className="hm-fixed-num" style={{ minWidth: numWidth(HIGH.toFixed(1)) }}>
              {total.toFixed(1)}
            </span>
            <small> g</small>
          </span>
          <span className="sr-only">
            {HIGH} g with all four swaps, up from {LOW} g.
          </span>
          <div className="hv-same-meter-track" aria-hidden="true">
            <span className="hv-same-meter-bar" style={{ '--f': (Math.min(total, SCALE) / SCALE).toFixed(3) } as CSSProperties}>
              <i />
              <b className="hv-same-meter-tick" style={{ '--t': TARGET / SCALE } as CSSProperties} />
            </span>
            <span className="hv-same-meter-scale">
              <span className="hv-same-meter-max">{SCALE} g</span>
              <span className="hv-same-meter-goal" style={{ '--t': TARGET / SCALE } as CSSProperties}>
                <SeedSprout size={30} />
                {TARGET} g target
              </span>
              <span className="hv-same-meter-zero">0</span>
            </span>
          </div>
        </aside>

        <div className="hv-same-table">
          <div className="hv-same-grid hv-same-cols" aria-hidden="true">
            <span />
            <span>Typical day</span>
            <span />
            <span className="is-high">High-fiber day</span>
          </div>
          {SAME_DAY.map((r, i) => (
            <div
              className={`hv-same-grid hv-same-row${i < on ? ' is-on' : ''}`}
              key={r.slot}
              ref={(el) => {
                rowsRef.current[i] = el
              }}
            >
              <b className="hv-same-slot">
                {r.slot}
                <span className="hv-same-plus hv-same-plus--inline">+{round1(r.highG - r.typicalG)} g</span>
              </b>
              <p className="hv-same-low">
                <span className="sr-only">Typical: </span>
                <s>{r.typical}</s> <span className="hv-num">· {r.typicalG} g</span>
              </p>
              <span className="hv-same-plus" aria-hidden="true">
                +{round1(r.highG - r.typicalG)} g <Arrow />
              </span>
              <p className="hv-same-high">
                <span className="sr-only">High-fiber: </span>
                {r.high} <b className="hv-num">· {r.highG} g</b>
              </p>
            </div>
          ))}

          <div className="hv-same-ctas">
            <button type="button" className="hv-btn" onClick={() => onTry(highDay)}>
              Put this day in the calculator <Arrow />
            </button>
            <Link to="/30-day-plan" className="hv-btn hv-btn--dark">
              30-day plan · $9 <s>$14.99</s>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
