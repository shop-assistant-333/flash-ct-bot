import { SearchX } from 'lucide-react'
import { useLocation, useNavigate, useNavigationType, useParams } from 'react-router'

import {
  adminLessonQuestionNewPath,
  adminQuestionPath,
  adminSubjectLessonsPath,
} from '@/app/routes'
import { LessonEditor, useAdminLesson } from '@/features/admin-lessons'
import { parseQuestionAnchor } from '@/shared/lib/question-anchor'
import { PageHeader } from '@/shared/ui/page-header'
import { StateMessage } from '@/shared/ui/state-message'

function toId(value: string | undefined): number | undefined {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : undefined
}

export function AdminLessonPage() {
  const { lessonId } = useParams()
  const { hash } = useLocation()
  const navigationType = useNavigationType()
  const navigate = useNavigate()

  const id = toId(lessonId)
  const lessonQuery = useAdminLesson(id)
  const isTest = lessonQuery.data?.kind === 'TEST'
  // Back/forward (POP) is left to <ScrollRestoration />, which puts the page
  // where it was — jumping to the hash on top of that would fight it.
  const focusQuestionId = navigationType === 'POP' ? undefined : parseQuestionAnchor(hash)

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title={isTest ? 'Тест' : 'Урок'}
        description={isTest ? 'Данные теста и его вопросы' : 'Данные урока и его вопросы'}
      />

      {id === undefined ? (
        <StateMessage
          icon={SearchX}
          title="Урок не найден"
          description="Ссылка на урок выглядит неверной — вернитесь к списку уроков"
        />
      ) : (
        <LessonEditor
          lessonId={id}
          lessonsHrefOf={adminSubjectLessonsPath}
          questionHrefs={{
            question: adminQuestionPath,
            newQuestion: adminLessonQuestionNewPath(id),
          }}
          focusQuestionId={focusQuestionId}
          onDeleted={(subjectId: number) => void navigate(adminSubjectLessonsPath(subjectId))}
        />
      )}
    </section>
  )
}
