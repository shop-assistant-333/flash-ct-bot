import { ProgressBar } from '@/shared/ui/progress-bar'

interface LessonsProgressProps {
  completed: number
  total: number
}

/** How far the student is through the subject's programme. */
export function LessonsProgress({ completed, total }: LessonsProgressProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-muted">Пройдено уроков</span>
        <span className="text-sm text-muted tabular-nums">
          {completed} из {total}
        </span>
      </div>
      <ProgressBar value={completed} max={total} label="Прогресс по предмету" />
    </div>
  )
}
