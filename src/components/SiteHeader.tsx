import { Link, NavLink, useLocation } from 'react-router-dom'
import { FOOD_COUNT } from '../data/foods'

const GUIDE_PATHS = new Set([
  '/how-much-fiber-per-day',
  '/oatmeal',
  '/chia-seeds',
  '/high-fiber-breakfast',
])

export function SiteHeader() {
  const { pathname } = useLocation()
  const guidesActive = GUIDE_PATHS.has(pathname)

  return (
    <header className="topbar">
      <Link className="brand" to="/">
        <svg className="brand-icon" viewBox="0 0 32 32" aria-hidden>
          <rect width="32" height="32" rx="8" fill="#151b2e" />
          <circle cx="16" cy="16" r="8.5" fill="none" stroke="#3d4660" strokeWidth="2.75" />
          <path
            d="M16 7.5a8.5 8.5 0 0 1 7.36 12.75"
            fill="none"
            stroke="#2f5bff"
            strokeWidth="2.75"
            strokeLinecap="round"
          />
          <circle cx="16" cy="7.5" r="2.4" fill="#5b8cff" />
        </svg>
        <span className="brand-lockup">
          <span className="brand-mark">
            Fiber<span className="brand-max">max</span>
          </span>
          <span className="brand-tag">Daily fibermaxxing calculator</span>
        </span>
      </Link>

      <nav className="site-nav" aria-label="Primary">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'is-active' : undefined)}>
          Calculator
        </NavLink>
        {pathname === '/' ? (
          <a href="#guides" className={guidesActive ? 'is-active' : undefined}>
            Guides
          </a>
        ) : (
          <Link to="/#guides" className={guidesActive ? 'is-active' : undefined}>
            Guides
          </Link>
        )}
        <a href="#method">Method</a>
      </nav>

      <span className="pill-meta">
        {FOOD_COUNT.toLocaleString()} foods · USDA-based · Instant
      </span>
    </header>
  )
}
