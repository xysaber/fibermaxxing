import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource-variable/inter'
import '@fontsource-variable/bricolage-grotesque'
import './index.css'
import App from './App.tsx'
import { syncMealLogTestFlagFromUrl } from './lib/mealLog'
import { loadSeoPage } from './content/seoPages'

syncMealLogTestFlagFromUrl()

function render() {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  )
}

// Long-tail guide pages are code-split; fetch this route's chunk before the first
// render so the prerendered HTML is replaced by the same content, not a blank state.
const slug = window.location.pathname.replace(/^\/+|\/+$/g, '')
loadSeoPage(slug).catch(() => undefined).finally(render)
