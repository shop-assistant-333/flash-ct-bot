/**
 * Keeps the `data-theme` attribute on <html> in sync with the ambient colour
 * scheme. Tokens in `src/styles/tokens.css` key off that attribute, so this is
 * the only place the app decides whether it is light or dark.
 *
 * The initial value is set by the inline script in index.html (before paint);
 * this module only handles changes that happen while the app is open.
 *
 * The user can pin a mode (`light`/`dark`) from the profile screen, which is
 * kept in localStorage and wins over the ambient signal. `system` — the
 * default — follows Telegram's `colorScheme`, or the OS preference outside it.
 */

import { useSyncExternalStore } from 'react'

import { getTelegramWebApp } from '@/shared/lib/telegram'

export type ThemeMode = 'light' | 'dark'
export type ThemePreference = ThemeMode | 'system'

const STORAGE_KEY = 'theme-preference'
const DARK_QUERY = '(prefers-color-scheme: dark)'

/** Telegram wins when the app runs inside it; the OS preference is the fallback. */
function resolveSystemMode(): ThemeMode {
  const telegram = getTelegramWebApp()

  if (telegram) return telegram.colorScheme === 'dark' ? 'dark' : 'light'

  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'
}

function readStoredPreference(): ThemePreference {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'light' || stored === 'dark' ? stored : 'system'
}

function resolveMode(preference: ThemePreference): ThemeMode {
  return preference === 'system' ? resolveSystemMode() : preference
}

function applyThemeMode(mode: ThemeMode): void {
  document.documentElement.dataset.theme = mode
}

let currentPreference: ThemePreference = 'system'
const listeners = new Set<() => void>()

function notify(): void {
  listeners.forEach((listener) => {
    listener()
  })
}

/**
 * Applies the current mode and subscribes to changes. Returns an unsubscribe
 * function; call it once from the app entry point.
 */
export function initTheme(): () => void {
  currentPreference = readStoredPreference()
  applyThemeMode(resolveMode(currentPreference))

  // Ambient changes only move the needle while the preference is `system` —
  // a pinned mode must not flip back when Telegram or the OS theme changes.
  const sync = () => {
    if (currentPreference === 'system') applyThemeMode(resolveSystemMode())
  }

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

export function setThemePreference(preference: ThemePreference): void {
  currentPreference = preference

  if (preference === 'system') {
    localStorage.removeItem(STORAGE_KEY)
  } else {
    localStorage.setItem(STORAGE_KEY, preference)
  }

  applyThemeMode(resolveMode(preference))
  notify()
}

function subscribeThemePreference(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getThemePreference(): ThemePreference {
  return currentPreference
}

/** Current pinned/system theme preference, updated by `setThemePreference`. */
export function useThemePreference(): ThemePreference {
  return useSyncExternalStore(subscribeThemePreference, getThemePreference)
}
