import { http } from '@/shared/api'
import type { AdminQuestionDto, LessonKind, LocalDateTime } from '@/shared/api'

export interface AdminLessonItem {
  id: number
  subjectId: number
  title: string
  description: string
  order: number
  /** When the lesson opens for the students; null while it is not scheduled. */
  opensAt: LocalDateTime | null
  questionCount: number
  kind: LessonKind
  /** Null — the lesson sits outside every topic. */
  sectionId: number | null
}

export interface AdminLessonDto {
  id: number
  subjectId: number
  title: string
  description: string
  order: number
  opensAt: LocalDateTime | null
  questions: AdminQuestionDto[]
  kind: LessonKind
  sectionId: number | null
}

export interface LessonRequest {
  subjectId: number
  title: string
  description?: string
  /** Left out by the forms: without it the lesson goes to the end of its topic. */
  order?: number
  /** Always sent: null takes the date away and locks the lesson again. */
  opensAt: LocalDateTime | null
  /** Sent on create only: on update a missing kind leaves it as it is. */
  kind?: LessonKind
  /** Written as sent: a missing key takes the lesson out of its topic. */
  sectionId?: number
}

/** The part of `LessonRequest` a form owns; `subjectId` comes from the route. */
export interface LessonDraft {
  title: string
  description: string
  opensAt: LocalDateTime | null
  /** Null — «Без темы». */
  sectionId: number | null
}

export interface AdminSectionItem {
  id: number
  subjectId: number
  title: string
  order: number
}

export interface SectionRequest {
  subjectId: number
  title: string
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

export function fetchSubjectSections(
  subjectId: number,
  signal: AbortSignal,
): Promise<AdminSectionItem[]> {
  return http.get<AdminSectionItem[]>(`/admin/subjects/${subjectId}/sections`, { signal })
}

/** The lessons are renumbered after it, so the lesson list goes stale too. */
export function reorderSubjectSections(
  subjectId: number,
  body: ReorderRequest,
): Promise<AdminSectionItem[]> {
  return http.put<AdminSectionItem[]>(`/admin/subjects/${subjectId}/sections/order`, {
    json: body,
  })
}

export function createSection(body: SectionRequest): Promise<AdminSectionItem> {
  return http.post<AdminSectionItem>('/admin/sections', { json: body })
}

export function updateSection(sectionId: number, body: SectionRequest): Promise<AdminSectionItem> {
  return http.put<AdminSectionItem>(`/admin/sections/${sectionId}`, { json: body })
}

/** Removes the topic only: its lessons and test move out to «без темы». */
export function deleteSection(sectionId: number): Promise<void> {
  return http.delete<void>(`/admin/sections/${sectionId}`)
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
