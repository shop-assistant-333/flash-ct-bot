import { useQuery } from '@tanstack/react-query'

import { fetchPracticeQuestions } from '../api/admin-questions-api'
import { adminQuestionsKeys } from '../api/admin-questions-keys'

export function usePracticeQuestions(subjectId: number) {
  return useQuery({
    queryKey: adminQuestionsKeys.practiceList(subjectId),
    queryFn: ({ signal }) => fetchPracticeQuestions(subjectId, signal),
  })
}
