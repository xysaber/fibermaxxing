import type { ReactNode } from 'react'

function BrandIcon({ className = 'brand-icon' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden>
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
  )
}

function Stage({
  children,
  label,
  wide,
}: {
  children: ReactNode
  label: string
  wide?: boolean
}) {
  return (
    <div className={`brand-preview-stage${wide ? ' brand-preview-stage-wide' : ''}`} aria-label={label}>
      {children}
    </div>
  )
}

export function BrandPreviewPage() {
  return (
    <div className="brand-preview-page">
      <header className="brand-preview-head">
        <p className="brand-preview-kicker">Candidate lockup</p>
        <h1>GetFibermaxxing · maxxing accent</h1>
        <p className="brand-preview-lede">
          Runner-up direction: full legal name, Score Blue on <em>maxxing</em>, live mono tag
          unchanged.
        </p>
      </header>

      <section className="brand-preview-hero-card" aria-label="Selected direction">
        <Stage label="Selected lockup" wide>
          <div className="brand brand-opt-final">
            <BrandIcon />
            <span className="brand-lockup">
              <span className="brand-mark">
                GetFiber
                <span className="brand-max">maxxing</span>
              </span>
              <span className="brand-tag">Daily fiber calculator</span>
            </span>
          </div>
        </Stage>

        <div className="brand-preview-compare">
          <div>
            <p className="brand-preview-opt">Now (live)</p>
            <Stage label="Current live lockup">
              <div className="brand">
                <BrandIcon />
                <span className="brand-lockup">
                  <span className="brand-mark">
                    Fiber<span className="brand-max">max</span>
                  </span>
                  <span className="brand-tag">Daily fibermaxxing calculator</span>
                </span>
              </div>
            </Stage>
          </div>
          <div>
            <p className="brand-preview-opt">Proposed</p>
            <Stage label="Proposed lockup">
              <div className="brand brand-opt-final">
                <BrandIcon />
                <span className="brand-lockup">
                  <span className="brand-mark">
                    GetFiber
                    <span className="brand-max">maxxing</span>
                  </span>
                  <span className="brand-tag">Daily fiber calculator</span>
                </span>
              </div>
            </Stage>
          </div>
        </div>
      </section>

      <p className="brand-preview-note">
        Tag keeps live type: JetBrains Mono, uppercase tracking, “Daily fiber calculator.”
        Approve and I’ll swap the real header.
      </p>
    </div>
  )
}
