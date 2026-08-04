import { useMutation, useQueryClient } from '@tanstack/react-query'

import { adminSubjectsKeys } from '@/features/admin-subjects'

import { createLesson, type LessonDraft } from '../api/admin-lessons-api'
import { adminLessonsKeys } from '../api/admin-lessons-keys'

export function useCreateLesson(subjectId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (draft: LessonDraft) => createLesson({ subjectId, ...draft }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminLessonsKeys.list(subjectId) })
      // `lessonsCount` of the subject changed — it is shown on the subject card.
      void queryClient.invalidateQueries({ queryKey: adminSubjectsKeys.all })
    },
  })
}
