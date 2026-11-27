import { useEffect, useRef, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { FoodThumb, PhotoCredits } from '../FoodPhoto'
import { foodPhotoFor } from '../../content/foodPhotos'
import { clamp01, easeOut, numWidth, prefersReducedMotion, runFrames } from '../../lib/motion'

/**
 * Editorial food list (design boards 31–33, M4). Values match what the calculator
 * returns for the same phrase (USDA FoodData Central SR Legacy × household weight).
 * When the list scrolls into view the bars grow (CSS, scaleX) and the grams count
 * up with them; the top three get a large rank. Each row shows an Unsplash photo of the food.
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
const PHOTOS = FOODS.map((f) => foodPhotoFor(f.to)!)
/** Bars start 150 ms after the row, 70 ms apart, and grow for 600 ms (home-v3.css). */
const BAR_DELAY = 150
const STAGGER = 70
const GROW = 600

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
                <span className="hv-food-icon">
                  <FoodThumb photo={PHOTOS[i]} size={i < 3 ? 64 : 44} />
                </span>
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
      <PhotoCredits className="photo-credits hv-photo-credits" photos={PHOTOS} />
    </section>
  )
}
