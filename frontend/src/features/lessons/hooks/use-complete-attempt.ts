import { useMutation, useQueryClient } from '@tanstack/react-query'

import { completeAttempt } from '../api/lessons-api'
import { lessonsKeys } from '../api/lessons-keys'

/**
 * Finishes the lesson. Invalidates the whole feature: completion both closes this
 * attempt and unlocks the next lesson, so every list is stale afterwards.
 */
export function useCompleteAttempt(attemptId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => completeAttempt(attemptId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: lessonsKeys.all })
    },
  })
}
