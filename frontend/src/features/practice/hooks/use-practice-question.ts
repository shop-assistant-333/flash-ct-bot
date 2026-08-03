import { useQuery } from '@tanstack/react-query'

import { fetchNextPracticeQuestion } from '../api/practice-api'
import { practiceKeys } from '../api/practice-keys'

/** The "current" question in the deck. The cursor only moves on answer, not on read. */
export function usePracticeQuestion(subjectId: number) {
  return useQuery({
    queryKey: practiceKeys.next(subjectId),
    queryFn: ({ signal }) => fetchNextPracticeQuestion(subjectId, signal),
  })
}
