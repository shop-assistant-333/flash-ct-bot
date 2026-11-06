import { http } from '@/shared/api'
import type {
  AnswerResultDto,
  LessonKind,
  LocalDateTime,
  QuestionDto,
  SubmitAnswerRequest,
} from '@/shared/api'

export type LessonStatus = 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED'

/** A topic of the programme; lessons point to it by `sectionId`. */
export interface SectionItem {
  id: number
  title: string
  order: number
}

export interface LessonItem {
  id: number
  title: string
  description: string
  /** Canonical across the subject: topics in order, lessons, the topic's test, then the rest. */
  order: number
  kind: LessonKind
  /** Null — the lesson sits outside every topic. */
  sectionId: number | null
  /** When the lesson opens; null while the teacher has not scheduled it. */
  opensAt: LocalDateTime | null
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
  opensAt: LocalDateTime | null
  kind: LessonKind
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
}

export function fetchLessons(subjectId: number, signal: AbortSignal): Promise<LessonItem[]> {
  return http.get<LessonItem[]>('/lessons', { query: { subjectId }, signal })
}

/** Topics of the subject in their order, empty ones included. */
export function fetchSections(subjectId: number, signal: AbortSignal): Promise<SectionItem[]> {
  return http.get<SectionItem[]>('/sections', { query: { subjectId }, signal })
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
