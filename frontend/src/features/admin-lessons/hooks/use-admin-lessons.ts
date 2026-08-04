import { useQuery } from '@tanstack/react-query'

import { fetchSubjectLessons } from '../api/admin-lessons-api'
import { adminLessonsKeys } from '../api/admin-lessons-keys'

export function useAdminLessons(subjectId: number) {
  return useQuery({
    queryKey: adminLessonsKeys.list(subjectId),
    queryFn: ({ signal }) => fetchSubjectLessons(subjectId, signal),
  })
}
