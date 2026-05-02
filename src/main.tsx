import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { THEME_STORAGE_KEY, ThemeProvider } from './ThemeProvider.tsx'

function applyStoredThemeEarly() {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY)
    if (v === 'light' || v === 'dark') {
      document.documentElement.setAttribute('data-theme', v)
      document.querySelector('meta[name="theme-color"]')?.setAttribute(
        'content',
        v === 'dark' ? '#141414' : '#f4f4f5',
      )
    }
  } catch {
    /* ignore */
  }
}
applyStoredThemeEarly()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
