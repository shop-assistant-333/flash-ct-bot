import { http } from '@/shared/api'

export interface SubjectDto {
  id: number
  name: string
  lessonsCount: number
  practiceOnlyQuestionsCount: number
}

export interface SubjectRequest {
  name: string
}

export function fetchAdminSubjects(signal: AbortSignal): Promise<SubjectDto[]> {
  return http.get<SubjectDto[]>('/admin/subjects', { signal })
}

export function createSubject(body: SubjectRequest): Promise<SubjectDto> {
  return http.post<SubjectDto>('/admin/subjects', { json: body })
}

export function updateSubject(subjectId: number, body: SubjectRequest): Promise<SubjectDto> {
  return http.put<SubjectDto>(`/admin/subjects/${subjectId}`, { json: body })
}

/** Takes the lessons and the questions of the subject down with it. */
export function deleteSubject(subjectId: number): Promise<void> {
  return http.delete<void>(`/admin/subjects/${subjectId}`)
}
