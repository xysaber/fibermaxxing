import { Link } from 'react-router-dom'

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
 * Home "Fiber guides" (design boards 14–15): one 4-column grid, 8 cards = 2 full rows.
 * Group shows as a tag on each card; phones list the cards under group headings.
 */
export function GuidesStrip() {
  return (
    <section className="guides-v2" id="guides" aria-labelledby="guides-heading">
      <div className="guides-v2-head">
        <div>
          <h2 id="guides-heading">Fiber guides</h2>
          <p>Short answers first — then the same calculator with a relevant example meal.</p>
        </div>
        <Link className="guides-v2-all" to="/fiber-in-foods">
          Browse fiber in 50 foods <span aria-hidden="true">→</span>
        </Link>
      </div>
      <ul className="guides-v2-grid">
        {HOME_GUIDES.map((x, i) => (
          <li
            key={x.to}
            className="guides-v2-item"
            data-group={x.group}
            data-group-start={i === 0 || HOME_GUIDES[i - 1].group !== x.group ? GROUP_TITLE[x.group] : undefined}
          >
            <Link className="guides-v2-card" to={x.to}>
              <span className="guides-v2-tag">{GROUP_TITLE[x.group]}</span>
              <span className="guides-v2-stat">{x.stat}</span>
              <strong>{x.title}</strong>
              <span className="guides-v2-blurb">{x.blurb}</span>
              <span className="guides-v2-more">
                Read guide <span aria-hidden="true">→</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Link className="guides-v2-all guides-v2-all--button" to="/fiber-in-foods">
        Browse fiber in 50 foods
      </Link>
    </section>
  )
}
