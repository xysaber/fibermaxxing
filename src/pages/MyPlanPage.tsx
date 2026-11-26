import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { DocumentMeta } from '../components/DocumentMeta'
import { trackPageView } from '../lib/analytics'
import {
  addOns,
  DEFAULT_STATE,
  lastTarget,
  nearestTier,
  planApi,
  readKey,
  shoppingList,
  TRACKS,
  weeklyGoals,
  type PlanContent,
  type PlanDay,
  type PlanState,
  type Track,
} from '../lib/planClient'
import { RecoverLink, SourceList } from './PlanSalesPage'
import '../styles/plan.css'

export const MY_PLAN_META = {
  path: '/my-plan',
  title: 'Your 30-day plan | GetFibermaxxing',
  description: 'Your 30-day fiber plan.',
}

const SLOT_LABEL: Record<string, string> = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' }
const WEEK_NAMES = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Days 29–30']

type Load = 'loading' | 'nokey' | 'invalid' | 'error' | 'ready'

function clampInt(v: string, lo: number, hi: number, fallback: number) {
  const n = Math.round(Number(v))
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : fallback
}

function BrandIcon() {
  return (
    <svg className="brand-icon" viewBox="0 0 44 44" aria-hidden>
      <circle cx="22" cy="22" r="17" fill="none" stroke="#e7f2ea" strokeWidth="6" />
      <circle cx="22" cy="22" r="17" fill="none" stroke="#1f6b45" strokeWidth="6" strokeLinecap="round" strokeDasharray="80 107" transform="rotate(-90 22 22)" />
      <path d="M22 14c-4 3-5 9-1 14 4-3 5-9 1-14z" fill="#2e9e5b" />
    </svg>
  )
}

function PrintIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4 6V2h8v4M4 12H2.5V6.5h11V12H12M4 10h8v4H4z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  )
}

function DayCard({ content, day, label, goal, track, week, prepNote }: {
  content: PlanContent; day: PlanDay; label: string; goal: number; track: Track; week: number; prepNote?: string
}) {
  const gap = Math.round((goal - day.g) * 10) / 10
  const extra = addOns(content, track, week, gap)
  return (
    <div className="pl-daycard">
      <div className="pl-daycard-head">
        <b>{label}</b>
        {prepNote && <span>{prepNote}</span>}
      </div>
      {day.m.map((id) => {
        const m = content.meals[id]
        if (!m) return null
        return (
          <div className="pl-meal" key={id}>
            <span className="pl-slot">{SLOT_LABEL[m.slot]}</span>
            <div className="pl-meal-body">
              <b>{m.name}</b>
              <span>
                {m.items.map((i) => i.t).join(', ')}
                {m.with ? `, ${m.with}` : ''}
              </span>
            </div>
            <span className="pl-grams">{m.g} g</span>
          </div>
        )
      })}
      {extra.length > 0 && (
        <div className="pl-addon">
          <span>To reach {goal} g, add:</span>
          <b>{extra.map((m) => `${m.name.toLowerCase()} (${m.items.map((i) => i.t).join(', ')}, ${m.g} g)`).join(' or ')}</b>
        </div>
      )}
      {gap < -3 && <div className="pl-addon">Over this week’s goal. Skip the snack or halve the beans if you feel too full.</div>}
      <div className="pl-day-total">
        <span>Day total · goal {goal} g</span>
        <span className="pl-grams pl-grams-lg">{day.g} g</span>
      </div>
    </div>
  )
}

export function MyPlanPage() {
  const [load, setLoad] = useState<Load>('loading')
  const [key, setKey] = useState('')
  const [content, setContent] = useState<PlanContent | null>(null)
  const [st, setSt] = useState<PlanState>(DEFAULT_STATE)
  const [targetText, setTargetText] = useState('')
  const [startText, setStartText] = useState('')
  const [week, setWeek] = useState(0) // 0–3 weeks, 4 = days 29–30
  const [dayIdx, setDayIdx] = useState(0)
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'offline'>('saved')
  const ready = useRef(false)
  const skipSave = useRef(true)

  useEffect(() => {
    const k = readKey()
    // Keep the access key out of analytics and the address bar; this browser remembers it.
    if (window.location.hash) window.history.replaceState(null, '', MY_PLAN_META.path)
    trackPageView(MY_PLAN_META.path)
    if (!k) {
      setLoad('nokey')
      return
    }
    setKey(k)
    Promise.all([planApi.content(k), planApi.getState(k)])
      .then(([c, s]) => {
        if (c.status === 404 || c.status === 400) {
          setLoad('invalid')
          return
        }
        if (!c.ok) {
          setLoad('error')
          return
        }
        const saved = s.data.state || {}
        const next: PlanState = {
          target: saved.target ?? lastTarget() ?? DEFAULT_STATE.target,
          start: saved.start ?? DEFAULT_STATE.start,
          track: (saved.track as Track) ?? DEFAULT_STATE.track,
          done: saved.done ?? [],
        }
        setContent(c.data)
        setSt(next)
        setTargetText(String(next.target))
        setStartText(String(next.start))
        const firstOpen = [...Array(30).keys()].map((i) => i + 1).find((d) => !next.done.includes(d)) ?? 30
        const w = firstOpen > 28 ? 4 : Math.floor((firstOpen - 1) / 7)
        setWeek(w)
        setDayIdx(w === 4 ? firstOpen - 29 : (firstOpen - 1) % 7)
        setLoad('ready')
        ready.current = true
      })
      .catch(() => setLoad('error'))
  }, [])

  // Save settings and tracker to the server (debounced), so they follow the link to any device.
  useEffect(() => {
    if (!ready.current || !key) return
    if (skipSave.current) {
      skipSave.current = false // state just loaded from the server; nothing to save
      return
    }
    setSaveState('saving')
    const t = setTimeout(() => {
      planApi
        .putState(key, st)
        .then((r) => setSaveState(r.ok ? 'saved' : 'offline'))
        .catch(() => setSaveState('offline'))
    }, 700)
    return () => clearTimeout(t)
  }, [st, key])

  const goals = useMemo(() => weeklyGoals(st), [st])
  const weekDays: PlanDay[] = useMemo(() => {
    if (!content) return []
    const w = Math.min(week, 3)
    const tier = nearestTier(content.tiers[st.track], goals[w])
    const days = content.menus[st.track][String(tier)][w]
    return week === 4 ? days.slice(0, 2) : days
  }, [content, st.track, goals, week])

  if (load !== 'ready' || !content) {
    return (
      <div className="app">
        <DocumentMeta title={MY_PLAN_META.title} description={MY_PLAN_META.description} path={MY_PLAN_META.path} noindex />
        <PlanTopbar />
        <main className="pl-thanks pl-band">
          <div className="pl-thanks-inner">
            <div className="pl-thanks-card">
              {load === 'loading' ? (
                <h1>Opening your plan…</h1>
              ) : load === 'error' ? (
                <>
                  <h1>We couldn’t load your plan</h1>
                  <p className="pl-lede">Check your connection and reload the page.</p>
                </>
              ) : (
                <>
                  <h1>{load === 'invalid' ? 'This plan link isn’t active' : 'Open your plan from your email'}</h1>
                  <p className="pl-lede">
                    {load === 'invalid'
                      ? 'The link may be mistyped, or the purchase was refunded. Request a fresh link below.'
                      : 'Your plan opens from the private link we emailed after checkout. Lost it? We can send it again.'}
                  </p>
                  <RecoverLink />
                  <p className="pl-fine">
                    Don’t have the plan yet? <Link to="/30-day-plan">See what’s inside</Link>.
                  </p>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    )
  }

  const guide = content.guide
  const trackNotes = guide.tracks[st.track]
  const isLast = week === 4
  const wg = isLast ? guide.days2930 : guide.weeks[week]
  const focus = (!isLast && trackNotes.weekFocus[String(week + 1)]) || wg.focus
  const goal = goals[Math.min(week, 3)]
  const firstDay = isLast ? 29 : week * 7 + 1
  const dayNums = weekDays.map((_, i) => firstDay + i)
  const curDay = weekDays[Math.min(dayIdx, weekDays.length - 1)]
  const curNum = dayNums[Math.min(dayIdx, dayNums.length - 1)]
  const nextDay = weekDays[dayIdx + 1]
  const prep = nextDay
    ?.m.map((id) => content.meals[id])
    .find((m) => m?.prep)
  const shop = shoppingList(content, weekDays)
  const tips = [...wg.tips, ...trackNotes.extraTips]
  const capped = content.tiers[st.track].at(-1)!
  const isDone = st.done.includes(curNum)

  const update = (patch: Partial<PlanState>) => setSt((s) => ({ ...s, ...patch }))
  const toggleDone = (n: number) =>
    update({ done: st.done.includes(n) ? st.done.filter((d) => d !== n) : [...st.done, n].sort((a, b) => a - b) })

  return (
    <div className="app pl-reader">
      <DocumentMeta title={MY_PLAN_META.title} description={MY_PLAN_META.description} path={MY_PLAN_META.path} noindex />
      <PlanTopbar onPrint={() => window.print()} saveState={saveState} />

      <section className="pl-setup pl-band no-print">
        <div className="pl-setup-row">
          <label className="pl-field">
            Daily target
            <span className="pl-input">
              <input
                type="number"
                inputMode="numeric"
                min={10}
                max={70}
                value={targetText}
                onChange={(e) => setTargetText(e.target.value)}
                onBlur={() => {
                  const v = clampInt(targetText, 10, 70, st.target)
                  setTargetText(String(v))
                  update({ target: v })
                }}
              />
              <span>g</span>
            </span>
          </label>
          <label className="pl-field">
            You eat now, about
            <span className="pl-input">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={70}
                value={startText}
                onChange={(e) => setStartText(e.target.value)}
                onBlur={() => {
                  const v = clampInt(startText, 0, 70, st.start)
                  setStartText(String(v))
                  update({ start: v })
                }}
              />
              <span>g</span>
            </span>
          </label>
          <div className="pl-field">
            <span>Version</span>
            <div className="pl-seg" role="group" aria-label="Plan version">
              {TRACKS.map((t) => (
                <button key={t.id} type="button" aria-pressed={st.track === t.id} onClick={() => update({ track: t.id })}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <p className="pl-fine">
          {trackNotes.intro} Not sure what you eat now? Log one normal day in the <Link to="/">calculator</Link>.
          {st.target > capped && ` This version’s menus top out near ${capped} g; add-ons fill the rest.`}
        </p>
      </section>

      <div className="pl-body">
        <nav className="pl-weeks no-print" aria-label="Weeks">
          {WEEK_NAMES.map((name, i) => (
            <button
              key={name}
              type="button"
              aria-current={week === i ? 'page' : undefined}
              onClick={() => {
                setWeek(i)
                setDayIdx(0)
              }}
            >
              <span>
                <b>{name}</b>
                <small>{i < 4 ? guide.weeks[i].title : guide.days2930.title}</small>
              </span>
              {i < 4 && <em>{goals[i]} g</em>}
            </button>
          ))}
        </nav>

        <div className="pl-main">
          <div className="pl-week-head">
            <p className="pl-kicker">
              {isLast ? 'Days 29–30' : `Week ${week + 1} · Days ${firstDay}–${firstDay + 6}`}
            </p>
            <h1>
              {wg.title}: {goal} g a day
            </h1>
            <p className="pl-lede">{focus}</p>
          </div>

          <div className="pl-days no-print" role="group" aria-label="Days">
            {dayNums.map((n, i) => (
              <button key={n} type="button" aria-pressed={i === dayIdx} onClick={() => setDayIdx(i)} className={st.done.includes(n) ? 'is-done' : undefined}>
                <small>Day</small>
                <b>{n}</b>
              </button>
            ))}
          </div>

          <div className="no-print">
            <DayCard
              content={content}
              day={curDay}
              label={`Day ${curNum}`}
              goal={goal}
              track={st.track}
              week={Math.min(week, 3) + 1}
              prepNote={prep?.prep ? `Prep tonight for tomorrow: ${prep.prep.charAt(0).toLowerCase()}${prep.prep.slice(1)}` : undefined}
            />
            <button type="button" className={`pl-btn ${isDone ? 'pl-btn-soft' : 'pl-btn-primary'} pl-done-btn`} aria-pressed={isDone} onClick={() => toggleDone(curNum)}>
              {isDone ? `Day ${curNum} done` : `Mark Day ${curNum} done`}
            </button>
          </div>

          {/* Print: the whole week on paper */}
          <div className="print-only">
            {weekDays.map((d, i) => (
              <DayCard key={i} content={content} day={d} label={`Day ${dayNums[i]}`} goal={goal} track={st.track} week={Math.min(week, 3) + 1} />
            ))}
          </div>

          <section className="pl-tracker">
            <h2>30-day tracker</h2>
            <p className="pl-fine no-print">Tap a day when you hit its goal. It prints as a one-page checklist.</p>
            <div className="pl-track-grid">
              {[...Array(30).keys()].map((i) => {
                const n = i + 1
                const on = st.done.includes(n)
                return (
                  <button key={n} type="button" aria-pressed={on} aria-label={`Day ${n}${on ? ', done' : ''}`} onClick={() => toggleDone(n)}>
                    {n}
                  </button>
                )
              })}
            </div>
          </section>

          <section className="pl-card pl-sources">
            <h2 className="pl-aside-title">Sources</h2>
            <SourceList sources={guide.sources} />
            <p className="pl-fine">{guide.disclaimer}</p>
          </section>
        </div>

        <aside className="pl-aside">
          <div className="pl-card">
            <h2 className="pl-aside-title">{isLast ? 'Shopping list' : `Week ${week + 1} shopping list`}</h2>
            {shop.map((g) => (
              <div key={g.cat} className="pl-shop-group">
                <small>{g.cat}</small>
                {g.lines.map((l) => (
                  <label key={l.name} className="pl-shop-line">
                    <input type="checkbox" />
                    <span>
                      {l.name}
                      <em> · {l.days} {l.days === 1 ? 'day' : 'days'}</em>
                    </span>
                  </label>
                ))}
              </div>
            ))}
          </div>
          <div className="pl-warn">
            <b>Feeling bloated?</b>
            <p>{guide.bloating}</p>
          </div>
          <div className="pl-card">
            <h2 className="pl-aside-title">Tips for this week</h2>
            <ul className="pl-tips">
              {tips.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}

function PlanTopbar({ onPrint, saveState }: { onPrint?: () => void; saveState?: 'saved' | 'saving' | 'offline' }) {
  return (
    <header className="topbar pl-topbar no-print">
      <Link className="brand" to="/" aria-label="GetFibermaxxing home">
        <BrandIcon />
        <span className="brand-mark">GetFibermaxxing</span>
      </Link>
      <div className="pl-topbar-right">
        {saveState && (
          <span className="pl-save" aria-live="polite">
            {saveState === 'saving' ? 'Saving…' : saveState === 'offline' ? 'Not saved, check connection' : 'Saved to your link'}
          </span>
        )}
        {onPrint && (
          <button type="button" className="pl-btn pl-btn-ghost pl-print" onClick={onPrint}>
            <PrintIcon />
            <span>Print or save PDF</span>
          </button>
        )}
      </div>
    </header>
  )
}
