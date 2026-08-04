import { http } from '@/shared/api'

export interface SubjectDto {
  id: number
  name: string
  lessonsCount: number
  practiceOnlyQuestionsCount: number
}

export function fetchAdminSubjects(signal: AbortSignal): Promise<SubjectDto[]> {
  return http.get<SubjectDto[]>('/admin/subjects', { signal })
}
