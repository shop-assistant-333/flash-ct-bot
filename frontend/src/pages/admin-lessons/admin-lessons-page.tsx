import { ChevronLeft, SearchX } from 'lucide-react'
import { Link, useParams } from 'react-router'

import { adminLessonPath, adminSubjectPath } from '@/app/routes'
import {
  AdminLessonsList,
  LessonCreate,
  SectionCreate,
  type AdminLessonItem,
} from '@/features/admin-lessons'
import { PageHeader } from '@/shared/ui/page-header'
import { StateMessage } from '@/shared/ui/state-message'

export function AdminLessonsPage() {
  const { subjectId } = useParams()

  const id = Number(subjectId)
  const subject = Number.isInteger(id) && id > 0 ? id : undefined

  return (
    <section className="flex flex-col gap-6">
      {subject === undefined ? null : (
        <Link
          to={adminSubjectPath(subject)}
          className="-ml-1 flex min-h-11 items-center gap-1 self-start text-sm text-muted"
        >
          <ChevronLeft aria-hidden className="size-4" />К предмету
        </Link>
      )}

      <PageHeader title="Уроки" description="Программа по темам: уроки темы, затем её тест" />

      {subject === undefined ? (
        <StateMessage
          icon={SearchX}
          title="Предмет не найден"
          description="Ссылка на предмет выглядит неверной — вернитесь к списку предметов"
        />
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <LessonCreate subjectId={subject} kind="LESSON" />
            <div className="grid grid-cols-2 gap-2">
              <SectionCreate subjectId={subject} />
              <LessonCreate subjectId={subject} kind="TEST" />
            </div>
          </div>
          <AdminLessonsList
            subjectId={subject}
            hrefOf={(lesson: AdminLessonItem) => adminLessonPath(lesson.id)}
          />
        </>
      )}
    </section>
  )
}
