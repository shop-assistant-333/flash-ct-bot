import { useQuery } from '@tanstack/react-query'

import { fetchStats } from '../api/stats-api'
import { statsKeys } from '../api/stats-keys'

export function useStats(subjectId: number) {
  return useQuery({
    queryKey: statsKeys.summary(subjectId),
    queryFn: ({ signal }) => fetchStats(subjectId, signal),
  })
}
