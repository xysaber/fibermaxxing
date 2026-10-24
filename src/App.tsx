import { Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { SeoLandingPage } from './pages/SeoLandingPage'
import './App.css'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/:slug" element={<SeoLandingPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
