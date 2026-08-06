import { http } from '@/shared/api'
import type {
  LocalDateTime,
  PageResponse,
  StreakDto,
  SubscriptionItem,
  UserRole,
} from '@/shared/api'

export interface AdminUserItem {
  id: number
  tgId: string
  username: string
  firstName: string
  lastName: string
  role: UserRole
  subscriptions: SubscriptionItem[]
}

export interface UserProgressItem {
  subjectId: number
  subjectName: string
  /** Last homework handed in; null while the student has not finished any. */
  lastCompletedLessonId: number | null
  lastCompletedLessonTitle: string | null
  lessonsCompleted: number
  lessonsTotal: number
}

export interface UserActivityItem {
  answered: number
  correct: number
  accuracyPercent: number
  timeSpentMinutes: number
  streak: StreakDto
}

export interface AdminUserDto extends AdminUserItem {
  progress: UserProgressItem[]
  activity: UserActivityItem
}

export interface UserRequest {
  username: string
  tgId?: string
  firstName?: string
  lastName?: string
  role?: UserRole
}

export interface SubscriptionRequest {
  paidUntil: LocalDateTime
}

interface UsersPageParams {
  /** Backend matches it against username, name and telegram id. */
  search: string
  page: number
  size: number
}

export function fetchAdminUsers(
  { search, page, size }: UsersPageParams,
  signal: AbortSignal,
): Promise<PageResponse<AdminUserItem>> {
  return http.get<PageResponse<AdminUserItem>>('/admin/users', {
    query: { search: search === '' ? undefined : search, page, size },
    signal,
  })
}

export function fetchAdminUser(userId: number, signal: AbortSignal): Promise<AdminUserDto> {
  return http.get<AdminUserDto>(`/admin/users/${userId}`, { signal })
}

export function createUser(body: UserRequest): Promise<AdminUserDto> {
  return http.post<AdminUserDto>('/admin/users', { json: body })
}

export function updateUser(userId: number, body: UserRequest): Promise<AdminUserDto> {
  return http.put<AdminUserDto>(`/admin/users/${userId}`, { json: body })
}

export function deleteUser(userId: number): Promise<void> {
  return http.delete<void>(`/admin/users/${userId}`)
}

/** Grants access to a subject and extends it — the backend has one call for both. */
export function saveSubscription(
  userId: number,
  subjectId: number,
  body: SubscriptionRequest,
): Promise<SubscriptionItem> {
  return http.put<SubscriptionItem>(`/admin/users/${userId}/subscriptions/${subjectId}`, {
    json: body,
  })
}

export function revokeSubscription(userId: number, subjectId: number): Promise<void> {
  return http.delete<void>(`/admin/users/${userId}/subscriptions/${subjectId}`)
}
