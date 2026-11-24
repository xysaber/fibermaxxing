import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { DocumentMeta } from '../components/DocumentMeta'
import { formatReviewDate } from '../components/GuideSources'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import { FOOD_COUNT } from '../data/foods'
import { trackPageView } from '../lib/analytics'

export const ABOUT_META = {
  path: '/about',
  title: 'About GetFibermaxxing & Editorial Standards',
  description:
    'Who runs GetFibermaxxing, where the fiber numbers come from (USDA FoodData Central), how guides are reviewed, and what this site is not.',
  updated: '2026-11-24',
}

export function AboutPage() {
  useEffect(() => {
    trackPageView(ABOUT_META.path)
  }, [])

  return (
    <div className="app">
      <DocumentMeta
        title={ABOUT_META.title}
        description={ABOUT_META.description}
        path={ABOUT_META.path}
      />
      <SiteHeader />
      <article className="legal-page about-page">
        <header className="legal-header">
          <h1>About GetFibermaxxing</h1>
          <p className="legal-updated">
            Last updated: {formatReviewDate(ABOUT_META.updated)}
          </p>
        </header>
        <div className="legal-prose">
          <p>
            GetFibermaxxing is a small, independent project: a free calculator that estimates how much
            dietary fiber is in the meals you type, plus short guides on common high-fiber foods. There
            is no account, no paywall, and no sponsored food ranking.
          </p>

          <h2>Where the numbers come from</h2>
          <p>
            Food values come from{' '}
            <a href="https://fdc.nal.usda.gov/" target="_blank" rel="noopener noreferrer">
              USDA FoodData Central
            </a>{' '}
            (SR Legacy), about {FOOD_COUNT.toLocaleString()} foods, plus a few curated staples such as
            psyllium husk and cooked oatmeal. We store fiber per 100 g and scale it to the portion you
            enter, so a guide that says “1 tbsp chia ≈ 4.1 g” shows the gram weight it assumed.
          </p>
          <p>
            Daily targets use the U.S. Adequate Intake for fiber from the{' '}
            <a
              href="https://nap.nationalacademies.org/catalog/10490/dietary-reference-intakes-for-energy-carbohydrate-fiber-fat-fatty-acids-cholesterol-protein-and-amino-acids"
              target="_blank"
              rel="noopener noreferrer"
            >
              National Academies Dietary Reference Intakes
            </a>
            , about 14 g per 1,000 calories (≈25 g/day for women and ≈38 g/day for men ages 19–50).
            The optional “Fibermaxxing mode” (Standard × 1.5, capped at 50 g) is our own stretch
            setting and is not an official recommendation.
          </p>

          <h2>How guides are written and reviewed</h2>
          <ul>
            <li>Every gram figure on a guide is recomputed from the same dataset the calculator uses.</li>
            <li>Each guide lists its sources and the date its figures were last reviewed.</li>
            <li>
              We say “about” and show the portion weight, because real foods vary by brand, ripeness,
              and cooking.
            </li>
            <li>When we find an error, we fix the guide and update its review date.</li>
          </ul>

          <h2>What this site is not</h2>
          <p>
            GetFibermaxxing is for education and self-tracking. It is not medical advice and is not
            written or reviewed by a clinician. If you have a digestive condition, are pregnant, take
            medication (including GLP-1 drugs), or plan a large diet change, talk to a doctor or
            registered dietitian first.
          </p>

          <h2>Advertising and affiliate links</h2>
          <p>
            The site does not currently carry ads or affiliate links. If we add them, they will be
            labeled on the page, and they will not change the fiber numbers or which foods we list.
          </p>

          <h2>Contact and corrections</h2>
          <p>
            Spotted a wrong number or a broken link? Email{' '}
            <a href="mailto:hello@getfibermaxxing.com">hello@getfibermaxxing.com</a>. See also our{' '}
            <Link to="/privacy">Privacy Policy</Link> and <Link to="/terms">Terms</Link>.
          </p>
        </div>
      </article>
      <SiteFooter />
    </div>
  )
}
