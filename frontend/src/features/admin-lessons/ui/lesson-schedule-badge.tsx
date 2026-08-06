import { CalendarOff, Check, Clock } from 'lucide-react'

import type { LocalDateTime } from '@/shared/api'
import { formatDateTime } from '@/shared/lib/local-date-time'

interface LessonScheduleBadgeProps {
  opensAt: LocalDateTime | null
}

const BADGE = 'inline-flex items-center gap-1 rounded-control px-2 py-0.5 text-xs font-medium'

/**
 * Открыт урок или нет — при 70+ уроках это должно читаться прямо из списка.
 * Урок без даты помечается отдельно: это не «закрыт навсегда», а «забыли назначить».
 */
export function LessonScheduleBadge({ opensAt }: LessonScheduleBadgeProps) {
  if (opensAt === null) {
    return (
      <span className={`${BADGE} bg-warning-soft text-warning-soft-fg`}>
        <CalendarOff aria-hidden className="size-3.5" />
        Не в расписании
      </span>
    )
  }

  if (new Date(opensAt) <= new Date()) {
    return (
      <span className={`${BADGE} bg-success-soft text-success-soft-fg`}>
        <Check aria-hidden className="size-3.5" />
        Открыт
      </span>
    )
  }

  return (
    <span className={`${BADGE} bg-primary-soft text-primary-soft-fg`}>
      <Clock aria-hidden className="size-3.5" />
      {formatDateTime(opensAt)}
    </span>
  )
}
