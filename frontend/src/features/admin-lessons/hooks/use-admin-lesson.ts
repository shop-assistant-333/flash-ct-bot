import { skipToken, useQuery } from '@tanstack/react-query'

import { fetchAdminLesson } from '../api/admin-lessons-api'
import { adminLessonsKeys } from '../api/admin-lessons-keys'

/** `lessonId` may be unknown yet — a question page learns it from the question. */
export function useAdminLesson(lessonId: number | undefined) {
  return useQuery({
    queryKey: adminLessonsKeys.detail(lessonId),
    queryFn:
      lessonId === undefined ? skipToken : ({ signal }) => fetchAdminLesson(lessonId, signal),
  })
}
