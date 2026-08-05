import { http } from '@/shared/api'
import type { AdminQuestionDto, QuestionType } from '@/shared/api'

export interface AnswerOptionRequest {
  /** Absent for a new option; the backend creates it. */
  id?: number
  text: string
  correct: boolean
}

export interface QuestionRequest {
  lessonId?: number
  subjectId?: number
  title: string
  type: QuestionType
  /** Without it the question goes to the end of its list. */
  order?: number
  correctAnswer?: string
  explanation?: string
  options?: AnswerOptionRequest[]
}

export function fetchAdminQuestion(
  questionId: number,
  signal: AbortSignal,
): Promise<AdminQuestionDto> {
  return http.get<AdminQuestionDto>(`/admin/questions/${questionId}`, { signal })
}

/** Questions attached to the subject itself: they show up only in practice. */
export function fetchPracticeQuestions(
  subjectId: number,
  signal: AbortSignal,
): Promise<AdminQuestionDto[]> {
  return http.get<AdminQuestionDto[]>(`/admin/subjects/${subjectId}/practice-questions`, { signal })
}

export function createQuestion(body: QuestionRequest): Promise<AdminQuestionDto> {
  return http.post<AdminQuestionDto>('/admin/questions', { json: body })
}

/**
 * Replaces the question together with its whole set of options: options with an
 * `id` are updated, ones without are created, and the missing ones are deleted —
 * so the request always carries the full current list.
 */
export function updateQuestion(
  questionId: number,
  body: QuestionRequest,
): Promise<AdminQuestionDto> {
  return http.put<AdminQuestionDto>(`/admin/questions/${questionId}`, { json: body })
}

export function deleteQuestion(questionId: number): Promise<void> {
  return http.delete<void>(`/admin/questions/${questionId}`)
}
