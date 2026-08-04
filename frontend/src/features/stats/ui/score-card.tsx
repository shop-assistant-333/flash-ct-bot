import { LoaderCircle, Sparkles } from 'lucide-react'

import { ProgressBar } from '@/shared/ui/progress-bar'

import { usePrediction } from '../hooks/use-prediction'
import { formatRelativeTime } from '../lib/format'

interface ScoreCardProps {
  subjectId: number
}

interface RetryNoticeProps {
  message: string
  onRetry: () => void
}

function RetryNotice({ message, onRetry }: RetryNoticeProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm text-muted">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="min-h-11 shrink-0 rounded-control border border-border bg-surface px-3 text-sm font-semibold text-fg transition-colors duration-150 active:bg-surface-sunken"
      >
        Повторить
      </button>
    </div>
  )
}

/** Прогнозируемый балл — главная цифра экрана. Считает LLM на бэкенде, см. AI_SCORE_PREDICTION.md. */
export function ScoreCard({ subjectId }: ScoreCardProps) {
  const { data, isPending, isError, pollExhausted, refetch } = usePrediction(subjectId)

  const isColdStart = data !== undefined && data.pending && data.computedAt === null
  const showSkeleton = (isPending || isColdStart) && !pollExhausted
  const isUnavailable = pollExhausted && data?.computedAt === null

  return (
    <article className="flex flex-col gap-3 rounded-card bg-surface p-4 shadow-card">
      <h2 className="flex items-center gap-2 text-sm font-medium text-muted">
        <Sparkles aria-hidden className="size-4 text-primary" />
        Прогнозируемый балл
      </h2>

      {isError ? (
        <RetryNotice message="Не удалось загрузить прогноз балла." onRetry={() => void refetch()} />
      ) : showSkeleton ? (
        <div className="flex animate-pulse flex-col gap-3">
          <div className="h-9 w-24 rounded-control bg-surface-sunken" />
          <div className="h-1 w-full rounded-full bg-surface-sunken" />
          <div className="h-4 w-2/3 rounded-control bg-surface-sunken" />
        </div>
      ) : isUnavailable ? (
        <RetryNotice
          message="Прогноз временно недоступен, попробуйте позже."
          onRetry={() => void refetch()}
        />
      ) : data ? (
        <>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-fg tabular-nums">{data.score ?? '—'}</span>
            <span className="text-sm text-muted">из 100</span>
            {data.pending && !pollExhausted ? (
              <span className="flex items-center gap-1 text-xs text-muted">
                <LoaderCircle aria-hidden className="size-3 animate-spin" />
                обновляется
              </span>
            ) : null}
          </div>

          {data.score === null ? null : (
            <ProgressBar value={data.score} max={100} label="Прогнозируемый балл" />
          )}

          <p className="text-sm text-muted">{data.comment}</p>

          {data.computedAt === null ? null : (
            <p className="text-xs text-subtle">
              Оценка ИИ по результатам домашних заданий за последний месяц. Обновлено{' '}
              {formatRelativeTime(data.computedAt)}
            </p>
          )}
        </>
      ) : null}

      {!data && (
        <p className="text-xs text-subtle">
          Оценка ИИ по результатам домашних заданий за последний месяц.
        </p>
      )}
    </article>
  )
}
