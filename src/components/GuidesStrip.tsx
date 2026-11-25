import { Link } from 'react-router-dom'
import { Arrow } from './home/Arrow'

export const HOME_GUIDES = [
  {
    to: '/what-is-fibermaxxing',
    title: 'What is fibermaxxing?',
    blurb: 'Plain-language meaning, daily targets, and a free estimate—no signup.',
    stat: '1.5×',
    group: 'start',
  },
  {
    to: '/how-much-fiber-per-day',
    title: 'How much fiber per day?',
    blurb: 'Adequate Intake targets by sex and age, then estimate today’s intake.',
    stat: '25–38 g',
    group: 'start',
  },
  {
    to: '/fibermaxxing-foods',
    title: 'Fibermaxxing foods',
    blurb: 'Beans, oats, chia, berries—with portions you can paste into the calculator.',
    stat: '15.6 g',
    group: 'foods',
  },
  {
    to: '/fiber-in-foods',
    title: 'Fiber in 50 foods',
    blurb: 'Every food ranked per serving, per 100 g, and per calorie.',
    stat: '50',
    group: 'foods',
  },
  {
    to: '/oatmeal',
    title: 'Oatmeal fiber',
    blurb: '~4g per cooked cup — plus a calculator for your full bowl.',
    stat: '4 g',
    group: 'foods',
  },
  {
    to: '/chia-seeds',
    title: 'Chia seeds fiber',
    blurb: '~4.1g per tablespoon (≈12 g), scaled from USDA chia density.',
    stat: '4.1 g',
    group: 'foods',
  },
  {
    to: '/high-fiber-breakfast',
    title: 'High-fiber breakfast',
    blurb: 'Bowls and toast plates—see the smoothie guide for blended drinks.',
    stat: '~10 g',
    group: 'meals',
  },
  {
    to: '/fibermaxxing-smoothie',
    title: 'Fibermaxxing smoothie',
    blurb: 'Berry–chia and bean–berry blends with grams you can edit.',
    stat: '12–15 g',
    group: 'meals',
  },
] as const

const GROUPS = [
  { id: 'start', title: 'Start here' },
  { id: 'foods', title: 'Foods' },
  { id: 'meals', title: 'Meals' },
] as const

const GROUP_TITLE: Record<string, string> = Object.fromEntries(GROUPS.map((g) => [g.id, g.title]))

/**
 * Home guides as an editorial two-column list with a big stat per guide
 * (design boards 32–33). Every guide opens with the answer, then the calculator.
 */
export function GuidesStrip() {
  return (
    <section className="hv-band hv-band--white" id="guides" aria-labelledby="guides-heading" data-reveal>
      <div className="hv-head">
        <h2 id="guides-heading" className="hv-h2">
          Short answers,
          <br />
          then the calculator.
        </h2>
        <p className="hv-intro">
          Eight guides that open with the answer, then let you check your own day.{' '}
          <Link to="/fiber-in-foods">Browse fiber in 50 foods</Link>
        </p>
      </div>
      <ul className="hv-guides">
        {HOME_GUIDES.map((x) => (
          <li key={x.to}>
            <Link className="hv-guide" to={x.to}>
              <span className="hv-guide-stat">{x.stat}</span>
              <span className="hv-guide-copy">
                <span className="hv-guide-group">{GROUP_TITLE[x.group]}</span>
                <strong>{x.title}</strong>
                <span>{x.blurb}</span>
              </span>
              <span className="hv-guide-arrow" aria-hidden="true">
                <Arrow />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
