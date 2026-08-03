import { http } from '@/shared/api'

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
  options: AnswerOptionDto[]
}

export interface StreakDto {
  current: number
  best: number
}

export interface PracticeQuestionDto {
  subjectId: number
  question: QuestionDto
  streak: StreakDto
  position: number
  deckSize: number
}

export interface SubmitPracticeAnswerRequest {
  questionId: number
  selectedOptionIds?: number[]
  answerText?: string
}

export interface AnswerResultDto {
  questionId: number
  correct: boolean
  correctOptionIds: number[]
  correctAnswer: string | null
  explanation: string
  lastQuestion: boolean
}

export interface PracticeAnswerResultDto {
  result: AnswerResultDto
  streak: StreakDto
}

export function fetchNextPracticeQuestion(
  subjectId: number,
  signal: AbortSignal,
): Promise<PracticeQuestionDto> {
  return http.get<PracticeQuestionDto>('/practice/next', { query: { subjectId }, signal })
}

export function submitPracticeAnswer(
  subjectId: number,
  body: SubmitPracticeAnswerRequest,
): Promise<PracticeAnswerResultDto> {
  return http.post<PracticeAnswerResultDto>('/practice/answer', {
    query: { subjectId },
    json: body,
  })
}
