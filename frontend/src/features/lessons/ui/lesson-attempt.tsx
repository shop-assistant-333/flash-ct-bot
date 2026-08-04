import { LockKeyhole, SearchX, WifiOff } from 'lucide-react'
import { useState } from 'react'

import { isApiError } from '@/shared/api'
import { PageHeader } from '@/shared/ui/page-header'
import { Spinner } from '@/shared/ui/spinner'
import { StateMessage } from '@/shared/ui/state-message'

import type { AttemptResultDto } from '../api/lessons-api'
import { useLessonAttempt } from '../hooks/use-lesson-attempt'
import { AttemptResult } from './attempt-result'
import { AttemptReview } from './attempt-review'
import { AttemptRunner } from './attempt-runner'

interface LessonAttemptProps {
  lessonId: number
  lessonsHref: string
  hrefOfLesson: (lessonId: number) => string
}

/** One lesson end to end: solving, the summary right after it, and the later review. */
export function LessonAttempt({ lessonId, lessonsHref, hrefOfLesson }: LessonAttemptProps) {
  const attemptQuery = useLessonAttempt(lessonId)
  // Survives the refetch that follows completion: the summary is a one-off screen
  // and its numbers do not exist anywhere in the attempt itself.
  const [result, setResult] = useState<AttemptResultDto | null>(null)

  if (attemptQuery.isPending) return <Spinner />

  if (attemptQuery.isError) {
    const { error } = attemptQuery

    if (isApiError(error) && error.is('LESSON_LOCKED')) {
      return (
        <StateMessage
          icon={LockKeyhole}
          title="Урок ещё закрыт"
          description="Сначала пройдите предыдущий урок"
        />
      )
    }

    if (isApiError(error) && error.is('SUBSCRIPTION_EXPIRED')) {
      return (
        <StateMessage
          icon={LockKeyhole}
          title="Доступ к предмету закрыт"
          description="Продлите оплату, чтобы вернуться к урокам"
        />
      )
    }

    if (isApiError(error) && error.is('NOT_FOUND')) {
      return (
        <StateMessage
          icon={SearchX}
          title="Урок не найден"
          description="Возможно, его удалили — вернитесь к списку уроков"
        />
      )
    }

    return (
      <StateMessage
        icon={WifiOff}
        title="Не получилось открыть урок"
        description="Проверьте соединение и попробуйте ещё раз"
        action={{ label: 'Повторить', onClick: () => void attemptQuery.refetch() }}
      />
    )
  }

  const attempt = attemptQuery.data

  return (
    <section className="flex flex-col gap-6">
      <PageHeader title={attempt.lesson.title} description={attempt.lesson.description} />

      {result ? (
        <AttemptResult
          result={result}
          lessonsHref={lessonsHref}
          nextLessonHref={
            result.unlockedLessonId === null ? null : hrefOfLesson(result.unlockedLessonId)
          }
        />
      ) : attempt.completedAt ? (
        <AttemptReview attempt={attempt} />
      ) : (
        <AttemptRunner
          attempt={attempt}
          refreshing={attemptQuery.isFetching}
          onCompleted={setResult}
        />
      )}
    </section>
  )
}
