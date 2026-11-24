import { Link, NavLink, useLocation } from 'react-router-dom'
import { FOOD_COUNT } from '../data/foods'

const GUIDE_PATHS = new Set([
  '/what-is-fibermaxxing',
  '/how-much-fiber-per-day',
  '/fibermaxxing-foods',
  '/fibermaxxing-smoothie',
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
        <svg className="brand-icon" viewBox="0 0 44 44" aria-hidden>
          <circle cx="22" cy="22" r="17" fill="none" stroke="#e7f2ea" strokeWidth="6" />
          <circle
            cx="22"
            cy="22"
            r="17"
            fill="none"
            stroke="#1f6b45"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="80 107"
            transform="rotate(-90 22 22)"
          />
          <path d="M22 14c-4 3-5 9-1 14 4-3 5-9 1-14z" fill="#2e9e5b" />
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
