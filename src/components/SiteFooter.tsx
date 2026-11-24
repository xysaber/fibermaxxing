import { Link } from 'react-router-dom'

const GUIDE_LINKS = [
  { to: '/what-is-fibermaxxing', label: 'What is fibermaxxing?' },
  { to: '/how-much-fiber-per-day', label: 'How much fiber per day' },
  { to: '/fibermaxxing-foods', label: 'Fibermaxxing foods' },
  { to: '/fibermaxxing-smoothie', label: 'Fibermaxxing smoothie' },
  { to: '/oatmeal', label: 'Oatmeal fiber' },
  { to: '/chia-seeds', label: 'Chia seeds fiber' },
  { to: '/high-fiber-breakfast', label: 'High-fiber breakfast' },
] as const

const YEAR = 2026

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <span className="footer-name">GetFibermaxxing</span>
          <p>A free daily fiber calculator built on USDA data. No signup.</p>
        </div>
        <nav className="footer-cols" aria-label="Explore">
          <div>
            <h2>Tools</h2>
            <Link to="/">Fiber calculator</Link>
            <Link to="/#foods">Fiber in foods</Link>
          </div>
          <div>
            <h2>Guides</h2>
            {GUIDE_LINKS.map((l) => (
              <Link key={l.to} to={l.to}>
                {l.label}
              </Link>
            ))}
          </div>
          <div>
            <h2>Site</h2>
            <Link to="/about">About &amp; editorial standards</Link>
            <Link to="/#method">Method &amp; sources</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </div>
        </nav>
      </div>

      <div className="footer-bar">
        <p className="footer-copy">© {YEAR} GetFibermaxxing</p>
        <p className="footer-disclaimer">
          Food fiber values are approximate (USDA FoodData Central and curated staples) and are not a
          substitute for professional medical advice.
        </p>
      </div>
    </footer>
  )
}
