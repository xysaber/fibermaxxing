import { useState, type FormEvent } from 'react'
import { track } from '../lib/analytics'

type Props = {
  /** Where the form is shown, for analytics and the stored record. */
  source: string
  targetG?: number
  gapG?: number
  variant?: 'result' | 'section' | 'card' | 'aside' | 'mail'
  kicker?: string
  title?: string
  copy?: string
  button?: string
  /** Show the copy under the form (small print) instead of above it. */
  copyAfter?: boolean
}

type Status = 'idle' | 'sending' | 'done' | 'already' | 'error' | 'invalid'

export function EmailSignup({ source, targetG, gapG, variant = 'section', kicker, title, copy, button, copyAfter = false }: Props) {
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  const gapText = gapG && gapG > 0 ? `${gapG} g` : null

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const value = email.trim()
    if (!/^\S+@\S+\.\S+$/.test(value)) {
      setStatus('invalid')
      return
    }
    setStatus('sending')
    track('email_signup_attempt', { source })
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: value, company, source, target_g: targetG, gap_g: gapG }),
      })
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; already?: boolean; error?: string }
      if (res.ok && data.ok) {
        setStatus(data.already ? 'already' : 'done')
        track('email_signup_success', { source, already: Boolean(data.already) })
        // Key event: a new subscriber only. Never send the email address.
        if (!data.already) track('generate_lead', { source })
      } else {
        setStatus(data.error === 'invalid_email' ? 'invalid' : 'error')
      }
    } catch {
      setStatus('error')
    }
  }

  const copyBlock = (
    <p className="email-signup-copy">
      {copy ??
        'One short email a day with one easy change, sized so you add fiber without the bloating. Unsubscribe anytime.'}
    </p>
  )

  return (
    <div className={`email-signup email-signup--${variant}`}>
      {kicker !== '' ? <p className="email-signup-kicker">{kicker ?? 'Free · by email'}</p> : null}
      {title !== '' ? (
        <h3 className="email-signup-title">
          {title ?? (gapText ? `Get a 7-day plan to close your ${gapText} gap` : 'Free 7-day starter plan')}
        </h3>
      ) : null}
      {copyAfter ? null : copyBlock}
      {status === 'done' || status === 'already' ? (
        <p className="email-signup-done" role="status">
          {status === 'done'
            ? 'Check your inbox. Day 1 is on its way.'
            : 'You’re already on the list. Check your inbox for the plan.'}
        </p>
      ) : (
        <form className="email-signup-form" onSubmit={onSubmit} noValidate>
          <label className="sr-only" htmlFor={`email-${source}`}>
            Email address
          </label>
          <input
            id={`email-${source}`}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (status === 'invalid' || status === 'error') setStatus('idle')
            }}
            aria-invalid={status === 'invalid'}
          />
          <input
            className="email-signup-hp"
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : button ?? 'Send my plan'}
          </button>
        </form>
      )}
      {status === 'invalid' ? (
        <p className="email-signup-error" role="alert">
          Please enter a valid email address.
        </p>
      ) : null}
      {status === 'error' ? (
        <p className="email-signup-error" role="alert">
          Sign-up isn’t working right now. Please try again later.
        </p>
      ) : null}
      {copyAfter ? copyBlock : null}
    </div>
  )
}
