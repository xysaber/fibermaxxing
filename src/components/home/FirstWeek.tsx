import { useState } from 'react'
import { HOME_WEEK } from '../../content/homeWeek'
import { EmailSignup } from '../EmailSignup'

/** "Your first week, one email at a time." (design boards 29, 32, 33). */
export function FirstWeek() {
  const [i, setI] = useState(1)
  const cur = HOME_WEEK[i]
  return (
    <section className="hv-band hv-band--paper hv-week" aria-labelledby="week-heading" data-reveal>
      <div className="hv-head hv-head--week">
        <h2 id="week-heading" className="hv-h2">
          Your first week,
          <br />
          one email at a time.
        </h2>
        <p className="hv-intro">One small change each morning, sized so your gut keeps up. Tap a day to read it.</p>
      </div>
      <div className="hv-week-grid">
        <div className="hv-week-days" role="tablist" aria-label="Starter plan days">
          {HOME_WEEK.map((d, k) => (
            <button
              key={d.day}
              type="button"
              role="tab"
              id={`week-tab-${k}`}
              aria-selected={k === i}
              aria-controls="week-panel"
              className="hv-week-day"
              onClick={() => setI(k)}
            >
              <span className="hv-week-d">{d.day}</span>
              <span className="hv-week-s">{d.subject}</span>
              <span className="hv-week-a">{d.adds}</span>
            </button>
          ))}
        </div>
        <div className="hv-mail">
          <div className="hv-mail-head">
            <span>GetFibermaxxing · 7:00 a.m.</span>
            <b>
              {cur.day}: {cur.subject}
            </b>
          </div>
          <div className="hv-mail-body" id="week-panel" role="tabpanel" aria-labelledby={`week-tab-${i}`} key={i}>
            <h3>{cur.heading}</h3>
            <div className="hv-mail-move">
              <span>Today’s one change{cur.adds ? ` · ${cur.adds}` : ''}</span>
              <p>{cur.move}</p>
            </div>
            <p className="hv-mail-why">{cur.why}</p>
            <p className="hv-mail-tip">
              <b>Tip.</b> {cur.tip}
            </p>
          </div>
          <div className="hv-mail-foot">
            <EmailSignup
              source="home-week"
              variant="mail"
              kicker=""
              title=""
              copy="Free. Day 1 arrives in a minute, then one email each morning. Unsubscribe any time."
              button="Start Day 1"
              copyAfter
            />
          </div>
        </div>
      </div>
    </section>
  )
}
