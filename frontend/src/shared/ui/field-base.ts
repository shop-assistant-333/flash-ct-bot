/**
 * The parts every admin form field shares, so a text field, a textarea and a
 * select cannot drift apart. Text is 16px on purpose: anything smaller makes
 * iOS Safari zoom the whole form in on focus.
 */
const FIELD_CONTROL =
  'w-full rounded-control bg-surface-sunken px-3 py-2.5 text-base text-fg transition-colors duration-150 placeholder:text-subtle'

export const FIELD_LABEL = 'text-sm font-medium text-muted'

export const FIELD_HINT = 'text-xs text-subtle'

export const FIELD_ERROR = 'text-sm text-danger'

export function fieldControlClasses(hasError: boolean): string {
  return `${FIELD_CONTROL} border ${hasError ? 'border-danger' : 'border-transparent'}`
}

/**
 * `aria-describedby` points at the hint, the error, or both — and is left out
 * entirely when there is neither (`exactOptionalPropertyTypes`).
 */
export function describedByProps(ids: (string | undefined)[]): { 'aria-describedby'?: string } {
  const value = ids.filter((id) => id !== undefined).join(' ')
  return value === '' ? {} : { 'aria-describedby': value }
}
