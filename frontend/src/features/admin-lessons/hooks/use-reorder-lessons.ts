import { useMutation, useQueryClient } from '@tanstack/react-query'

import { reorderSubjectLessons } from '../api/admin-lessons-api'
import { adminLessonsKeys } from '../api/admin-lessons-keys'

export function useReorderLessons(subjectId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: number[]) => reorderSubjectLessons(subjectId, { ids }),
    onSuccess: (lessons) => {
      // The endpoint answers with the reordered list, so the cache is seeded
      // with it: without that the list would flash the old order until the
      // refetch below lands.
      queryClient.setQueryData(adminLessonsKeys.list(subjectId), lessons)
      void queryClient.invalidateQueries({ queryKey: adminLessonsKeys.list(subjectId) })
    },
  })
}
