import { http } from '@/shared/api'
import type { AnswerResultDto, QuestionDto, StreakDto, SubmitAnswerRequest } from '@/shared/api'

export interface PracticeQuestionDto {
  subjectId: number
  question: QuestionDto
  streak: StreakDto
  position: number
  deckSize: number
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
  body: SubmitAnswerRequest,
): Promise<PracticeAnswerResultDto> {
  return http.post<PracticeAnswerResultDto>('/practice/answer', {
    query: { subjectId },
    json: body,
  })
}
