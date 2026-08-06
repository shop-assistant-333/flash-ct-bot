import { BookOpen, WifiOff } from 'lucide-react'

import { ListRow } from '@/shared/ui/list-row'
import { ReorderableList } from '@/shared/ui/reorderable-list'
import { Spinner } from '@/shared/ui/spinner'
import { StateMessage } from '@/shared/ui/state-message'

import type { AdminLessonItem } from '../api/admin-lessons-api'
import { useAdminLessons } from '../hooks/use-admin-lessons'
import { useReorderLessons } from '../hooks/use-reorder-lessons'
import { LessonScheduleBadge } from './lesson-schedule-badge'

interface AdminLessonsListProps {
  subjectId: number
  /** Routing belongs to the page: the feature only asks for a lesson's address. */
  hrefOf: (lesson: AdminLessonItem) => string
}

/** Lessons of one subject: the order they are listed in and when each one opens. */
export function AdminLessonsList({ subjectId, hrefOf }: AdminLessonsListProps) {
  const lessonsQuery = useAdminLessons(subjectId)
  const reorderLessons = useReorderLessons(subjectId)

  if (lessonsQuery.isPending) return <Spinner />

  if (lessonsQuery.isError) {
    return (
      <StateMessage
        icon={WifiOff}
        title="Не удалось загрузить уроки"
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
        description="Добавьте первый урок — студенты увидят его в программе предмета"
      />
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {reorderLessons.isError ? (
        <p className="text-sm text-danger">Не удалось сохранить порядок уроков</p>
      ) : null}

      <ReorderableList
        items={lessons}
        getId={(lesson) => lesson.id}
        disabled={reorderLessons.isPending}
        onReorder={(ids) => reorderLessons.mutate(ids)}
        renderItem={(lesson, index) => (
          <ListRow
            title={`${index + 1}. ${lesson.title}`}
            subtitle={`Вопросов: ${lesson.questionCount}`}
            meta={<LessonScheduleBadge opensAt={lesson.opensAt} />}
            to={hrefOf(lesson)}
          />
        )}
      />
    </div>
  )
}
