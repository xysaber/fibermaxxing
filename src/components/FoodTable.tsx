import { Link } from 'react-router-dom'

/**
 * Fiber per common portion. Values match what the calculator returns for the
 * same phrase (USDA FoodData Central SR Legacy × USDA household weight).
 */
const FOODS = [
  { name: 'Lentils, cooked', portion: '1 cup', g: 15.6, to: '/fibermaxxing-foods' },
  { name: 'Black beans, cooked', portion: '1 cup', g: 15.0, to: '/fibermaxxing-foods' },
  { name: 'Avocado', portion: '1 medium', g: 10.1, to: '/fibermaxxing-foods' },
  { name: 'Raspberries', portion: '1 cup', g: 8.0, to: '/fibermaxxing-foods' },
  { name: 'Pear', portion: '1 medium', g: 5.5, to: '/fibermaxxing-foods' },
  { name: 'Broccoli, cooked', portion: '1 cup', g: 5.1, to: '/fibermaxxing-foods' },
  { name: 'Apple', portion: '1 medium', g: 4.4, to: '/fibermaxxing-foods' },
  { name: 'Chia seeds', portion: '1 tbsp', g: 4.1, to: '/chia-seeds' },
  { name: 'Oatmeal, cooked', portion: '1 cup', g: 4.0, to: '/oatmeal' },
] as const

const SCALE = 25

export function FoodTable() {
  return (
    <section className="food-table-section" id="foods" aria-labelledby="foods-heading">
      <div className="section-head">
        <div>
          <h2 id="foods-heading">Fiber in everyday foods</h2>
          <p>Grams of fiber per common portion, from USDA FoodData Central. Bars show the share of a 25 g day.</p>
        </div>
        <Link className="section-link" to="/fibermaxxing-foods">
          See more fibermaxxing foods
        </Link>
      </div>
      <div className="food-table-wrap">
        <table className="food-table">
          <thead>
            <tr>
              <th scope="col">Food</th>
              <th scope="col">Portion</th>
              <th scope="col" className="num">
                Fiber
              </th>
              <th scope="col" className="bar-col">
                <span className="sr-only">Share of a 25 g day</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {FOODS.map((f) => (
              <tr key={f.name}>
                <th scope="row">
                  <Link to={f.to}>{f.name}</Link>
                </th>
                <td>{f.portion}</td>
                <td className="num">{f.g.toFixed(1)} g</td>
                <td className="bar-col" aria-hidden>
                  <span className="food-bar">
                    <span style={{ width: `${Math.min(100, (f.g / SCALE) * 100)}%` }} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
