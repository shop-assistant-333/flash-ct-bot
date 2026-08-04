import { useQuery } from '@tanstack/react-query'

import { fetchAdminQuestion } from '../api/admin-questions-api'
import { adminQuestionsKeys } from '../api/admin-questions-keys'

export function useAdminQuestion(questionId: number) {
  return useQuery({
    queryKey: adminQuestionsKeys.detail(questionId),
    queryFn: ({ signal }) => fetchAdminQuestion(questionId, signal),
  })
}
