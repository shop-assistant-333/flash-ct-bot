import { skipToken, useQuery } from '@tanstack/react-query'

import { practiceKeys } from '../api/practice-keys'
import type { PracticeAnswerResultDto } from '../api/practice-api'

/**
 * Reads the verdict written by `useSubmitPracticeAnswer` without ever fetching:
 * it only exists to survive remounts (e.g. leaving and returning to the tab),
 * where a fresh `useMutation` instance would otherwise forget it.
 */
export function usePracticeAnswer(subjectId: number) {
  return useQuery<PracticeAnswerResultDto>({
    queryKey: practiceKeys.answer(subjectId),
    queryFn: skipToken,
  })
}
