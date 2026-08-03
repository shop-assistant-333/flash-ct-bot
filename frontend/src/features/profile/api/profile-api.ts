import { http } from '@/shared/api'

export type UserRole = 'USER' | 'ADMIN'

export interface SubscriptionItem {
  subjectId: number
  subjectName: string
  paidUntil: string
  active: boolean
}

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
