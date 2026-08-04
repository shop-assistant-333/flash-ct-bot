import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createQuestion, type QuestionRequest } from '../api/admin-questions-api'
import { invalidateQuestionCaches } from '../lib/invalidate-questions'

export function useCreateQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: QuestionRequest) => createQuestion(body),
    onSuccess: () => {
      invalidateQuestionCaches(queryClient)
    },
  })
}
