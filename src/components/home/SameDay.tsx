import { SAME_DAY } from '../../content/homeWeek'
import { Arrow } from './Arrow'

const round1 = (n: number) => Math.round(n * 10) / 10
const LOW = round1(SAME_DAY.reduce((s, r) => s + r.typicalG, 0))
const HIGH = round1(SAME_DAY.reduce((s, r) => s + r.highG, 0))
const GAIN = round1(HIGH - LOW)
/** Bars are drawn against the highest adult target. */
const SCALE = 38

/** "Same day, two ways" (design boards 28, 32, 33). */
export function SameDay({ onTry }: { onTry: (meal: string) => void }) {
  const highDay = SAME_DAY.map((r) => r.high.replace('½', '1/2')).join(', ')
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

      <div className="hv-same-table">
        <div className="hv-same-grid hv-same-cols" aria-hidden="true">
          <span />
          <span>Typical day</span>
          <span />
          <span className="is-high">High-fiber day</span>
        </div>
        {SAME_DAY.map((r) => (
          <div className="hv-same-grid hv-same-row" key={r.slot}>
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
      </div>

      <div className="hv-same-grid hv-same-total">
        <b className="hv-same-slot">Total</b>
        <div className="hv-same-sum">
          <span className="hv-same-sum-label">Typical day</span>
          <span className="hv-big hv-big--muted">
            {LOW}
            <small> g</small>
          </span>
          <span className="hv-bar">
            <i className="hv-grow" style={{ width: `${(LOW / SCALE) * 100}%` }} />
          </span>
        </div>
        <span className="hv-same-plus hv-same-gain">+{GAIN} g</span>
        <div className="hv-same-sum is-high">
          <span className="hv-same-sum-label">High-fiber day · +{GAIN} g</span>
          <span className="hv-big">
            {HIGH}
            <small> g</small>
          </span>
          <span className="hv-bar hv-bar--high">
            <i className="hv-grow" style={{ width: `${(HIGH / SCALE) * 100}%`, animationDelay: '120ms' }} />
          </span>
        </div>
      </div>

      <div>
        <button type="button" className="hv-btn" onClick={() => onTry(highDay)}>
          Put this day in the calculator <Arrow />
        </button>
      </div>
    </section>
  )
}
