import { QueryClientProvider } from '@tanstack/react-query'
import { lazy, Suspense, useState, type ReactNode } from 'react'

import { createQueryClient } from '@/shared/api'
import { env } from '@/shared/config/env'

// Dev-only: `import.meta.env.DEV` is inlined at build time, so the devtools
// chunk is dropped from the production bundle entirely.
const QueryDevtools = env.isDev
  ? lazy(() =>
      import('@tanstack/react-query-devtools').then((m) => ({ default: m.ReactQueryDevtools })),
    )
  : (_props: { initialIsOpen?: boolean }) => null

interface ProvidersProps {
  children: ReactNode
}

/** Composition root for cross-cutting context. Add new providers here, not in App. */
export function Providers({ children }: ProvidersProps) {
  // Created once per mount instead of at module scope, so tests and StrictMode
  // remounts each get a clean cache.
  const [queryClient] = useState(createQueryClient)

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Suspense>
        <QueryDevtools initialIsOpen={false} />
      </Suspense>
    </QueryClientProvider>
  )
}
