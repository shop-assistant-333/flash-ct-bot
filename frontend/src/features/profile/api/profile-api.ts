import { http } from '@/shared/api'
import type { SubscriptionItem, UserRole } from '@/shared/api'

export interface ProfileDto {
  id: number
  tgId: string
  username: string
  firstName: string
  lastName: string
  role: UserRole
  subscriptions: SubscriptionItem[]
}

export function fetchProfile(signal: AbortSignal): Promise<ProfileDto> {
  return http.get<ProfileDto>('/profile', { signal })
}
