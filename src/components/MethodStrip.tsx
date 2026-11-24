import { Link } from 'react-router-dom'

const USDA_FDC_URL = 'https://fdc.nal.usda.gov/'

export function MethodStrip() {
  return (
    <section className="method-strip" id="method">
      <h2>How it works</h2>
      <ol className="method-steps">
        <li>
          <span className="method-step-n" aria-hidden="true">1</span>
          <h3>Set your target</h3>
          <p>
            U.S. Adequate Intake: about 14 g per 1,000 kcal, or 25 g for women and 38 g for men
            aged 19–50.
          </p>
        </li>
        <li>
          <span className="method-step-n" aria-hidden="true">2</span>
          <h3>Type what you ate</h3>
          <p>
            Each food is matched to{' '}
            <a href={USDA_FDC_URL} target="_blank" rel="noopener noreferrer">
              USDA FoodData Central
            </a>{' '}
            (SR Legacy), with a few curated staples and common packaged foods.
          </p>
        </li>
        <li>
          <span className="method-step-n" aria-hidden="true">3</span>
          <h3>Check and adjust</h3>
          <p>
            Portions are typical references. Change servings or grams; anything approximated is
            marked Estimated.
          </p>
        </li>
      </ol>
      <p className="method-limit">
        Fibermaxxing mode is this site’s optional stretch goal (Standard × 1.5, capped at 50 g), not
        an official recommendation. For education and self-tracking only. Talk to a clinician before
        major diet changes. <Link to="/about">Sources and editorial standards</Link>
      </p>
    </section>
  )
}
