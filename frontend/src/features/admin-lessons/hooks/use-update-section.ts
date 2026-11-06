import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateSection } from '../api/admin-lessons-api'
import { adminLessonsKeys } from '../api/admin-lessons-keys'

export function useUpdateSection(sectionId: number, subjectId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (title: string) => updateSection(sectionId, { subjectId, title }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminLessonsKeys.sections(subjectId) })
    },
  })
}
