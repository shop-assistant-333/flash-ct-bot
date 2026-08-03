import { TriangleAlert } from 'lucide-react'
import { isRouteErrorResponse, useRouteError } from 'react-router'

import { isApiError } from '@/shared/api'

function describe(error: unknown): string {
  if (isApiError(error)) return error.message
  if (isRouteErrorResponse(error)) return `${error.status} ${error.statusText}`
  if (error instanceof Error) return error.message
  return 'Неизвестная ошибка'
}

/** Rendered by the router when a route throws — see `errorElement` in router.tsx. */
export function ErrorScreen() {
  const error = useRouteError()

  return (
    <section className="flex flex-col items-center gap-4 text-center">
      <TriangleAlert aria-hidden className="size-8 text-danger" />
      <h1 className="text-xl font-semibold text-danger">Что-то пошло не так</h1>
      <p className="text-muted">{describe(error)}</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-xl bg-accent px-4 py-2 text-accent-fg disabled:cursor-not-allowed disabled:opacity-50"
      >
        Обновить
      </button>
    </section>
  )
}
