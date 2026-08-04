import { useState } from 'react'

import { Button } from '@/shared/ui/button'

import type { LessonStatsItem } from '../api/stats-api'

interface TopicAccuracyProps {
  lessons: LessonStatsItem[]
}

/** Сколько тем видно до нажатия «показать все» — экран не должен уезжать в бесконечность. */
const VISIBLE_COUNT = 5

const STRONG_FROM = 80
const WEAK_BELOW = 50

/** Цвет полосы — это состояние темы, поэтому рядом всегда стоит процент цифрами. */
function barClass(accuracyPercent: number): string {
  if (accuracyPercent >= STRONG_FROM) return 'bg-success'
  if (accuracyPercent >= WEAK_BELOW) return 'bg-warning'
  return 'bg-danger'
}

/** Слабые темы сверху, нетронутые — в конце: это список «что подтянуть», а не оглавление. */
function byWeakness(lessons: LessonStatsItem[]): LessonStatsItem[] {
  return lessons.toSorted((left, right) => {
    if (left.total === 0 || right.total === 0) return left.total === 0 ? 1 : -1
    return left.accuracyPercent - right.accuracyPercent
  })
}

export function TopicAccuracy({ lessons }: TopicAccuracyProps) {
  const [expanded, setExpanded] = useState(false)

  const sorted = byWeakness(lessons)
  const visible = expanded ? sorted : sorted.slice(0, VISIBLE_COUNT)
  const solvedAnything = lessons.some((lesson) => lesson.total > 0)

  if (lessons.length === 0) {
    return null
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-medium text-muted">Темы</h2>
        {solvedAnything ? <span className="text-xs text-subtle">слабые сверху</span> : null}
      </div>

      <ul className="flex flex-col gap-3 rounded-card bg-surface p-4 shadow-card">
        {visible.map((lesson) => {
          const started = lesson.total > 0

          return (
            <li key={lesson.lessonId} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate text-sm text-fg">{lesson.title}</span>
                <span className="shrink-0 text-xs text-muted tabular-nums">
                  {started
                    ? `${lesson.correct} / ${lesson.total} · ${lesson.accuracyPercent}%`
                    : 'не начата'}
                </span>
              </div>

              <div
                role="progressbar"
                aria-valuenow={started ? lesson.accuracyPercent : 0}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Точность по теме «${lesson.title}»`}
                className="h-1.5 overflow-hidden rounded-full bg-surface-sunken"
              >
                {started ? (
                  // Инлайн-стиль, как в `ProgressBar`: длина полосы — данные, а не оформление.
                  <div
                    className={`h-full rounded-full ${barClass(lesson.accuracyPercent)}`}
                    style={{ width: `${lesson.accuracyPercent}%` }}
                  />
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>

      {sorted.length > VISIBLE_COUNT ? (
        <Button variant="secondary" onClick={() => setExpanded((value) => !value)}>
          {expanded ? 'Свернуть' : `Показать все (${sorted.length})`}
        </Button>
      ) : null}

      {solvedAnything ? (
        <p className="text-xs text-subtle">
          Ниже {WEAK_BELOW}% — тему стоит повторить, от {STRONG_FROM}% — тема закрыта.
        </p>
      ) : null}
    </section>
  )
}
