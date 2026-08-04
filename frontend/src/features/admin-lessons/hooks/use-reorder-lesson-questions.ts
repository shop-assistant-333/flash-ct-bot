import { useMutation, useQueryClient } from '@tanstack/react-query'

import { reorderLessonQuestions, type AdminLessonDto } from '../api/admin-lessons-api'
import { adminLessonsKeys } from '../api/admin-lessons-keys'

export function useReorderLessonQuestions(lessonId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: number[]) => reorderLessonQuestions(lessonId, { ids }),
    onSuccess: (questions) => {
      // Same reason as in `useReorderLessons`: the response already holds the
      // new order, the refetch only confirms it.
      queryClient.setQueryData<AdminLessonDto>(adminLessonsKeys.detail(lessonId), (lesson) =>
        lesson === undefined ? undefined : { ...lesson, questions },
      )
      void queryClient.invalidateQueries({ queryKey: adminLessonsKeys.detail(lessonId) })
    },
  })
}
