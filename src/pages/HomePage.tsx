import { useEffect } from 'react'
import { DocumentMeta } from '../components/DocumentMeta'
import { FaqBlock } from '../components/FaqBlock'
import { FiberCalculator } from '../components/FiberCalculator'
import { GuidesStrip } from '../components/GuidesStrip'
import { InfoBand } from '../components/InfoBand'
import { MethodStrip } from '../components/MethodStrip'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import { track } from '../lib/analytics'

const HOME_FAQS = [
  {
    q: 'What is fibermaxxing?',
    a: 'Fibermaxxing means intentionally increasing daily dietary fiber — often toward stretch targets above standard adequate intake — to support digestive wellness and fullness. This calculator helps you estimate intake against a clear daily gram goal.',
  },
  {
    q: 'How much fiber should I eat per day?',
    a: 'In the U.S., adequate intake is often cited as about 25g/day for women ages 19–50 and 38g/day for men ages 19–50 (21g and 30g after age 50), based on roughly 14g of fiber per 1,000 calories. This calculator’s Standard goal uses those estimates. Fibermaxxing on this site is Standard × 1.5 (max 50g) and is not an official recommendation. Increase gradually and drink enough water.',
  },
  {
    q: 'Where do fiber values come from?',
    a: 'Primarily USDA FoodData Central reference data, with typical servings. See How it works for details on targets, estimates, and limits.',
  },
  {
    q: 'Is this fibermaxxing calculator medical advice?',
    a: 'No. Fiber totals are approximate estimates for education and self-tracking only. If you have a digestive condition or take medication, check with a qualified clinician before making large diet changes.',
  },
]

const HOME_TRUST_TILES = [
  {
    label: 'Data',
    value: 'USDA-based estimates',
    note: 'Reference servings you can edit',
  },
  {
    label: 'Targets',
    value: 'Adequate Intake goals',
    note: 'By sex and age, plus optional stretch',
  },
  {
    label: 'Control',
    value: 'Confirm every match',
    note: 'Adjust servings or grams before you trust the total',
  },
]

export function HomePage() {
  useEffect(() => {
    track('page_view', { path: '/' })
  }, [])

  return (
    <div className="app">
      <DocumentMeta path="/" faqs={HOME_FAQS} />
      <SiteHeader />

      <section className="hero">
        <div className="hero-copy">
          <h1>
            How much fiber have you <em>actually</em> eaten today?
          </h1>
          <p className="lede">
            Free fibermaxxing calculator: paste what you ate, get USDA-based fiber totals, edit
            portions, and compare to U.S. Adequate Intake targets — no signup.
          </p>
          <a className="hero-method-link" href="#method">
            How it works
          </a>
        </div>

        <FiberCalculator />
      </section>

      <InfoBand
        id="trust"
        ariaLabel="Why this calculator"
        tiles={HOME_TRUST_TILES}
      />

      <GuidesStrip />
      <MethodStrip />
      <FaqBlock title="Fibermaxxing FAQ" faqs={HOME_FAQS} />
      <SiteFooter />
    </div>
  )
}
