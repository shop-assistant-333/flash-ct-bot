import { env } from '@/shared/config/env'
import { getTelegramInitData } from '@/shared/lib/telegram'

import { ApiError, type ApiErrorBody } from './api-error'

type Query = Record<string, string | number | boolean | undefined | null>

interface RequestOptions extends Omit<RequestInit, 'body'> {
  /** Serialised as JSON. Use `RequestInit.body` directly for anything else. */
  json?: unknown
  query?: Query
}

function buildUrl(path: string, query?: Query): string {
  const url = `${env.apiBaseUrl}${path}`

  if (!query) return url

  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) {
      params.append(key, String(value))
    }
  }

  const search = params.toString()
  return search ? `${url}?${search}` : url
}

async function toApiError(response: Response): Promise<ApiError> {
  const fallback: ApiErrorBody = {
    code: 'INTERNAL_ERROR',
    message: response.statusText || 'Request failed',
    timestamp: new Date().toISOString(),
  }

  try {
    const body = (await response.json()) as Partial<ApiErrorBody>
    return new ApiError(response.status, { ...fallback, ...body })
  } catch {
    return new ApiError(response.status, fallback)
  }
}

/**
 * Single entry point for backend calls. Attaches the Telegram auth header,
 * unwraps JSON and turns every non-2xx response into an {@link ApiError}.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { json, query, headers, ...init } = options

  const response = await fetch(buildUrl(path, query), {
    ...init,
    headers: {
      Accept: 'application/json',
      'X-Telegram-Init-Data': getTelegramInitData(),
      ...(json === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
    ...(json === undefined ? {} : { body: JSON.stringify(json) }),
  })

  if (!response.ok) {
    throw await toApiError(response)
  }

  // 204 and other empty bodies.
  if (response.status === 204 || response.headers.get('Content-Length') === '0') {
    return undefined as T
  }

  return (await response.json()) as T
}

export const http = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST' }),
  put: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT' }),
  patch: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH' }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
} as const
