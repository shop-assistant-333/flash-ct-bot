import { useMutation, useQueryClient } from '@tanstack/react-query'

import { adminSubjectsKeys } from '@/features/admin-subjects'

import { deleteLesson } from '../api/admin-lessons-api'
import { adminLessonsKeys } from '../api/admin-lessons-keys'

export function useDeleteLesson(lessonId: number, subjectId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteLesson(lessonId),
    onSuccess: () => {
      // The screen navigates away from the lesson, so its detail is dropped
      // rather than refetched — a refetch would only get a 404.
      queryClient.removeQueries({ queryKey: adminLessonsKeys.detail(lessonId) })
      void queryClient.invalidateQueries({ queryKey: adminLessonsKeys.list(subjectId) })
      void queryClient.invalidateQueries({ queryKey: adminSubjectsKeys.all })
    },
  })
}
