import { useQuery } from '@tanstack/react-query'

import { fetchSections } from '../api/lessons-api'
import { lessonsKeys } from '../api/lessons-keys'

export function useSections(subjectId: number) {
  return useQuery({
    queryKey: lessonsKeys.sections(subjectId),
    queryFn: ({ signal }) => fetchSections(subjectId, signal),
  })
}
