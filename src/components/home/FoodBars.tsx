import { useEffect, useRef, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { clamp01, easeOut, numWidth, prefersReducedMotion, runFrames } from '../../lib/motion'

/**
 * Editorial food list (design boards 31–33, M4). Values match what the calculator
 * returns for the same phrase (USDA FoodData Central SR Legacy × household weight).
 * When the list scrolls into view the bars grow (CSS, scaleX) and the grams count
 * up with them; the top three get a large rank and a small drawing.
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
/** Bars start 150 ms after the row, 70 ms apart, and grow for 600 ms (home-v3.css). */
const BAR_DELAY = 150
const STAGGER = 70
const GROW = 600

function FoodIcon({ index }: { index: number }) {
  if (index === 0)
    return (
      <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
        <ellipse cx="15" cy="26" rx="7" ry="5" fill="#b45309" />
        <ellipse cx="26" cy="22" rx="7" ry="5" fill="#c9772a" />
        <ellipse cx="22" cy="31" rx="7" ry="5" fill="#9a4a0b" />
        <ellipse cx="31" cy="30" rx="6" ry="4.5" fill="#b45309" />
        <ellipse cx="19" cy="17" rx="6" ry="4.5" fill="#d08a3e" />
      </svg>
    )
  if (index === 1)
    return (
      <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
        <path d="M12 24c0-8 7-13 14-11 6 2 8 7 6 10-1 2-4 2-6 1-3-1-5 0-5 3 0 4-2 7-5 6-3-1-4-5-4-9z" fill="#13201a" />
        <path d="M18 17c2-2 5-2 7-1" stroke="#45524b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
    )
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
      <path d="M22 6c6 0 9 8 11 15 3 9-3 17-11 17s-14-8-11-17C13 14 16 6 22 6z" fill="#1f6b45" />
      <path d="M22 10c4 0 7 7 8 12 2 7-2 12-8 12s-10-5-8-12c1-5 4-12 8-12z" fill="#c8dfa0" />
      <circle cx="22" cy="26" r="5.5" fill="#9a4a0b" />
    </svg>
  )
}

export function FoodBars() {
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const list = listRef.current
    if (!list || typeof IntersectionObserver === 'undefined' || prefersReducedMotion()) return
    let cancel = () => {}
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        io.disconnect()
        // Count only when the section actually hid for its reveal (below the fold).
        if (!list.closest('.reveal-armed')) return
        const nums = Array.from(list.querySelectorAll<HTMLElement>('.hv-food-g > span')).map((el) => el.firstChild)
        const set = (t: number) =>
          nums.forEach((n, i) => {
            if (!n) return
            const x = easeOut(clamp01((t - BAR_DELAY - i * STAGGER) / GROW))
            n.nodeValue = (FOODS[i].g * x).toFixed(1)
          })
        set(0)
        const end = BAR_DELAY + (FOODS.length - 1) * STAGGER + GROW
        cancel = runFrames((t) => {
          set(t)
          return t < end
        })
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    io.observe(list.closest('section') ?? list)
    return () => {
      io.disconnect()
      cancel()
    }
  }, [])

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
      <ul className="hv-foods" ref={listRef}>
        {FOODS.map((f, i) => (
          <li key={f.name} className={i < 3 ? 'is-top' : undefined} style={{ '--i': i } as CSSProperties}>
            <Link to={f.to} className="hv-food">
              <span className="hv-food-rank" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="hv-food-name">
                {i < 3 ? (
                  <span className="hv-food-icon">
                    <FoodIcon index={i} />
                  </span>
                ) : null}
                <span className="hv-food-text">
                  <span className="hv-food-title">{f.name}</span>
                  <span className="hv-food-portion">{f.portion}</span>
                </span>
              </span>
              <span className="hv-bar hv-bar--food" aria-hidden="true">
                <i className="hv-grow" style={{ width: `${(f.g / MAX) * 100}%`, animationDelay: `${BAR_DELAY + i * STAGGER}ms` }} />
              </span>
              <span className="hv-food-g">
                <span className="hm-fixed-num" style={{ minWidth: numWidth(f.g.toFixed(1)) }}>
                  {f.g.toFixed(1)}
                </span>
                <small> g</small>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
