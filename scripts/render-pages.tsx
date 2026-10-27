import { renderToString } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { HomePage } from '../src/pages/HomePage'
import { LegalPage } from '../src/pages/LegalPage'
import { SeoLandingPage } from '../src/pages/SeoLandingPage'
import { NotFoundPage } from '../src/pages/NotFoundPage'

/** Build the same visible page markup that the client renders. */
export function renderPage(path: string) {
  return renderToString(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/privacy" element={<LegalPage doc="privacy" />} />
        <Route path="/terms" element={<LegalPage doc="terms" />} />
        <Route path="/:slug" element={<SeoLandingPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </MemoryRouter>,
  )
}
