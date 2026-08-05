import { http } from '@/shared/api'
import type { AdminQuestionDto } from '@/shared/api'

export interface AdminLessonItem {
  id: number
  subjectId: number
  title: string
  description: string
  order: number
  questionCount: number
}

export interface AdminLessonDto {
  id: number
  subjectId: number
  title: string
  description: string
  order: number
  questions: AdminQuestionDto[]
}

export interface LessonRequest {
  subjectId: number
  title: string
  description?: string
  /** Left out by the forms: without it the lesson goes to the end of the list. */
  order?: number
}

/** The part of `LessonRequest` a form owns; `subjectId` comes from the route. */
export interface LessonDraft {
  title: string
  description: string
}

export interface ReorderRequest {
  ids: number[]
}

export function fetchSubjectLessons(
  subjectId: number,
  signal: AbortSignal,
): Promise<AdminLessonItem[]> {
  return http.get<AdminLessonItem[]>(`/admin/subjects/${subjectId}/lessons`, { signal })
}

export function reorderSubjectLessons(
  subjectId: number,
  body: ReorderRequest,
): Promise<AdminLessonItem[]> {
  return http.put<AdminLessonItem[]>(`/admin/subjects/${subjectId}/lessons/order`, { json: body })
}

export function fetchAdminLesson(lessonId: number, signal: AbortSignal): Promise<AdminLessonDto> {
  return http.get<AdminLessonDto>(`/admin/lessons/${lessonId}`, { signal })
}

export function createLesson(body: LessonRequest): Promise<AdminLessonDto> {
  return http.post<AdminLessonDto>('/admin/lessons', { json: body })
}

export function updateLesson(lessonId: number, body: LessonRequest): Promise<AdminLessonDto> {
  return http.put<AdminLessonDto>(`/admin/lessons/${lessonId}`, { json: body })
}

export function deleteLesson(lessonId: number): Promise<void> {
  return http.delete<void>(`/admin/lessons/${lessonId}`)
}

export function reorderLessonQuestions(
  lessonId: number,
  body: ReorderRequest,
): Promise<AdminQuestionDto[]> {
  return http.put<AdminQuestionDto[]>(`/admin/lessons/${lessonId}/questions/order`, { json: body })
}
