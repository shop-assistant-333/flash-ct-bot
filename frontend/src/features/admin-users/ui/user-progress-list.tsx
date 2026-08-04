import { ProgressBar } from '@/shared/ui/progress-bar'

import type { UserProgressItem } from '../api/admin-users-api'

interface UserProgressListProps {
  progress: UserProgressItem[]
}

/** Read-only: progress is earned by the student, not set by the admin. */
export function UserProgressList({ progress }: UserProgressListProps) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-medium text-muted">Прогресс</h2>

      {progress.length === 0 ? (
        <p className="rounded-card bg-surface p-3 text-sm text-muted shadow-card">
          Ученик ещё не начинал уроки
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {progress.map((item) => (
            <li
              key={item.subjectId}
              className="flex flex-col gap-2 rounded-card bg-surface p-3 shadow-card"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-medium text-fg">{item.subjectName}</span>
                <span className="shrink-0 text-xs text-muted tabular-nums">
                  {item.lessonsCompleted} из {item.lessonsTotal}
                </span>
              </div>
              <ProgressBar
                value={item.lessonsCompleted}
                max={item.lessonsTotal}
                label={`Прогресс по предмету «${item.subjectName}»`}
              />
              <span className="text-xs text-muted">Сейчас: {item.currentLessonTitle}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
