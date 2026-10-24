import { Link } from 'react-router-dom'

const FOOTER_LINKS = [
  { to: '/how-much-fiber-per-day', label: 'How much fiber / day' },
  { to: '/oatmeal', label: 'Oatmeal fiber' },
  { to: '/chia-seeds', label: 'Chia seeds' },
  { to: '/high-fiber-breakfast', label: 'High-fiber breakfast' },
] as const

const YEAR = 2026

export function SiteFooter() {
  return (
    <footer className="footer">
      <nav className="footer-nav" aria-label="Footer">
        <a href="#method">Method &amp; Sources</a>
        {FOOTER_LINKS.map((l) => (
          <Link key={l.to} to={l.to}>
            {l.label}
          </Link>
        ))}
      </nav>
      <p>
        © {YEAR} Fibermax — free fiber intake estimator and fibermaxxing calculator. Food fiber values
        are approximate (USDA FoodData Central and curated staples) and are not a substitute for
        professional medical advice.
      </p>
    </footer>
  )
}
