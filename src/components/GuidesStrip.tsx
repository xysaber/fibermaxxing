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

export function GuidesStrip() {
  return (
    <section className="guide-groups" id="guides" aria-labelledby="guides-heading">
      <div className="section-head">
        <div>
          <h2 id="guides-heading">Fiber guides</h2>
          <p>Short answers first — then the same calculator with a relevant example meal.</p>
        </div>
      </div>
      <div className="guide-groups-grid">
        {GROUPS.map((g) => (
          <div key={g.id} className="guide-group">
            <h3 className="guide-group-title">{g.title}</h3>
            <ul>
              {HOME_GUIDES.filter((x) => x.group === g.id).map((x) => (
                <li key={x.to}>
                  <Link className="guide-tile" to={x.to}>
                    <span className="guide-tile-stat">{x.stat}</span>
                    <strong>{x.title}</strong>
                    <span>{x.blurb}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
