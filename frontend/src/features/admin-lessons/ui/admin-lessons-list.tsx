import { BookOpen, WifiOff } from 'lucide-react'

import { Spinner } from '@/shared/ui/spinner'
import { StateMessage } from '@/shared/ui/state-message'
import { withSwapped } from '@/shared/lib/with-swapped'

import type { AdminLessonItem } from '../api/admin-lessons-api'
import { useAdminLessons } from '../hooks/use-admin-lessons'
import { useAdminSections } from '../hooks/use-admin-sections'
import { useReorderLessons } from '../hooks/use-reorder-lessons'
import { useReorderSections } from '../hooks/use-reorder-sections'
import { buildAdminProgram, withGroupOrder } from '../lib/program'
import { ProgramRows } from './program-rows'
import { SectionBlock } from './section-block'

interface AdminLessonsListProps {
  subjectId: number
  /** Routing belongs to the page: the feature only asks for a lesson's address. */
  hrefOf: (lesson: AdminLessonItem) => string
}

/** The programme of one subject: topics with their lessons and test, then lessons outside them. */
export function AdminLessonsList({ subjectId, hrefOf }: AdminLessonsListProps) {
  const lessonsQuery = useAdminLessons(subjectId)
  const sectionsQuery = useAdminSections(subjectId)
  const reorderLessons = useReorderLessons(subjectId)
  const reorderSections = useReorderSections(subjectId)

  if (lessonsQuery.isPending || sectionsQuery.isPending) return <Spinner />

  if (lessonsQuery.isError || sectionsQuery.isError) {
    return (
      <StateMessage
        icon={WifiOff}
        title="Не удалось загрузить уроки"
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
  const sections = sectionsQuery.data

  if (lessons.length === 0 && sections.length === 0) {
    return (
      <StateMessage
        icon={BookOpen}
        title="Уроков пока нет"
        description="Добавьте первый урок — студенты увидят его в программе предмета"
      />
    )
  }

  const program = buildAdminProgram(lessons, sections)
  const allLessonIds = lessons.map((lesson) => lesson.id)
  const sectionIds = sections.map((section) => section.id)
  const busy = reorderLessons.isPending || reorderSections.isPending

  const reorderBlock = (ids: number[]) => reorderLessons.mutate(withGroupOrder(allLessonIds, ids))
  const moveSection = (from: number, to: number) =>
    busy || to < 0 || to >= sectionIds.length
      ? undefined
      : () => reorderSections.mutate(withSwapped(sectionIds, from, to))

  return (
    <div className="flex flex-col gap-6">
      {reorderLessons.isError ? (
        <p className="text-sm text-danger">Не удалось сохранить порядок уроков</p>
      ) : null}
      {reorderSections.isError ? (
        <p className="text-sm text-danger">Не удалось сохранить порядок тем</p>
      ) : null}

      {program.groups.map((group, index) => (
        <SectionBlock
          key={group.section.id}
          group={group}
          moves={{ up: moveSection(index, index - 1), down: moveSection(index, index + 1) }}
          onReorderLessons={reorderBlock}
          disabled={busy}
          hrefOf={hrefOf}
        />
      ))}

      {program.loose.length > 0 ? (
        <section className="flex flex-col gap-2">
          {sections.length > 0 ? <h3 className="font-semibold text-fg">Без темы</h3> : null}
          <ProgramRows
            rows={program.loose}
            onReorder={reorderBlock}
            disabled={busy}
            hrefOf={hrefOf}
          />
        </section>
      ) : null}
    </div>
  )
}
