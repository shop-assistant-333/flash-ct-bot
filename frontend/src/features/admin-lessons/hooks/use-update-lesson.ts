import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateLesson, type LessonDraft } from '../api/admin-lessons-api'
import { adminLessonsKeys } from '../api/admin-lessons-keys'

export function useUpdateLesson(lessonId: number, subjectId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (draft: LessonDraft) => updateLesson(lessonId, { subjectId, ...draft }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminLessonsKeys.detail(lessonId) })
      // The title is shown in the subject's lesson list too.
      void queryClient.invalidateQueries({ queryKey: adminLessonsKeys.list(subjectId) })
    },
  })
}
