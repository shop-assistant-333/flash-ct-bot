import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteSection } from '../api/admin-lessons-api'
import { adminLessonsKeys } from '../api/admin-lessons-keys'

export function useDeleteSection(sectionId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteSection(sectionId),
    onSuccess: () => {
      // The topic's lessons move out to «без темы»: both the list and every
      // cached lesson detail now carry a stale `sectionId`.
      void queryClient.invalidateQueries({ queryKey: adminLessonsKeys.all })
    },
  })
}
