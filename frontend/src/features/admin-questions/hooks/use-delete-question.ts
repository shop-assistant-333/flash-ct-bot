import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteQuestion } from '../api/admin-questions-api'
import { invalidateQuestionCaches } from '../lib/invalidate-questions'

export function useDeleteQuestion(questionId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteQuestion(questionId),
    onSuccess: () => {
      invalidateQuestionCaches(queryClient)
    },
  })
}
