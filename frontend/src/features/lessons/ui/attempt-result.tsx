import { LinkButton } from '@/shared/ui/link-button'

import type { AttemptResultDto } from '../api/lessons-api'

interface AttemptResultProps {
  result: AttemptResultDto
  lessonsHref: string
  /** Address of the lesson this completion unlocked, if there is one. */
  nextLessonHref: string | null
}

function comment(accuracyPercent: number): string {
  if (accuracyPercent === 100) return 'Идеально — ни одной ошибки'
  if (accuracyPercent >= 80) return 'Хороший результат, тема почти закрыта'
  if (accuracyPercent >= 50) return 'Есть над чем поработать — разберите ошибки в практике'
  return 'Стоит вернуться к теории и потренироваться на практике'
}

/** Summary right after the lesson is finished — style guide §6. */
export function AttemptResult({ result, lessonsHref, nextLessonHref }: AttemptResultProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 rounded-card bg-surface p-4 text-center shadow-card">
        <span className="text-3xl font-bold text-fg tabular-nums">{result.accuracyPercent}%</span>
        <span className="text-sm text-muted tabular-nums">
          Правильных ответов: {result.correctCount} из {result.totalCount}
        </span>
        <p className="text-sm text-muted">{comment(result.accuracyPercent)}</p>
      </div>

      {nextLessonHref === null ? (
        <p className="text-center text-sm text-muted">
          Это был последний урок по предмету. Закрепить темы можно на вкладке «Практика».
        </p>
      ) : (
        <LinkButton to={nextLessonHref}>Следующий урок</LinkButton>
      )}

      <LinkButton to={lessonsHref} variant="secondary">
        К списку уроков
      </LinkButton>
    </div>
  )
}
