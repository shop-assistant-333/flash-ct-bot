import { BookOpen, WifiOff } from 'lucide-react'

import { ListRow } from '@/shared/ui/list-row'
import { StateMessage } from '@/shared/ui/state-message'

import type { SubjectDto } from '../api/admin-subjects-api'
import { useAdminSubjects } from '../hooks/use-admin-subjects'
import { formatSubjectCounts } from '../lib/format-counts'

interface SubjectsListProps {
  /** Routing belongs to the page: the feature only asks for a subject's address. */
  hrefOf: (subject: SubjectDto) => string
}

function SubjectsSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-2">
      {[0, 1, 2, 3].map((row) => (
        <div key={row} className="h-16 animate-pulse rounded-card bg-surface-sunken" />
      ))}
    </div>
  )
}

/** Every subject of the app, with the amount of content behind each one. */
export function SubjectsList({ hrefOf }: SubjectsListProps) {
  const subjectsQuery = useAdminSubjects()

  if (subjectsQuery.isPending) return <SubjectsSkeleton />

  if (subjectsQuery.isError) {
    return (
      <StateMessage
        icon={WifiOff}
        title="Не удалось загрузить предметы"
        description="Проверьте соединение и попробуйте ещё раз"
        action={{ label: 'Повторить', onClick: () => void subjectsQuery.refetch() }}
      />
    )
  }

  const subjects = subjectsQuery.data

  if (subjects.length === 0) {
    return (
      <StateMessage
        icon={BookOpen}
        title="Предметов пока нет"
        description="Добавьте первый предмет — уроки и вопросы практики появятся внутри него"
      />
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {subjects.map((subject) => (
        <li key={subject.id}>
          <ListRow
            title={subject.name}
            subtitle={formatSubjectCounts(subject.lessonsCount, subject.practiceOnlyQuestionsCount)}
            to={hrefOf(subject)}
          />
        </li>
      ))}
    </ul>
  )
}
