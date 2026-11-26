import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DocumentMeta } from '../components/DocumentMeta'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import { track, trackPageView } from '../lib/analytics'
import { planApi, saveKey } from '../lib/planClient'
import { PLAN_PRICE, RecoverLink } from './PlanSalesPage'
import '../styles/plan.css'

export const PLAN_THANKS_META = {
  path: '/30-day-plan-thanks',
  title: 'Your plan is ready | GetFibermaxxing',
  description: 'Payment received. Open your 30-day fiber plan.',
}

type Phase = 'checking' | 'ready' | 'pending' | 'error'

const STEPS = [
  { title: 'Set your numbers', copy: 'Your daily target and about how much you eat now.' },
  { title: 'Pick a version', copy: 'Standard, GLP-1 or Gentle gut. You can switch later.' },
  { title: 'Shop for Week 1', copy: 'The list is on the Week 1 page. Start tomorrow morning.' },
]

export function PlanThanksPage() {
  const [phase, setPhase] = useState<Phase>('checking')
  const [sessionId, setSessionId] = useState('')
  const [email, setEmail] = useState('')
  const [key, setKey] = useState('')
  const [resend, setResend] = useState<'idle' | 'busy' | 'sent' | 'error'>('idle')

  useEffect(() => {
    const sid = new URLSearchParams(window.location.search).get('session_id') || ''
    setSessionId(sid)
    // Keep the session id out of analytics page_location.
    if (sid) window.history.replaceState(null, '', PLAN_THANKS_META.path)
    trackPageView(PLAN_THANKS_META.path)
    if (!sid) {
      setPhase('error')
      return
    }
    let tries = 0
    let stop = false
    const run = async () => {
      tries += 1
      try {
        const r = await planApi.claim(sid)
        if (stop) return
        if (r.ok && r.data.key) {
          saveKey(r.data.key)
          setKey(r.data.key)
          setEmail(r.data.email || '')
          setPhase('ready')
          // One purchase event per checkout session, even if the page is reloaded.
          const seenKey = `fm_purchase_${sid.slice(-16)}`
          let seen = false
          try {
            seen = sessionStorage.getItem(seenKey) === '1' || localStorage.getItem(seenKey) === '1'
            localStorage.setItem(seenKey, '1')
          } catch {
            /* storage blocked */
          }
          if (!seen) track('purchase', { transaction_id: sid, value: PLAN_PRICE.now, currency: 'USD', item_id: 'fiber30' })
          return
        }
        // Card payments settle instantly; a few methods take a moment. Retry briefly.
        if (r.status === 402 && tries < 6) {
          setPhase('pending')
          setTimeout(run, 2500)
          return
        }
      } catch {
        if (tries < 3) {
          setTimeout(run, 2000)
          return
        }
      }
      setPhase('error')
    }
    run()
    return () => {
      stop = true
    }
  }, [])

  async function sendAgain() {
    setResend('busy')
    try {
      const r = await planApi.resend(sessionId)
      setResend(r.ok ? 'sent' : 'error')
    } catch {
      setResend('error')
    }
  }

  return (
    <div className="app">
      <DocumentMeta title={PLAN_THANKS_META.title} description={PLAN_THANKS_META.description} path={PLAN_THANKS_META.path} noindex />
      <SiteHeader />
      <main className="pl-thanks pl-band">
        <div className="pl-thanks-inner">
          <div className="pl-thanks-card">
            {phase === 'ready' ? (
              <>
                <span className="pl-done-icon" aria-hidden="true">
                  <svg width="28" height="28" viewBox="0 0 16 16"><path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                <h1>Payment received. Your plan is ready.</h1>
                <p className="pl-lede">
                  {email ? (
                    <>We also emailed a private link to <b>{email}</b>. </>
                  ) : null}
                  Bookmark the plan, or open it from that email on any device.
                </p>
                <a className="pl-btn pl-btn-primary pl-btn-inline" href={`/my-plan#k=${key}`}>
                  Open my 30-day plan
                </a>
                {resend === 'sent' ? (
                  <p className="pl-ok">Sent again. It can take a minute.</p>
                ) : (
                  <p className="pl-fine">
                    No email after 5 minutes? Check spam, or{' '}
                    <button type="button" className="pl-linkbtn" onClick={sendAgain} disabled={resend === 'busy'}>
                      send it again
                    </button>
                    .{resend === 'error' && ' That didn’t work; please email hello@getfibermaxxing.com.'}
                  </p>
                )}
              </>
            ) : phase === 'error' ? (
              <>
                <h1>We couldn’t confirm this payment yet</h1>
                <p className="pl-lede">
                  If you were charged, your link is on its way by email. You can also request it below, or write to
                  hello@getfibermaxxing.com and we’ll sort it out.
                </p>
                <RecoverLink />
                <p className="pl-fine">
                  <Link to="/30-day-plan">Back to the plan page</Link>
                </p>
              </>
            ) : (
              <>
                <h1>Confirming your payment…</h1>
                <p className="pl-lede">This usually takes a second or two.</p>
              </>
            )}
          </div>

          {phase === 'ready' && (
            <div className="pl-steps">
              <h2>Before Day 1</h2>
              <ol className="pl-grid3">
                {STEPS.map((s, i) => (
                  <li className="pl-card pl-card-sm" key={s.title}>
                    <span className="pl-step-n">{i + 1}</span>
                    <b>{s.title}</b>
                    <p>{s.copy}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <p className="pl-fine">
            Stripe emails your receipt. Changed your mind? Reply to the plan email within 7 days for a full refund.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
