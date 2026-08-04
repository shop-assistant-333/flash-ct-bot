import { Sparkles } from 'lucide-react'

import { ProgressBar } from '@/shared/ui/progress-bar'

import type { StatsDto } from '../api/stats-api'
import { predictScore } from '../lib/score-prediction'

interface ScoreCardProps {
  stats: StatsDto
}

/**
 * Прогнозируемый балл — главная цифра экрана.
 *
 * Значение пока считается на клиенте: см. `lib/score-prediction.ts`. Бейдж «демо» стоит
 * намеренно — показывать выдуманное число как оценку ИИ нельзя.
 */
export function ScoreCard({ stats }: ScoreCardProps) {
  const prediction = predictScore(stats)
  const hasScore = prediction.score !== null

  return (
    <article className="flex flex-col gap-3 rounded-card bg-surface p-4 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-medium text-muted">
          <Sparkles aria-hidden className="size-4 text-primary" />
          Прогнозируемый балл
        </h2>
        <span className="rounded-control bg-warning-soft px-2 py-1 text-xs font-medium text-warning-soft-fg">
          демо
        </span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-fg tabular-nums">
          {hasScore ? prediction.score : '—'}
        </span>
        <span className="text-sm text-muted">из 100</span>
      </div>

      {prediction.score === null ? null : (
        <ProgressBar value={prediction.score} max={100} label="Прогнозируемый балл" />
      )}

      <p className="text-sm text-muted">{prediction.comment}</p>
      <p className="text-xs text-subtle">
        Оценка ИИ по результатам домашних заданий за последний месяц.
      </p>
    </article>
  )
}
