import { Clock, Flame, Target } from 'lucide-react'

import { formatMinutes } from '@/shared/lib/format-duration'

import type { UserActivityItem } from '../api/admin-users-api'

interface UserActivityCardProps {
  activity: UserActivityItem
}

/** Read-only, like the progress block: these numbers are earned, not edited. */
export function UserActivityCard({ activity }: UserActivityCardProps) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-medium text-muted">Активность</h2>

      <ul className="grid grid-cols-3 gap-2">
        <li className="flex flex-col gap-1 rounded-card bg-surface p-3 shadow-card">
          <span className="flex items-center gap-1.5 text-xs text-muted">
            <Flame aria-hidden className="size-4 shrink-0" />
            Стрик
          </span>
          <span className="text-xl font-semibold text-fg tabular-nums">{activity.streak.best}</span>
          <span className="text-xs text-subtle tabular-nums">сейчас {activity.streak.current}</span>
        </li>

        <li className="flex flex-col gap-1 rounded-card bg-surface p-3 shadow-card">
          <span className="flex items-center gap-1.5 text-xs text-muted">
            <Clock aria-hidden className="size-4 shrink-0" />В приложении
          </span>
          <span className="text-xl font-semibold text-fg tabular-nums">
            {formatMinutes(activity.timeSpentMinutes)}
          </span>
          <span className="text-xs text-subtle">за всё время</span>
        </li>

        <li className="flex flex-col gap-1 rounded-card bg-surface p-3 shadow-card">
          <span className="flex items-center gap-1.5 text-xs text-muted">
            <Target aria-hidden className="size-4 shrink-0" />
            Точность
          </span>
          <span className="text-xl font-semibold text-fg tabular-nums">
            {activity.accuracyPercent}%
          </span>
          <span className="text-xs text-subtle tabular-nums">
            {activity.correct} из {activity.answered}
          </span>
        </li>
      </ul>
    </section>
  )
}
