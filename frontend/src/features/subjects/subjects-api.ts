import { http } from '@/shared/api'

export interface SubjectItem {
  id: number
  name: string
  paidUntil: string
  active: boolean
  lessonsTotal: number
  lessonsCompleted: number
}

export function fetchSubjects(signal: AbortSignal): Promise<SubjectItem[]> {
  return http.get<SubjectItem[]>('/subjects', { signal })
}
