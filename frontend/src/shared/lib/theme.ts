/**
 * Keeps the `data-theme` attribute on <html> in sync with the ambient colour
 * scheme. Tokens in `src/styles/tokens.css` key off that attribute, so this is
 * the only place the app decides whether it is light or dark.
 *
 * The initial value is set by the inline script in index.html (before paint);
 * this module only handles changes that happen while the app is open.
 */

import { getTelegramWebApp } from '@/shared/lib/telegram'

export type ThemeMode = 'light' | 'dark'

const DARK_QUERY = '(prefers-color-scheme: dark)'

/** Telegram wins when the app runs inside it; the OS preference is the fallback. */
function resolveThemeMode(): ThemeMode {
  const telegram = getTelegramWebApp()

  if (telegram) return telegram.colorScheme === 'dark' ? 'dark' : 'light'

  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'
}

function applyThemeMode(mode: ThemeMode): void {
  document.documentElement.dataset.theme = mode
}

/**
 * Applies the current mode and subscribes to changes. Returns an unsubscribe
 * function; call it once from the app entry point.
 */
export function initTheme(): () => void {
  applyThemeMode(resolveThemeMode())

  const sync = () => applyThemeMode(resolveThemeMode())

  const telegram = getTelegramWebApp()
  telegram?.onEvent('themeChanged', sync)

  // Also watched outside Telegram, where the OS preference is the only signal.
  const media = window.matchMedia(DARK_QUERY)
  media.addEventListener('change', sync)

  return () => {
    telegram?.offEvent('themeChanged', sync)
    media.removeEventListener('change', sync)
  }
}
