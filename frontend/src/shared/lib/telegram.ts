/**
 * Thin access to the Telegram WebApp SDK injected by the Telegram client.
 * Only the pieces the app actually uses are typed here.
 */

interface TelegramWebApp {
  readonly initData: string
  ready: () => void
  expand: () => void
  onEvent: (event: 'themeChanged' | 'viewportChanged', handler: () => void) => void
  offEvent: (event: 'themeChanged' | 'viewportChanged', handler: () => void) => void
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp }
  }
}

export function getTelegramWebApp(): TelegramWebApp | undefined {
  return window.Telegram?.WebApp
}

/**
 * Raw `initData` string the backend verifies the signature of. Empty outside
 * Telegram (e.g. a plain browser tab) — the backend answers 401 in that case.
 */
export function getTelegramInitData(): string {
  return getTelegramWebApp()?.initData ?? ''
}
