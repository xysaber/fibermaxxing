import { Link } from 'react-router-dom'

const GUIDES = [
  {
    to: '/how-much-fiber-per-day',
    title: 'How much fiber per day?',
    blurb: 'Adequate Intake targets by sex and age, then estimate today’s intake.',
  },
  {
    to: '/oatmeal',
    title: 'Oatmeal fiber',
    blurb: '~4g per cooked cup — plus a calculator for your full bowl.',
  },
  {
    to: '/chia-seeds',
    title: 'Chia seeds fiber',
    blurb: '~3.4g per tablespoon, scaled from USDA chia density.',
  },
  {
    to: '/high-fiber-breakfast',
    title: 'High-fiber breakfast',
    blurb: 'Pasteable morning combos with portions you can edit.',
  },
] as const

export function GuidesStrip() {
  return (
    <section className="guides-strip" id="guides" aria-labelledby="guides-heading">
      <div className="guides-strip-head">
        <h2 id="guides-heading">Fiber guides</h2>
        <p>Short answers first — then the same calculator with a relevant example meal.</p>
      </div>
      <ul className="guides-grid">
        {GUIDES.map((g) => (
          <li key={g.to}>
            <Link to={g.to}>
              <strong>{g.title}</strong>
              <span>{g.blurb}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
