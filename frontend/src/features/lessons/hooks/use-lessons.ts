import { useQuery } from '@tanstack/react-query'

import { fetchLessons } from '../api/lessons-api'
import { lessonsKeys } from '../api/lessons-keys'

export function useLessons(subjectId: number) {
  return useQuery({
    queryKey: lessonsKeys.list(subjectId),
    queryFn: ({ signal }) => fetchLessons(subjectId, signal),
  })
}
