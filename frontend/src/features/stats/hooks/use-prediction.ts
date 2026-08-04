import { useQuery, useQueryClient } from '@tanstack/react-query'

import { fetchPrediction } from '../api/stats-api'
import { statsKeys } from '../api/stats-keys'

const POLL_INTERVAL_MS = 4_000
/** ~80с — с запасом покрывает холодный расчёт (`AI_TIMEOUT` = 60с на бэкенде). */
const MAX_POLL_ATTEMPTS = 20

/**
 * Бэкенд молча проглатывает ошибку модели и оставляет `pending: true` навсегда, так что
 * поллинг сам себя не остановит — ограничиваем число попыток на фронте, см.
 * AI_SCORE_PREDICTION.md.
 */
export function usePrediction(subjectId: number) {
  const queryClient = useQueryClient()
  const queryKey = statsKeys.prediction(subjectId)

  const query = useQuery({
    queryKey,
    queryFn: ({ signal }) => fetchPrediction(subjectId, signal),
    refetchInterval: (q) =>
      q.state.data?.pending && q.state.dataUpdateCount < MAX_POLL_ATTEMPTS
        ? POLL_INTERVAL_MS
        : false,
  })

  const dataUpdateCount = queryClient.getQueryState(queryKey)?.dataUpdateCount ?? 0
  const pollExhausted = query.data?.pending === true && dataUpdateCount >= MAX_POLL_ATTEMPTS

  return { ...query, pollExhausted }
}
