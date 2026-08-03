import { useMutation } from '@tanstack/react-query'

import { submitPracticeAnswer, type SubmitPracticeAnswerRequest } from '../api/practice-api'

/**
 * No cache invalidation on success: the deck cursor already moved server-side,
 * but the UI keeps showing this question's feedback until the student asks for
 * the next one — see `useAdvancePractice`.
 */
export function useSubmitPracticeAnswer(subjectId: number) {
  return useMutation({
    mutationFn: (body: SubmitPracticeAnswerRequest) => submitPracticeAnswer(subjectId, body),
  })
}
