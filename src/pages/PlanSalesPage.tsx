import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DocumentMeta } from '../components/DocumentMeta'
import { FaqBlock } from '../components/FaqBlock'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import sample from '../content/plan-sample.json'
import { PLAN_SOURCES } from '../content/planSources'
import { track, trackPageView } from '../lib/analytics'
import { planApi, TRACKS, type Track } from '../lib/planClient'
import '../styles/plan.css'

export const PLAN_PRICE = { now: 9, list: 14.99 }

export const PLAN_SALES_META = {
  path: '/30-day-plan',
  title: '30-Day High-Fiber Plan: Daily Menus to Reach Your Target | GetFibermaxxing',
  description:
    'A week-by-week plan from what you eat now to your daily fiber target: 28 days of menus with gram counts, weekly shopping lists, and GLP-1 and gentle-gut versions. $9 launch price.',
}

export const PLAN_FAQS = [
  {
    q: 'What do I get after paying?',
    a: 'A private link to your plan, shown right after checkout and emailed to you. It works on your phone and computer, keeps your settings and tracker on any device you open it on, and you can print the tracker or save the plan as a PDF.',
  },
  {
    q: 'How is my weekly goal set?',
    a: 'Enter your daily target from the calculator and roughly how much fiber you eat now. The plan steps up about 5 g a week (3 g in the GLP-1 and Gentle-gut versions) until you reach your target, and picks menus that land near each week’s goal.',
  },
  {
    q: 'What if it is not for me?',
    a: 'Reply to the plan email, or write to hello@getfibermaxxing.com, within 7 days of buying and we will refund you in full.',
  },
  {
    q: 'Who wrote it?',
    a: 'Mira Xin, Founder & Editor of GetFibermaxxing. Every gram count comes from USDA FoodData Central, the same data the free calculator uses, so you can type any day into the calculator and get the same total.',
  },
  {
    q: 'Is this medical advice?',
    a: 'No. It is a general eating plan for healthy adults. If you have a digestive condition, are pregnant, or take GLP-1 medication, follow your clinician’s advice first.',
  },
]

const VERSIONS = [
  { name: 'Standard', pace: 'About +5 g a week', copy: 'Beans, whole grains, fruit and seeds, added one meal at a time.' },
  {
    name: 'GLP-1',
    pace: 'About +3 g a week, smaller plates',
    copy: 'For smaller appetites. Protein first, fiber in small portions spread across the day, extra water.',
  },
  {
    name: 'Gentle gut',
    pace: 'About +3 g a week, soluble fiber first',
    copy: 'Oats, chia, kiwi and cooked vegetables first. Beans come in week 3, in small portions.',
  },
]

const WEEKS = [
  { label: 'Week 1', title: 'Start where you are', copy: 'One high-fiber breakfast a day. Find which foods sit well.' },
  { label: 'Week 2', title: 'Fix lunch', copy: 'Beans, lentils or whole grains at lunch, plus more water.' },
  { label: 'Week 3', title: 'Close the gap', copy: 'Half-plate vegetables at dinner and a fiber snack.' },
  { label: 'Week 4 + days 29–30', title: 'Make it automatic', copy: 'Hold your target and keep your go-to meals.' },
]

const INSIDE = [
  '28 daily menus, sized to your weekly goal',
  '4 weekly shopping lists',
  'Standard, GLP-1 and Gentle-gut versions',
  'What to do if you feel bloated',
  'Printable 30-day tracker',
]

function Check() {
  return (
    <svg className="pl-check" width="18" height="18" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function BuyButton({ place, className = '' }: { place: string; className?: string }) {
  const [state, setState] = useState<'idle' | 'busy' | 'error'>('idle')
  async function go() {
    setState('busy')
    track('begin_checkout', { place, value: PLAN_PRICE.now, currency: 'USD' })
    try {
      const r = await planApi.checkout()
      if (r.ok && r.data.url) {
        window.location.assign(r.data.url)
        return
      }
    } catch {
      /* fall through */
    }
    setState('error')
  }
  return (
    <div className={`pl-buy ${className}`}>
      <button type="button" className="pl-btn pl-btn-primary" onClick={go} disabled={state === 'busy'}>
        {state === 'busy' ? 'Opening checkout…' : `Get the plan for $${PLAN_PRICE.now}`}
      </button>
      {state === 'error' && (
        <p className="pl-error" role="alert">
          Checkout didn’t open. Please try again in a minute, or email hello@getfibermaxxing.com.
        </p>
      )}
    </div>
  )
}

export function RecoverLink() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle')
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setState('busy')
    try {
      const r = await planApi.recover(email)
      setState(r.ok ? 'done' : 'error')
      if (r.ok) track('plan_link_recover')
    } catch {
      setState('error')
    }
  }
  if (state === 'done') {
    return <p className="pl-recover-done">If that email bought the plan, the link is on its way. Check spam too.</p>
  }
  return (
    <form className="pl-recover" onSubmit={submit}>
      <label htmlFor="pl-recover-email">Already bought? Get your link again</label>
      <div className="pl-recover-row">
        <input
          id="pl-recover-email"
          type="email"
          required
          autoComplete="email"
          placeholder="Email you paid with"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="pl-btn pl-btn-ghost" disabled={state === 'busy'}>
          Email my link
        </button>
      </div>
      {state === 'error' && <p className="pl-error">That didn’t work. Check the address and try again.</p>}
    </form>
  )
}

export function SourceList({ sources }: { sources: typeof PLAN_SOURCES }) {
  return (
    <dl className="pl-source-list">
      {sources.map((s) => (
        <div key={s.topic}>
          <dt>{s.topic}</dt>
          {s.items.map((i) => (
            <dd key={i.url}>
              <a href={i.url} target="_blank" rel="noopener noreferrer">
                {i.label}
              </a>
            </dd>
          ))}
        </div>
      ))}
    </dl>
  )
}

const SLOT_LABEL: Record<string, string> = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' }

export function PlanSalesPage() {
  const [track_, setTrack] = useState<Track>('std')
  const [cancelled, setCancelled] = useState(false)
  useEffect(() => {
    trackPageView(PLAN_SALES_META.path)
    track('view_item', { item_id: 'fiber30', value: PLAN_PRICE.now, currency: 'USD' })
    setCancelled(new URLSearchParams(window.location.search).get('checkout') === 'cancelled')
  }, [])
  const day = sample[track_]

  return (
    <div className="app">
      <DocumentMeta title={PLAN_SALES_META.title} description={PLAN_SALES_META.description} path={PLAN_SALES_META.path} faqs={PLAN_FAQS} />
      <SiteHeader />

      <section className="pl-hero pl-band">
        <div className="pl-hero-copy">
          <p className="pl-kicker pl-kicker-amber">30-day plan · launch price</p>
          <h1>Reach your fiber target in 30 days, without the bloating</h1>
          <p className="pl-lede">
            A week-by-week ramp from what you eat now to your calculator target. 28 days of meals with gram counts, a
            shopping list for each week, and versions for GLP-1 users and sensitive stomachs.
          </p>
          <ul className="pl-trust">
            <li><Check />Gram counts from USDA FoodData Central</li>
            <li><Check />Open it on any device, print the tracker</li>
            <li><Check />7-day refund, no questions</li>
          </ul>
        </div>
        <div className="pl-price-card" id="buy">
          {cancelled && <p className="pl-note">Checkout cancelled. Nothing was charged.</p>}
          <div className="pl-price">
            <span className="pl-price-now">${PLAN_PRICE.now}</span>
            <s className="pl-price-list">${PLAN_PRICE.list}</s>
            <span className="pl-pill">Launch price</span>
          </div>
          <p className="pl-price-sub">One-time payment. Keep the plan, no subscription.</p>
          <ul className="pl-inside">
            {INSIDE.map((t) => (
              <li key={t}><Check />{t}</li>
            ))}
          </ul>
          <BuyButton place="hero" />
          <p className="pl-fine pl-center">Secure checkout by Stripe. Have a code? Add it at checkout.</p>
        </div>
      </section>

      <section className="pl-section">
        <div className="pl-section-head">
          <h2>One plan, three versions</h2>
          <p>Pick a version when you open the plan. You can switch any time; the menus and weekly goals change with it.</p>
        </div>
        <div className="pl-grid3">
          {VERSIONS.map((v) => (
            <div className="pl-card" key={v.name}>
              <h3>{v.name}</h3>
              <span className="pl-pace">{v.pace}</span>
              <p>{v.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="pl-section pl-band">
        <div className="pl-sample-head">
          <div>
            <p className="pl-kicker">Sample from the plan</p>
            <h2>Week 2, Day 9</h2>
          </div>
          <div className="pl-seg" role="group" aria-label="Plan version">
            {TRACKS.map((t) => (
              <button key={t.id} type="button" aria-pressed={track_ === t.id} onClick={() => setTrack(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="pl-day">
          {day.meals.map((m) => (
            <div className="pl-meal" key={m.slot + m.name}>
              <span className="pl-slot">{SLOT_LABEL[m.slot]}</span>
              <div className="pl-meal-body">
                <b>{m.name}</b>
                <span>{m.items}</span>
              </div>
              <span className="pl-grams">{m.g} g</span>
            </div>
          ))}
          <div className="pl-day-total">
            <span>Day total · this week’s goal {day.goal} g</span>
            <span className="pl-grams pl-grams-lg">{day.total} g</span>
          </div>
        </div>
        <p className="pl-fine">
          Shown for someone who eats about 15 g now with a 25 g target. Gram counts use the same USDA data as the free{' '}
          <Link to="/">calculator</Link>, so you can type any day in and check it.
        </p>
      </section>

      <section className="pl-section">
        <h2>Four weeks, one step at a time</h2>
        <div className="pl-grid4">
          {WEEKS.map((w) => (
            <div className="pl-card pl-card-sm" key={w.label}>
              <span className="pl-pace">{w.label}</span>
              <b>{w.title}</b>
              <p>{w.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="pl-faq-band pl-band">
        <FaqBlock title="Questions" faqs={PLAN_FAQS} id="plan-faq" />
      </div>

      <section className="pl-section pl-sources-section">
        <div className="pl-section-head">
          <h2>Where the plan’s rules come from</h2>
          <p>
            Targets, pacing and the GLP-1 and Gentle-gut adjustments follow public guidance. Where we made a judgment call,
            it says so.
          </p>
        </div>
        <SourceList sources={PLAN_SOURCES} />
      </section>

      <section className="pl-section pl-final">
        <h2>Start Day 1 tomorrow morning</h2>
        <div className="pl-price pl-price-sm">
          <span className="pl-price-now">${PLAN_PRICE.now}</span>
          <s className="pl-price-list">${PLAN_PRICE.list}</s>
          <span className="pl-price-sub">one-time, 7-day refund</span>
        </div>
        <BuyButton place="footer" className="pl-buy-inline" />
        <p className="pl-fine pl-final-note">
          By Mira Xin, Founder &amp; Editor. For education, not medical advice. If you have a digestive condition, are
          pregnant, or take GLP-1 medication, check with your clinician before changing your diet.
        </p>
        <RecoverLink />
      </section>

      <SiteFooter />
    </div>
  )
}
