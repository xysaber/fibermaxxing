import { Link } from 'react-router-dom'

const GUIDE_LINKS = [
  { to: '/what-is-fibermaxxing', label: 'What is fibermaxxing?' },
  { to: '/how-much-fiber-per-day', label: 'How much fiber / day' },
  { to: '/fibermaxxing-foods', label: 'Fibermaxxing foods' },
  { to: '/fibermaxxing-smoothie', label: 'Fibermaxxing smoothie' },
  { to: '/oatmeal', label: 'Oatmeal fiber' },
  { to: '/chia-seeds', label: 'Chia seeds' },
  { to: '/high-fiber-breakfast', label: 'High-fiber breakfast' },
] as const

const YEAR = 2026

export function SiteFooter() {
  return (
    <footer className="footer">
      <nav className="footer-nav" aria-label="Explore">
        <Link to="/#method">Method &amp; Sources</Link>
        {GUIDE_LINKS.map((l) => (
          <Link key={l.to} to={l.to}>
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="footer-bar">
        <p className="footer-copy">© {YEAR} GetFibermaxxing</p>
        <nav className="footer-legal" aria-label="Legal">
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </nav>
      </div>

      <p className="footer-disclaimer">
        Free fiber intake estimator and fibermaxxing calculator. Food fiber values are approximate
        (USDA FoodData Central and curated staples) and are not a substitute for professional medical
        advice.
      </p>
    </footer>
  )
}
