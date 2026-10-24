import { Link } from 'react-router-dom'
import { DocumentMeta } from '../components/DocumentMeta'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'

export function NotFoundPage() {
  return (
    <div className="app">
      <DocumentMeta
        title="Page not found | GetFibermaxxing"
        description="That page does not exist. Try the fibermaxxing calculator or a fiber guide."
        path="/404"
      />
      <SiteHeader />
      <section className="seo-landing-hero">
        <h1>Page not found</h1>
        <p className="lede">
          This URL is not a published guide. Head back to the calculator or pick a fiber topic below.
        </p>
        <p className="related-list" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/">Daily calculator</Link>
          <Link to="/how-much-fiber-per-day">How much fiber per day</Link>
          <Link to="/oatmeal">Oatmeal fiber</Link>
          <Link to="/chia-seeds">Chia seeds fiber</Link>
          <Link to="/high-fiber-breakfast">High-fiber breakfast</Link>
        </p>
      </section>
      <SiteFooter />
    </div>
  )
}
