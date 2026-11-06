import { useMutation, useQueryClient } from '@tanstack/react-query'

import { adminSubjectsKeys } from '@/features/admin-subjects'

import type { LessonKind } from '@/shared/api'

import { createLesson, type LessonDraft } from '../api/admin-lessons-api'
import { adminLessonsKeys } from '../api/admin-lessons-keys'
import { toLessonRequest } from '../lib/lesson-request'

/** A test is created the same way, only with `kind: 'TEST'`. */
export function useCreateLesson(subjectId: number, kind: LessonKind) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (draft: LessonDraft) => createLesson(toLessonRequest(subjectId, draft, kind)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminLessonsKeys.list(subjectId) })
      // `lessonsCount` of the subject changed — it is shown on the subject card.
      void queryClient.invalidateQueries({ queryKey: adminSubjectsKeys.all })
    },
  })
}
