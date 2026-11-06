import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateLesson, type LessonDraft } from '../api/admin-lessons-api'
import { adminLessonsKeys } from '../api/admin-lessons-keys'
import { toLessonRequest } from '../lib/lesson-request'

export function useUpdateLesson(lessonId: number, subjectId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (draft: LessonDraft) => updateLesson(lessonId, toLessonRequest(subjectId, draft)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminLessonsKeys.detail(lessonId) })
      // The title is shown in the subject's lesson list too, and a new topic moves it there.
      void queryClient.invalidateQueries({ queryKey: adminLessonsKeys.list(subjectId) })
    },
  })
}
