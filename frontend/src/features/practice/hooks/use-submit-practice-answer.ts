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
 *
 * The verdict itself is written to `practiceKeys.answer` (read via
 * `usePracticeAnswer`) rather than kept only on the mutation instance: the
 * mutation resets on remount (e.g. switching tabs and back), but the query
 * cache doesn't, so the deck can still tell "already answered" apart from
 * "fresh question" after a remount.
 */
export function useSubmitPracticeAnswer(subjectId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: SubmitAnswerRequest) => submitPracticeAnswer(subjectId, body),
    onSuccess: (data) => {
      queryClient.setQueryData(practiceKeys.next(subjectId), (current) =>
        current === undefined ? current : { ...current, streak: data.streak },
      )
      queryClient.setQueryData(practiceKeys.answer(subjectId), data)
    },
  })
}
