import { Link, NavLink, useLocation } from 'react-router-dom'
import { FOOD_COUNT } from '../data/foods'

const GUIDE_PATHS = new Set([
  '/how-much-fiber-per-day',
  '/oatmeal',
  '/chia-seeds',
  '/high-fiber-breakfast',
])

function PrimaryNav({ guidesActive }: { guidesActive: boolean }) {
  const { pathname } = useLocation()

  return (
    <>
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
      <a href="#method">How it works</a>
    </>
  )
}

export function SiteHeader() {
  const { pathname } = useLocation()
  const guidesActive = GUIDE_PATHS.has(pathname)
  const pill = `${FOOD_COUNT.toLocaleString()} foods · USDA-based · Instant`

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
            GetFiber<span className="brand-max">maxxing</span>
          </span>
          <span className="brand-tag">Daily fiber calculator</span>
        </span>
      </Link>

      <nav className="site-nav site-nav-desktop" aria-label="Primary">
        <PrimaryNav guidesActive={guidesActive} />
      </nav>

      <span className="pill-meta pill-meta-desktop">{pill}</span>

      <details
        className="topbar-menu"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('a')) {
            ;(e.currentTarget as HTMLDetailsElement).open = false
          }
        }}
      >
        <summary className="topbar-menu-btn" aria-label="Open menu">
          <span className="topbar-menu-label">Menu</span>
          <span className="topbar-menu-icon" aria-hidden />
        </summary>
        <div className="topbar-menu-panel">
          <nav className="site-nav site-nav-mobile" aria-label="Primary">
            <PrimaryNav guidesActive={guidesActive} />
          </nav>
          <span className="pill-meta">{pill}</span>
        </div>
      </details>
    </header>
  )
}
