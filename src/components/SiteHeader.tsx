import type { ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

const GUIDE_PATHS = new Set([
  '/what-is-fibermaxxing',
  '/how-much-fiber-per-day',
  '/fibermaxxing-foods',
  '/fibermaxxing-smoothie',
  '/oatmeal',
  '/chia-seeds',
  '/high-fiber-breakfast',
])

/** In-page anchor on the home page, router link to /#hash elsewhere. */
function HomeAnchor({ hash, className, children }: { hash: string; className?: string; children: ReactNode }) {
  const { pathname } = useLocation()
  return pathname === '/' ? (
    <a href={`#${hash}`} className={className}>
      {children}
    </a>
  ) : (
    <Link to={`/#${hash}`} className={className}>
      {children}
    </Link>
  )
}

function PrimaryNav({ guidesActive }: { guidesActive: boolean }) {
  return (
    <>
      <NavLink to="/" end className={({ isActive }) => (isActive ? 'is-active' : undefined)}>
        Calculator
      </NavLink>
      <HomeAnchor hash="foods">Fiber in foods</HomeAnchor>
      <HomeAnchor hash="guides" className={guidesActive ? 'is-active' : undefined}>
        Guides
      </HomeAnchor>
      <NavLink to="/30-day-plan" className={({ isActive }) => (isActive ? 'is-active' : undefined)}>
        30-day plan
      </NavLink>
    </>
  )
}

function BrandIcon() {
  return (
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
  )
}

export function SiteHeader() {
  const { pathname } = useLocation()
  const guidesActive = GUIDE_PATHS.has(pathname)

  return (
    <header className="topbar">
      <Link className="brand" to="/" aria-label="GetFibermaxxing home">
        <BrandIcon />
        <span className="brand-mark">GetFibermaxxing</span>
      </Link>

      <nav className="site-nav site-nav-desktop" aria-label="Primary">
        <PrimaryNav guidesActive={guidesActive} />
      </nav>

      <HomeAnchor hash="plan" className="topbar-cta">
        Free 7-day plan
      </HomeAnchor>

      <details
        className="topbar-menu"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('a')) {
            ;(e.currentTarget as HTMLDetailsElement).open = false
          }
        }}
      >
        <summary className="topbar-menu-btn" aria-label="Open menu">
          <span className="topbar-menu-icon" aria-hidden />
        </summary>
        <div className="topbar-menu-panel">
          <nav className="site-nav site-nav-mobile" aria-label="Primary">
            <PrimaryNav guidesActive={guidesActive} />
            <HomeAnchor hash="plan" className="topbar-menu-cta">
              Free 7-day plan
            </HomeAnchor>
          </nav>
        </div>
      </details>
    </header>
  )
}
