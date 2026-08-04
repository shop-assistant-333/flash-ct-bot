/**
 * DTOs shared by more than one feature — copied from the "Модели" section of
 * backend/API.md as is. Feature-local DTOs stay in the feature.
 */

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
