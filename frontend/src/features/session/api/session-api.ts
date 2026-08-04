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

export function heartbeat(signal: AbortSignal): void {
  http.post<SessionDto>('/session/heartbeat', { signal })
}
