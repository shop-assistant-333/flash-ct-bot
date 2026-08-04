import { useQuery } from '@tanstack/react-query'

import { fetchStats } from '../api/stats-api'
import { statsKeys } from '../api/stats-keys'

/**
 * Стрик и счётчики меняются в других разделах (практика), которые не могут
 * инвалидировать кэш этой фичи напрямую — поэтому здесь запрос всегда
 * идёт в сеть заново, а не полагается на общий `staleTime`.
 */
export function useStats(subjectId: number) {
  return useQuery({
    queryKey: statsKeys.summary(subjectId),
    queryFn: ({ signal }) => fetchStats(subjectId, signal),
    refetchOnMount: 'always',
  })
}
