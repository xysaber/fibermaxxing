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
import { FoodTable } from '../components/FoodTable'
import { MethodStrip } from '../components/MethodStrip'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import { FOOD_COUNT } from '../data/foods'
import { trackPageView } from '../lib/analytics'
import { HOME_FAQS } from '../content/homeFaqs'


export function HomePage() {
  const calcRef = useRef<FiberCalculatorHandle>(null)

  useEffect(() => {
    trackPageView('/')
  }, [])

  return (
    <div className="app">
      <DocumentMeta path="/" faqs={HOME_FAQS} />
      <SiteHeader />

      <section className="hero hero-home">
        <div className="hero-copy">
          <p className="hero-kicker">Free fiber calculator · no signup</p>
          <h1>How much fiber have you actually eaten today?</h1>
          <p className="lede">
            Type your meals the way you’d say them. We match each food to USDA data and show your
            total against the daily target for your age and sex.
          </p>
          <ul className="hero-proof">
            <li>{FOOD_COUNT.toLocaleString()} foods from USDA FoodData Central</li>
            <li>Targets from U.S. Adequate Intake by age and sex</li>
            <li>Edit any portion before you trust the total</li>
          </ul>
          <p className="hero-reviewed">
            Updated November 24, 2026 · <a href="#method">Method and sources</a> ·{' '}
            <Link to="/about">Editorial standards</Link>
          </p>
        </div>

        <FiberCalculator ref={calcRef} />
      </section>

      <FoodTable />
      <GuidesStrip />
      <section className="plan-band" id="plan" aria-label="Fiber plans">
        <EmailSignup
          source="home"
          variant="card"
          kicker="Free"
          title="7-day starter plan"
          copy="Add fiber slowly without the bloating. One short email a day with one easy change, sized so your gut keeps up."
          button="Get the plan"
        />
        <div className="plan-card-dark">
          <p className="plan-card-kicker">Coming soon</p>
          <h3>30-day Fibermaxxing plan</h3>
          <p>
            A week-by-week ramp to your target, with meal plans, shopping lists, and versions for
            GLP-1 users and sensitive stomachs.
          </p>
          <p className="plan-card-price">
            <strong>$9</strong> <s>$14.99</s> <span>launch price, one-time</span>
          </p>
          <p className="plan-card-note">Starter-plan subscribers hear about it first.</p>
        </div>
      </section>
      <MethodStrip />
      <FaqBlock title="Questions" faqs={HOME_FAQS} />
      <SiteFooter />
    </div>
  )
}
