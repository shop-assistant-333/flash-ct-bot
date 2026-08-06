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

/**
 * `'2026-09-12T18:00:00'` → `'2026-09-12T18:00'`, the format
 * `<input type="datetime-local">` expects.
 */
export function toDateTimeInput(value: LocalDateTime): string {
  return value.slice(0, 16)
}

/**
 * `'2026-09-12T18:00'` (value of `<input type="datetime-local">`) →
 * `'2026-09-12T18:00:00'`. Seconds are added because the input leaves them out,
 * while the backend expects a full ISO local date-time.
 */
export function fromDateTimeInput(input: string): LocalDateTime {
  return input.length === 16 ? `${input}:00` : input
}

/**
 * `'2026-09-12T18:00:00'` → «12 сентября, 18:00». Год появляется, только когда он
 * не текущий: в пределах учебного года он лишний шум.
 *
 * Зоны в контракте нет, и добавлять её нельзя: даты открытия уроков задаются во
 * времени школы, `new Date` разбирает такую строку как локальную (см. API.md).
 */
export function formatDateTime(value: LocalDateTime): string {
  const date = new Date(value)
  const currentYear = new Date().getFullYear()

  return date.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    ...(date.getFullYear() === currentYear ? {} : { year: 'numeric' }),
    hour: '2-digit',
    minute: '2-digit',
  })
}
