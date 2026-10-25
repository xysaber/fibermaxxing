import { FOOD_SOURCE } from '../data/foods'

const USDA_FDC_URL = 'https://fdc.nal.usda.gov/'

export function MethodStrip() {
  return (
    <section className="method-strip" id="method">
      <div className="method-strip-head">
        <h2>How it works</h2>
        <p>Targets and food values — what this calculator uses, and what it doesn’t claim.</p>
      </div>
      <div className="method-grid">
        <div className="method-col">
          <h3>Daily fiber target</h3>
          <p>
            The <strong>Standard</strong> goal follows commonly cited U.S. Adequate Intake levels —
            about <strong>14g per 1,000 kcal</strong> — shown as daily grams by sex and age (for
            example, women 19–50 ≈ 25g; men 19–50 ≈ 38g; lower after age 50).
          </p>
          <p>
            <strong>Fibermaxxing</strong> here is Standard × 1.5, capped at 50g. It is a personal
            stretch rule on this site, not an official recommendation.
          </p>
        </div>
        <div className="method-col">
          <h3>Food fiber values</h3>
          <p>
            Food matches use{' '}
            <a href={USDA_FDC_URL} target="_blank" rel="noopener noreferrer">
              USDA FoodData Central
            </a>{' '}
            (SR Legacy) plus a few curated staples. Servings are typical reference amounts; real
            portions vary. <strong>Estimated</strong> means a category-based approximation when a
            food is not a verified line item.
          </p>
          <p className="method-source">Data source: {FOOD_SOURCE}</p>
        </div>
      </div>
      <p className="method-limit">
        Fibermax is for education and self-tracking only — not medical advice. Talk to a clinician
        before major diet changes.
      </p>
    </section>
  )
}
