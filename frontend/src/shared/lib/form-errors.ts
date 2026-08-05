import { isApiError } from '@/shared/api'

/**
 * Per-field messages of a failed backend validation, ready to hand to the
 * `error` prop of a field. Any other failure yields `{}` — the screen shows it
 * as a whole-form error instead.
 */
export function fieldErrors(error: unknown): Record<string, string> {
  if (isApiError(error) && error.is('VALIDATION_FAILED')) {
    return error.fields ?? {}
  }

  return {}
}

/**
 * `exactOptionalPropertyTypes` forbids handing an explicit `undefined` to an
 * optional prop, so a field without a message gets no `error` key at all.
 */
export function errorProp(message: string | undefined): { error?: string } {
  return message === undefined || message === '' ? {} : { error: message }
}
