import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createSection } from '../api/admin-lessons-api'
import { adminLessonsKeys } from '../api/admin-lessons-keys'

export function useCreateSection(subjectId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (title: string) => createSection({ subjectId, title }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminLessonsKeys.sections(subjectId) })
    },
  })
}
