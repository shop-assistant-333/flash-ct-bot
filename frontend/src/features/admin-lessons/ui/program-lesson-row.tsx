import { ListRow } from '@/shared/ui/list-row'

import type { ProgramRow } from '../lib/program'
import { LessonScheduleBadge } from './lesson-schedule-badge'
import { TestBadge } from './test-badge'

interface ProgramLessonRowProps {
  row: ProgramRow
  href: string
}

/** A lesson in the admin programme: the number students see, or the test mark. */
export function ProgramLessonRow({ row: { lesson, number }, href }: ProgramLessonRowProps) {
  return (
    <ListRow
      title={number === null ? lesson.title : `${number}. ${lesson.title}`}
      subtitle={`Вопросов: ${lesson.questionCount}`}
      meta={
        <>
          {lesson.kind === 'TEST' ? <TestBadge /> : null}
          <LessonScheduleBadge opensAt={lesson.opensAt} />
        </>
      }
      to={href}
    />
  )
}
