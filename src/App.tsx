import { Route, Routes } from 'react-router-dom'
import { BrandPreviewPage } from './pages/BrandPreviewPage'
import { HomePage } from './pages/HomePage'
import { LegalPage } from './pages/LegalPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { SeoLandingPage } from './pages/SeoLandingPage'
import './App.css'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/privacy" element={<LegalPage doc="privacy" />} />
      <Route path="/terms" element={<LegalPage doc="terms" />} />
      <Route path="/brand-preview" element={<BrandPreviewPage />} />
      <Route path="/:slug" element={<SeoLandingPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
