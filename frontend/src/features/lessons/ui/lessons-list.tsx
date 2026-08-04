import { BookOpen, LockKeyhole, WifiOff } from 'lucide-react'

import { isApiError } from '@/shared/api'
import { StateMessage } from '@/shared/ui/state-message'

import type { LessonItem } from '../api/lessons-api'
import { useLessons } from '../hooks/use-lessons'
import { CompletedLessonsGroup } from './completed-lessons-group'
import { LessonCard } from './lesson-card'
import { LessonsProgress } from './lessons-progress'

interface LessonsListProps {
  subjectId: number
  /** Routing belongs to the page: the feature only asks for a lesson's address. */
  hrefOf: (lesson: LessonItem) => string
}

function LessonsSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-3">
      {[0, 1, 2, 3].map((row) => (
        <div key={row} className="h-24 animate-pulse rounded-card bg-surface-sunken" />
      ))}
    </div>
  )
}

/** The homework programme of one subject, in the order the admin set. */
export function LessonsList({ subjectId, hrefOf }: LessonsListProps) {
  const lessonsQuery = useLessons(subjectId)

  if (lessonsQuery.isPending) return <LessonsSkeleton />

  if (lessonsQuery.isError) {
    const { error } = lessonsQuery

    if (isApiError(error) && error.is('SUBSCRIPTION_EXPIRED')) {
      return (
        <StateMessage
          icon={LockKeyhole}
          title="Доступ к предмету закрыт"
          description="Продлите оплату, чтобы вернуться к урокам"
        />
      )
    }

    return (
      <StateMessage
        icon={WifiOff}
        title="Не получилось загрузить уроки"
        description="Проверьте соединение и попробуйте ещё раз"
        action={{ label: 'Повторить', onClick: () => void lessonsQuery.refetch() }}
      />
    )
  }

  const lessons = lessonsQuery.data

  if (lessons.length === 0) {
    return (
      <StateMessage
        icon={BookOpen}
        title="Уроков пока нет"
        description="Преподаватель ещё не добавил задания по этому предмету"
      />
    )
  }

  const numbered = lessons.map((lesson, index) => ({ lesson, number: index + 1 }))
  const completedEntries = numbered.filter(({ lesson }) => lesson.status === 'COMPLETED')
  const otherEntries = numbered.filter(({ lesson }) => lesson.status !== 'COMPLETED')

  return (
    <div className="flex flex-col gap-4">
      <LessonsProgress completed={completedEntries.length} total={lessons.length} />

      <ul className="flex flex-col gap-3">
        {completedEntries.length > 1 ? (
          <CompletedLessonsGroup items={completedEntries} hrefOf={hrefOf} />
        ) : (
          completedEntries.map(({ lesson, number }) => (
            <LessonCard key={lesson.id} lesson={lesson} number={number} href={hrefOf(lesson)} />
          ))
        )}
        {otherEntries.map(({ lesson, number }) => (
          <LessonCard key={lesson.id} lesson={lesson} number={number} href={hrefOf(lesson)} />
        ))}
      </ul>
    </div>
  )
}
