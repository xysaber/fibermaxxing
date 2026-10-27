import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { DocumentMeta } from '../components/DocumentMeta'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import { PrivacyPolicyBody } from '../content/legal/privacyBody'
import { TermsOfServiceBody } from '../content/legal/termsBody'
import { trackPageView } from '../lib/analytics'

export type LegalDoc = 'privacy' | 'terms'

const META: Record<
  LegalDoc,
  { path: string; title: string; description: string; heading: string; updated: string }
> = {
  privacy: {
    path: '/privacy',
    title: 'Privacy Policy | GetFibermaxxing',
    description:
      'How GetFibermaxxing collects and uses information for the free fibermaxxing calculator, including meal logs and analytics.',
    heading: 'Privacy Policy',
    updated: 'October 27, 2026',
  },
  terms: {
    path: '/terms',
    title: 'Terms of Service | GetFibermaxxing',
    description:
      'Terms of Service for the GetFibermaxxing fiber intake estimator and fibermaxxing calculator.',
    heading: 'Terms of Service',
    updated: 'October 27, 2026',
  },
}

export function LegalPage({ doc }: { doc: LegalDoc }) {
  const meta = META[doc]

  useEffect(() => {
    trackPageView(meta.path)
  }, [meta.path])

  return (
    <div className="app">
      <DocumentMeta title={meta.title} description={meta.description} path={meta.path} />
      <SiteHeader />
      <article className="legal-page">
        <header className="legal-header">
          <p className="legal-switch" aria-label="Legal documents">
            <Link to="/privacy" className={doc === 'privacy' ? 'is-active' : undefined}>
              Privacy
            </Link>
            <span aria-hidden="true"> · </span>
            <Link to="/terms" className={doc === 'terms' ? 'is-active' : undefined}>
              Terms
            </Link>
          </p>
          <h1>{meta.heading}</h1>
          <p className="legal-updated">Last updated: {meta.updated}</p>
        </header>
        <div className="legal-prose">{doc === 'privacy' ? <PrivacyPolicyBody /> : <TermsOfServiceBody />}</div>
      </article>
      <SiteFooter />
    </div>
  )
}
