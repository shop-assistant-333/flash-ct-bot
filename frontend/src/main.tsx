import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from '@/app/app'
import { getTelegramWebApp } from '@/shared/lib/telegram'
import { initTheme } from '@/shared/lib/theme'
import '@/styles/index.css'

// Tells the Telegram client the mini-app has painted; no-op in a plain browser.
getTelegramWebApp()?.ready()

// Lives for the whole page lifetime, so the unsubscribe handle is not kept.
initTheme()

const container = document.getElementById('root')

if (!container) {
  throw new Error('Root container #root is missing in index.html')
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
