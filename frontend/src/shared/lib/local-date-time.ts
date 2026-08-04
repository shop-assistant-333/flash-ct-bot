import type { LocalDateTime } from '@/shared/api'

/**
 * End of day: "оплачено до 31 декабря" has to include the 31st itself, so a
 * date picked in the admin panel becomes 23:59:59 of that day, not midnight.
 */
const END_OF_DAY = 'T23:59:59'

/** `'2026-12-31'` (value of `<input type="date">`) → `'2026-12-31T23:59:59'`. */
export function toLocalDateTime(dateInput: string): LocalDateTime {
  return `${dateInput}${END_OF_DAY}`
}

/** `'2026-12-31T23:59:59'` → `'2026-12-31'`, the format `<input type="date">` expects. */
export function toDateInput(value: LocalDateTime): string {
  return value.slice(0, 10)
}
