import { http } from '@/shared/api'
import type { ProfileDto } from '@/features/profile'

export interface SessionDto {
  sessionId: number
  startedAt: string
  profile: ProfileDto
}

export function startSession(signal: AbortSignal): Promise<SessionDto> {
  return http.post<SessionDto>('/session/start', { signal })
}

export function sendHeartbeat(): Promise<void> {
  return http.post<void>('/session/heartbeat')
}

/**
 * Fired from a `pagehide` handler, so the request must survive the page
 * unloading — `keepalive` keeps it alive past that point (a plain fetch would
 * be cancelled).
 */
export function endSession(): Promise<void> {
  return http.post<void>('/session/end', { keepalive: true })
}
