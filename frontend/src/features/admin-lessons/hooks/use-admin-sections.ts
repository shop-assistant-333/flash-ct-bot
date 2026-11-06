import { useQuery } from '@tanstack/react-query'

import { fetchSubjectSections } from '../api/admin-lessons-api'
import { adminLessonsKeys } from '../api/admin-lessons-keys'

export function useAdminSections(subjectId: number) {
  return useQuery({
    queryKey: adminLessonsKeys.sections(subjectId),
    queryFn: ({ signal }) => fetchSubjectSections(subjectId, signal),
  })
}
