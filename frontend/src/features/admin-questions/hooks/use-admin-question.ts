import { skipToken, useQuery } from '@tanstack/react-query'

import { fetchAdminQuestion } from '../api/admin-questions-api'
import { adminQuestionsKeys } from '../api/admin-questions-keys'

/** `questionId` is undefined while the route holds no valid id — nothing is fetched then. */
export function useAdminQuestion(questionId: number | undefined) {
  return useQuery({
    queryKey: adminQuestionsKeys.detail(questionId),
    queryFn:
      questionId === undefined ? skipToken : ({ signal }) => fetchAdminQuestion(questionId, signal),
  })
}
