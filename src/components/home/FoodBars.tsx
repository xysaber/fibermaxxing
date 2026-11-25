import { Link } from 'react-router-dom'

/**
 * Editorial food list (design boards 31–33). Values match what the calculator
 * returns for the same phrase (USDA FoodData Central SR Legacy × household weight).
 */
const FOODS = [
  { name: 'Lentils', portion: '1 cup, cooked', g: 15.6, to: '/fiber-in-lentils' },
  { name: 'Black beans', portion: '1 cup, cooked', g: 15.0, to: '/fiber-in-black-beans' },
  { name: 'Avocado', portion: '1 medium', g: 10.1, to: '/fiber-in-avocado' },
  { name: 'Raspberries', portion: '1 cup', g: 8.0, to: '/fiber-in-raspberries' },
  { name: 'Pear', portion: '1 medium', g: 5.5, to: '/fiber-in-pear' },
  { name: 'Broccoli', portion: '1 cup, cooked', g: 5.1, to: '/fiber-in-broccoli' },
] as const

const MAX = FOODS[0].g

export function FoodBars() {
  return (
    <section className="hv-band hv-band--paper" id="foods" aria-labelledby="foods-heading" data-reveal>
      <div className="hv-head">
        <h2 id="foods-heading" className="hv-h2">
          Fiber in
          <br />
          everyday foods.
        </h2>
        <p className="hv-intro">
          Grams per common portion, from USDA FoodData Central.{' '}
          <Link to="/fiber-in-foods">See all 50 foods</Link>
        </p>
      </div>
      <ul className="hv-foods">
        {FOODS.map((f, i) => (
          <li key={f.name}>
            <Link to={f.to} className="hv-food">
              <span className="hv-food-name">
                <span className="hv-food-title">{f.name}</span>
                <span className="hv-food-portion">{f.portion}</span>
              </span>
              <span className="hv-bar hv-bar--food" aria-hidden="true">
                <i className="hv-grow" style={{ width: `${(f.g / MAX) * 100}%`, animationDelay: `${150 + i * 50}ms` }} />
              </span>
              <span className="hv-food-g">
                {f.g.toFixed(1)}
                <small> g</small>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
