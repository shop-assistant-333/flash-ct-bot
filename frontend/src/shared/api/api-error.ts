/** Error codes the backend returns; see backend/API.md. Branch on `code`, never on `message`. */
export const API_ERROR_CODES = [
  'UNAUTHORIZED',
  'FORBIDDEN',
  'SUBSCRIPTION_EXPIRED',
  'LESSON_LOCKED',
  'NOT_FOUND',
  'VALIDATION_FAILED',
  'BAD_REQUEST',
  'ATTEMPT_ALREADY_COMPLETED',
  'QUESTION_ALREADY_ANSWERED',
  'ATTEMPT_INCOMPLETE',
  'PRACTICE_DECK_EMPTY',
  'PREDICTION_UNAVAILABLE',
  'INTERNAL_ERROR',
] as const

export type ApiErrorCode = (typeof API_ERROR_CODES)[number]

/** Error payload shared by every non-2xx response. */
export interface ApiErrorBody {
  code: string
  message: string
  timestamp: string
  /** Present only for VALIDATION_FAILED: field name -> message. */
  fields?: Record<string, string>
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly fields: Record<string, string> | undefined

  constructor(status: number, body: ApiErrorBody) {
    super(body.message)
    this.name = 'ApiError'
    this.status = status
    this.code = body.code
    this.fields = body.fields
  }

  is(code: ApiErrorCode): boolean {
    return this.code === code
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}
