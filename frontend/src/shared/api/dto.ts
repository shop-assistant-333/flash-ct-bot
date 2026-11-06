/**
 * DTOs shared by more than one feature — copied from the "Модели" section of
 * backend/API.md as is. Feature-local DTOs stay in the feature.
 */

/** ISO local date-time without a zone: "2026-12-31T23:59:59". */
export type LocalDateTime = string

export type UserRole = 'USER' | 'ADMIN' | 'TEACHER'

export interface SubscriptionItem {
  subjectId: number
  subjectName: string
  paidUntil: LocalDateTime
  /** false once the paid period is over. */
  active: boolean
}

/** Envelope of every paginated admin list. */
export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

/** A test is a lesson of another kind: same attempt, same statuses, no statistics. */
export type LessonKind = 'LESSON' | 'TEST'

export type QuestionType = 'SINGLE_ANSWER' | 'MULTI_ANSWER' | 'INPUT'

export interface AnswerOptionDto {
  id: number
  text: string
}

export interface QuestionDto {
  id: number
  title: string
  type: QuestionType
  order: number
  /** Empty for INPUT questions. */
  options: AnswerOptionDto[]
}

/** Unlike the student `AnswerOptionDto`, the admin one carries the verdict. */
export interface AdminAnswerOptionDto {
  id: number
  text: string
  correct: boolean
}

export interface AdminQuestionDto {
  id: number
  /** Exactly one of `lessonId` / `subjectId` is filled — see backend/API.md, "Вопросы". */
  lessonId: number | null
  subjectId: number | null
  title: string
  type: QuestionType
  order: number
  correctAnswer: string | null
  explanation: string
  options: AdminAnswerOptionDto[]
}

/** One of `selectedOptionIds` / `answerText` is filled, depending on the question type. */
export interface SubmitAnswerRequest {
  questionId: number
  selectedOptionIds?: number[]
  answerText?: string
}

/** Practice streak; survives sessions and resets only on a wrong answer. */
export interface StreakDto {
  current: number
  best: number
}

export interface AnswerResultDto {
  questionId: number
  correct: boolean
  /** Empty for INPUT. */
  correctOptionIds: number[]
  /** Null for questions with options. */
  correctAnswer: string | null
  explanation: string
  lastQuestion: boolean
}
