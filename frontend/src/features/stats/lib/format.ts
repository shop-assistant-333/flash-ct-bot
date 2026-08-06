/** «задание / задания / заданий» — счётчики видны пользователю, склонение обязательно. */
export function pluralize(count: number, one: string, few: string, many: string): string {
  const mod100 = Math.abs(count) % 100
  const mod10 = mod100 % 10

  if (mod100 >= 11 && mod100 <= 14) return many
  if (mod10 === 1) return one
  if (mod10 >= 2 && mod10 <= 4) return few
  return many
}

const MINUTE_MS = 60_000
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS

/** ISO LocalDateTime → «5 минут назад» / «2 часа назад» / «3 дня назад». */
export function formatRelativeTime(isoDateTime: string): string {
  const diffMs = Date.now() - new Date(isoDateTime).getTime()

  if (diffMs < MINUTE_MS) return 'только что'

  if (diffMs < HOUR_MS) {
    const minutes = Math.floor(diffMs / MINUTE_MS)
    return `${minutes} ${pluralize(minutes, 'минуту', 'минуты', 'минут')} назад`
  }

  if (diffMs < DAY_MS) {
    const hours = Math.floor(diffMs / HOUR_MS)
    return `${hours} ${pluralize(hours, 'час', 'часа', 'часов')} назад`
  }

  const days = Math.floor(diffMs / DAY_MS)
  return `${days} ${pluralize(days, 'день', 'дня', 'дней')} назад`
}
