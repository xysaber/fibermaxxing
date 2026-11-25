import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { DocumentMeta } from '../components/DocumentMeta'
import { FaqBlock } from '../components/FaqBlock'
import {
  FiberCalculator,
  type FiberCalculatorHandle,
} from '../components/FiberCalculator'
import { GuidesStrip } from '../components/GuidesStrip'
import { EmailSignup } from '../components/EmailSignup'
import { FoodBars } from '../components/home/FoodBars'
import { FirstWeek } from '../components/home/FirstWeek'
import { SameDay } from '../components/home/SameDay'
import { MethodStrip } from '../components/MethodStrip'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import { FOOD_COUNT } from '../data/foods'
import { trackPageView } from '../lib/analytics'
import { HOME_FAQS } from '../content/homeFaqs'
import { useReveal } from '../lib/useReveal'


export function HomePage() {
  const calcRef = useRef<FiberCalculatorHandle>(null)

  useEffect(() => {
    trackPageView('/')
  }, [])
  useReveal()

  return (
    <div className="app home-v3">
      <DocumentMeta path="/" faqs={HOME_FAQS} />
      <SiteHeader />

      <section className="hero hero-home">
        <div className="hero-copy">
          <p className="hero-kicker">Free fiber calculator, no signup</p>
          <h1>How much fiber have you actually eaten today?</h1>
          <p className="lede">
            Type your meals the way you’d say them. We match each food to USDA data and show your
            total against the daily target for your age and sex.
          </p>
          <div className="hv-hero-meta">
            <dl className="hv-stats">
              <div>
                <dt>USDA foods</dt>
                <dd>{FOOD_COUNT.toLocaleString()}</dd>
              </div>
              <div>
                <dt>Adult targets by age and sex</dt>
                <dd>25–38 g</dd>
              </div>
              <div>
                <dt>No account needed</dt>
                <dd>Free</dd>
              </div>
            </dl>
            <p className="hero-reviewed">
              Updated November 24, 2026 · <a href="#method">Method and sources</a> ·{' '}
              <Link to="/about">Editorial standards</Link>
            </p>
          </div>
        </div>

        <FiberCalculator ref={calcRef} />
      </section>

      <SameDay onTry={(meal) => calcRef.current?.loadMeal(meal, 'home_same_day')} />
      <FoodBars />
      <GuidesStrip />
      <FirstWeek />
      <section className="plan-band" id="plan" aria-label="Fiber plans" data-reveal>
        <EmailSignup
          source="home"
          variant="card"
          kicker="Free"
          title="7-day starter plan"
          copy="Add fiber slowly without the bloating. One short email a day with one easy change, sized so your gut keeps up."
          button="Get the plan"
        />
        <div className="plan-card-dark">
          <p className="plan-card-kicker">Launch price</p>
          <h3>30-day Fibermaxxing plan</h3>
          <p>
            A week-by-week ramp to your target, with daily menus, shopping lists, and versions for
            GLP-1 users and sensitive stomachs.
          </p>
          <p className="plan-card-price">
            <strong>$9</strong> <s>$14.99</s> <span>one-time, 7-day refund</span>
          </p>
          <Link className="plan-card-cta" to="/30-day-plan">
            See what’s inside
          </Link>
        </div>
      </section>
      <MethodStrip />
      <FaqBlock title="Questions" faqs={HOME_FAQS} />
      <SiteFooter />
    </div>
  )
}
