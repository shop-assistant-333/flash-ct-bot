import { BookOpen, LockKeyhole, WifiOff } from 'lucide-react'

import { isApiError } from '@/shared/api'
import { StateMessage } from '@/shared/ui/state-message'

import type { LessonItem } from '../api/lessons-api'
import { useLessons } from '../hooks/use-lessons'
import { useSections } from '../hooks/use-sections'
import { buildProgram, initialTopicId, type ProgramEntry } from '../lib/program'
import { CompletedLessonsGroup } from './completed-lessons-group'
import { LessonCard } from './lesson-card'
import { LessonsProgress } from './lessons-progress'
import { TopicSection } from './topic-section'

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

interface LooseLessonsProps {
  entries: ProgramEntry[]
  hrefOf: (lesson: LessonItem) => string
}

/** Lessons outside every topic — the flat list, with finished ones folded away. */
function LooseLessons({ entries, hrefOf }: LooseLessonsProps) {
  const completed = entries.filter(({ lesson }) => lesson.status === 'COMPLETED')
  const others = entries.filter(({ lesson }) => lesson.status !== 'COMPLETED')

  return (
    <>
      {completed.length > 1 ? (
        <CompletedLessonsGroup items={completed} hrefOf={hrefOf} />
      ) : (
        completed.map(({ lesson, number }) => (
          <LessonCard key={lesson.id} lesson={lesson} number={number} href={hrefOf(lesson)} />
        ))
      )}
      {others.map(({ lesson, number }) => (
        <LessonCard key={lesson.id} lesson={lesson} number={number} href={hrefOf(lesson)} />
      ))}
    </>
  )
}

/** The homework programme of one subject: topics in order, then lessons outside them. */
export function LessonsList({ subjectId, hrefOf }: LessonsListProps) {
  const lessonsQuery = useLessons(subjectId)
  const sectionsQuery = useSections(subjectId)

  if (lessonsQuery.isPending || sectionsQuery.isPending) return <LessonsSkeleton />

  if (lessonsQuery.isError || sectionsQuery.isError) {
    const error = lessonsQuery.error ?? sectionsQuery.error

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
        action={{
          label: 'Повторить',
          onClick: () => {
            void lessonsQuery.refetch()
            void sectionsQuery.refetch()
          },
        }}
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

  const program = buildProgram(lessons, sectionsQuery.data)
  const openTopicId = initialTopicId(program.topics)
  // Tests are left out of every statistic, the subject progress included.
  const countable = lessons.filter((lesson) => lesson.kind === 'LESSON')
  const completedCount = countable.filter((lesson) => lesson.status === 'COMPLETED').length

  return (
    <div className="flex flex-col gap-4">
      <LessonsProgress completed={completedCount} total={countable.length} />

      <ul className="flex flex-col gap-3">
        {program.topics.map((topic) => (
          <TopicSection
            key={topic.section.id}
            topic={topic}
            initiallyExpanded={topic.section.id === openTopicId}
            hrefOf={hrefOf}
          />
        ))}
        <LooseLessons entries={program.loose} hrefOf={hrefOf} />
      </ul>
    </div>
  )
}
