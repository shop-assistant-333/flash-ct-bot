import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateQuestion, type QuestionRequest } from '../api/admin-questions-api'
import { invalidateQuestionCaches } from '../lib/invalidate-questions'

export function useUpdateQuestion(questionId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: QuestionRequest) => updateQuestion(questionId, body),
    onSuccess: () => {
      invalidateQuestionCaches(queryClient)
    },
  })
}
