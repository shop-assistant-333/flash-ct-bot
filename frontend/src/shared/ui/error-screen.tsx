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
    <section className="error-screen">
      <h1>Что-то пошло не так</h1>
      <p>{describe(error)}</p>
      <button type="button" onClick={() => window.location.reload()}>
        Обновить
      </button>
    </section>
  )
}
