import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { SubmitAnswerRequest } from '@/shared/api'

import { practiceKeys } from '../api/practice-keys'
import { submitPracticeAnswer } from '../api/practice-api'

/**
 * No question-data invalidation on success: the deck cursor already moved
 * server-side, but the UI keeps showing this question's feedback until the
 * student asks for the next one — see `useAdvancePractice`. The streak is
 * patched into the cached question straight away though, so anything reading
 * that cache (the deck, the header badge) reflects it instantly instead of
 * waiting for the next question to load.
 */
export function useSubmitPracticeAnswer(subjectId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: SubmitAnswerRequest) => submitPracticeAnswer(subjectId, body),
    onSuccess: (data) => {
      queryClient.setQueryData(practiceKeys.next(subjectId), (current) =>
        current === undefined ? current : { ...current, streak: data.streak },
      )
    },
  })
}
