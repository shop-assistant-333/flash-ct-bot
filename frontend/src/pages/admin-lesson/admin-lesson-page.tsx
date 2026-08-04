import { SearchX } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'

import {
  adminLessonQuestionNewPath,
  adminQuestionPath,
  adminSubjectLessonsPath,
} from '@/app/routes'
import { LessonEditor } from '@/features/admin-lessons'
import { PageHeader } from '@/shared/ui/page-header'
import { StateMessage } from '@/shared/ui/state-message'

export function AdminLessonPage() {
  const { lessonId } = useParams()
  const navigate = useNavigate()

  const id = Number(lessonId)

  return (
    <section className="flex flex-col gap-6">
      <PageHeader title="Урок" description="Данные урока и его вопросы" />

      {Number.isInteger(id) && id > 0 ? (
        <LessonEditor
          lessonId={id}
          lessonsHrefOf={adminSubjectLessonsPath}
          hrefOfQuestion={adminQuestionPath}
          newQuestionHref={adminLessonQuestionNewPath(id)}
          onDeleted={(subjectId: number) => void navigate(adminSubjectLessonsPath(subjectId))}
        />
      ) : (
        <StateMessage
          icon={SearchX}
          title="Урок не найден"
          description="Ссылка на урок выглядит неверной — вернитесь к списку уроков"
        />
      )}
    </section>
  )
}
