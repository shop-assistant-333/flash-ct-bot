import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

import { endSession, sendHeartbeat, startSession } from '../api/session-api'
import { sessionKeys } from '../api/session-keys'

const HEARTBEAT_INTERVAL_MS = 60_000

/**
 * Time-in-app tracker for the whole app lifetime: opens a session on mount,
 * pings it on a timer, and makes a best-effort `end` call when Telegram tears
 * the WebView down. `pagehide` is the only signal that reliably fires for
 * that in a mobile WebView — `visibilitychange` also fires on a brief app
 * switch to another app, which would close the session too early.
 *
 * Heartbeat/end failures have no screen to surface to, so they're logged
 * instead of thrown; the idle timeout on the backend is the real safety net.
 */
export function useSessionTracking(): void {
  const { isSuccess } = useQuery({
    queryKey: sessionKeys.current(),
    queryFn: ({ signal }) => startSession(signal),
    staleTime: Infinity,
  })

  useEffect(() => {
    if (!isSuccess) return

    const intervalId = window.setInterval(() => {
      sendHeartbeat().catch((error: unknown) => {
        console.error('Session heartbeat failed', error)
      })
    }, HEARTBEAT_INTERVAL_MS)

    const handlePageHide = () => {
      endSession().catch((error: unknown) => {
        console.error('Session end failed', error)
      })
    }
    window.addEventListener('pagehide', handlePageHide)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('pagehide', handlePageHide)
    }
  }, [isSuccess])
}
