import { renderToString } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AboutPage } from '../src/pages/AboutPage'
import { HomePage } from '../src/pages/HomePage'
import { LegalPage } from '../src/pages/LegalPage'
import { SeoLandingPage } from '../src/pages/SeoLandingPage'
import { NotFoundPage } from '../src/pages/NotFoundPage'
import { MyPlanPage } from '../src/pages/MyPlanPage'
import { PlanSalesPage } from '../src/pages/PlanSalesPage'
import { PlanThanksPage } from '../src/pages/PlanThanksPage'

/** Build the same visible page markup that the client renders. */
export function renderPage(path: string) {
  return renderToString(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy" element={<LegalPage doc="privacy" />} />
        <Route path="/terms" element={<LegalPage doc="terms" />} />
        <Route path="/30-day-plan" element={<PlanSalesPage />} />
        <Route path="/30-day-plan-thanks" element={<PlanThanksPage />} />
        <Route path="/my-plan" element={<MyPlanPage />} />
        <Route path="/:slug" element={<SeoLandingPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </MemoryRouter>,
  )
}
