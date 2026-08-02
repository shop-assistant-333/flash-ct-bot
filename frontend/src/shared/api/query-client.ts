import { QueryClient } from '@tanstack/react-query'

import { isApiError } from './api-error'

/**
 * Defaults tuned for a Telegram mini-app: data is cheap to refetch on focus,
 * but retrying a 4xx only wastes a round trip — the answer will not change.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: (failureCount, error) => {
          if (isApiError(error) && error.status < 500) return false
          return failureCount < 2
        },
        refetchOnWindowFocus: true,
      },
      mutations: {
        retry: false,
      },
    },
  })
}
