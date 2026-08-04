import { useQuery } from '@tanstack/react-query'

import { fetchAdminLesson } from '../api/admin-lessons-api'
import { adminLessonsKeys } from '../api/admin-lessons-keys'

export function useAdminLesson(lessonId: number) {
  return useQuery({
    queryKey: adminLessonsKeys.detail(lessonId),
    queryFn: ({ signal }) => fetchAdminLesson(lessonId, signal),
  })
}
