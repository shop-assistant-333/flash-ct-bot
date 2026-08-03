import { useQueryClient } from '@tanstack/react-query'

import { practiceKeys } from '../api/practice-keys'

/** Refetches the "current" question — call once the feedback panel is dismissed. */
export function useAdvancePractice(subjectId: number) {
  const queryClient = useQueryClient()

  return () => {
    void queryClient.invalidateQueries({ queryKey: practiceKeys.next(subjectId) })
  }
}
