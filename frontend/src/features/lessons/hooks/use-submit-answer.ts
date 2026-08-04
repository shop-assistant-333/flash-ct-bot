import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { SubmitAnswerRequest } from '@/shared/api'

import { submitAnswer } from '../api/lessons-api'
import { lessonsKeys } from '../api/lessons-keys'

/**
 * Saves one answer. The attempt is refetched right away — the cursor moved
 * server-side — while the screen keeps showing this question's verdict until the
 * student asks for the next one. By then the fresh attempt has arrived.
 */
export function useSubmitAnswer(lessonId: number, attemptId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: SubmitAnswerRequest) => submitAnswer(attemptId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: lessonsKeys.attempt(lessonId) })
    },
  })
}
