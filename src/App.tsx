import { Route, Routes } from 'react-router-dom'
import { BrandPreviewPage } from './pages/BrandPreviewPage'
import { AboutPage } from './pages/AboutPage'
import { HomePage } from './pages/HomePage'
import { LegalPage } from './pages/LegalPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { SeoLandingPage } from './pages/SeoLandingPage'
import { ViewTransitions } from './components/ViewTransitions'
import { MyPlanPage } from './pages/MyPlanPage'
import { PlanSalesPage } from './pages/PlanSalesPage'
import { PlanThanksPage } from './pages/PlanThanksPage'
import './App.css'
import './layout-v2.css'
import './home-v3.css'

export default function App() {
  return (
    <>
      <ViewTransitions />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy" element={<LegalPage doc="privacy" />} />
        <Route path="/terms" element={<LegalPage doc="terms" />} />
        <Route path="/30-day-plan" element={<PlanSalesPage />} />
        <Route path="/30-day-plan-thanks" element={<PlanThanksPage />} />
        <Route path="/my-plan" element={<MyPlanPage />} />
        <Route path="/brand-preview" element={<BrandPreviewPage />} />
        <Route path="/:slug" element={<SeoLandingPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}
