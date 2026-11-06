import { useMutation, useQueryClient } from '@tanstack/react-query'

import { reorderSubjectSections } from '../api/admin-lessons-api'
import { adminLessonsKeys } from '../api/admin-lessons-keys'

export function useReorderSections(subjectId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: number[]) => reorderSubjectSections(subjectId, { ids }),
    onSuccess: (sections) => {
      // Seeded for the same reason as in `useReorderLessons`.
      queryClient.setQueryData(adminLessonsKeys.sections(subjectId), sections)
      void queryClient.invalidateQueries({ queryKey: adminLessonsKeys.sections(subjectId) })
      // The server renumbers lessons under the new topic order.
      void queryClient.invalidateQueries({ queryKey: adminLessonsKeys.list(subjectId) })
    },
  })
}
