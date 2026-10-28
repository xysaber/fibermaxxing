import { useEffect, useRef } from 'react'
import { DocumentMeta } from '../components/DocumentMeta'
import { FaqBlock } from '../components/FaqBlock'
import {
  FiberCalculator,
  type FiberCalculatorHandle,
} from '../components/FiberCalculator'
import { GuidesStrip } from '../components/GuidesStrip'
import { InfoBand } from '../components/InfoBand'
import { MethodStrip } from '../components/MethodStrip'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import { trackPageView } from '../lib/analytics'

const HOME_FAQS = [
  {
    q: 'What is fibermaxxing?',
    a: 'Fibermaxxing means deliberately eating enough fiber to hit your daily target—mainly from plants such as beans, oats, fruit, vegetables, nuts, and seeds. On this site, start with Standard U.S. Adequate Intake references (~25 g/day for women 19–50, ~38 g for men 19–50). Optional Fibermaxxing mode is Standard × 1.5 (capped at 50 g) and is not an official guideline. Open the What is fibermaxxing? guide for the full plain-language answer.',
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
  const calcRef = useRef<FiberCalculatorHandle>(null)

  useEffect(() => {
    trackPageView('/')
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
            Paste a meal or tap a quick start, then hit Calculate — see fiber grams vs your daily
            target. No signup.
          </p>
          <div className="hero-cta-row">
            <a
              className="btn btn-primary hero-cta"
              href="#calculator"
              onClick={(e) => {
                e.preventDefault()
                calcRef.current?.adoptCurrentDemo()
              }}
            >
              Try the calculator
            </a>
            <a className="btn btn-ghost hero-cta" href="#method">
              How it works
            </a>
          </div>
        </div>

        <FiberCalculator ref={calcRef} />
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
