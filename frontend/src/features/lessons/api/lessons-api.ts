import { http } from '@/shared/api'
import type { AnswerResultDto, QuestionDto, SubmitAnswerRequest } from '@/shared/api'

export type LessonStatus = 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED'

export interface LessonItem {
  id: number
  title: string
  description: string
  order: number
  status: LessonStatus
  questionCount: number
  /** Null until the lesson is started. */
  correctAnswers: number | null
}

export interface LessonDto {
  id: number
  subjectId: number
  title: string
  description: string
  order: number
  status: LessonStatus
  questions: QuestionDto[]
}

export interface AnswerDto {
  questionId: number
  selectedOptionIds: number[]
  answerText: string | null
  correct: boolean
  correctOptionIds: number[]
  correctAnswer: string | null
  explanation: string
  answeredAt: string
}

export interface AttemptDto {
  id: number
  lesson: LessonDto
  startedAt: string
  /** Non-null once the lesson is finished: the screen is then read-only. */
  completedAt: string | null
  /** Index into `lesson.questions`; equals their count when everything is answered. */
  currentQuestionIndex: number
  answers: AnswerDto[]
}

export interface AttemptResultDto {
  attemptId: number
  lessonId: number
  correctCount: number
  totalCount: number
  accuracyPercent: number
  completedAt: string
  /** Null if the finished lesson was the last one of the subject. */
  unlockedLessonId: number | null
}

export function fetchLessons(subjectId: number, signal: AbortSignal): Promise<LessonItem[]> {
  return http.get<LessonItem[]>('/lessons', { query: { subjectId }, signal })
}

/**
 * Opens a lesson: creates the attempt or returns the existing one with every
 * answer already given. Idempotent by contract, which is why the screen reads it
 * as a query even though the verb is POST (see API.md, "Вкладка «ДЗ»").
 */
export function openLessonAttempt(lessonId: number, signal: AbortSignal): Promise<AttemptDto> {
  return http.post<AttemptDto>(`/lessons/${lessonId}/attempt`, { signal })
}

export function submitAnswer(
  attemptId: number,
  body: SubmitAnswerRequest,
): Promise<AnswerResultDto> {
  return http.post<AnswerResultDto>(`/attempts/${attemptId}/answers`, { json: body })
}

export function completeAttempt(attemptId: number): Promise<AttemptResultDto> {
  return http.post<AttemptResultDto>(`/attempts/${attemptId}/complete`)
}
