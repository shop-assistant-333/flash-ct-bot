import { ChevronLeft, SearchX } from 'lucide-react'
import { Link, useParams } from 'react-router'

import { adminQuestionPath, adminSubjectPath, adminSubjectQuestionNewPath } from '@/app/routes'
import { PracticeQuestionsList } from '@/features/admin-questions'
import { LinkButton } from '@/shared/ui/link-button'
import { PageHeader } from '@/shared/ui/page-header'
import { StateMessage } from '@/shared/ui/state-message'

export function AdminPracticeQuestionsPage() {
  const { subjectId } = useParams()

  const id = Number(subjectId)
  const subject = Number.isInteger(id) && id > 0 ? id : undefined

  return (
    <section className="flex flex-col gap-4">
      {subject === undefined ? null : (
        <Link
          to={adminSubjectPath(subject)}
          className="-ml-1 flex min-h-11 items-center gap-1 self-start text-sm text-muted"
        >
          <ChevronLeft aria-hidden className="size-4" />К предмету
        </Link>
      )}

      <PageHeader
        title="Вопросы для практики"
        description="Задания вне уроков — только для вкладки «Практика»"
      />

      {subject === undefined ? (
        <StateMessage
          icon={SearchX}
          title="Предмет не найден"
          description="Ссылка на предмет выглядит неверной"
        />
      ) : (
        <>
          <LinkButton to={adminSubjectQuestionNewPath(subject)}>Добавить вопрос</LinkButton>
          <PracticeQuestionsList subjectId={subject} questionHref={adminQuestionPath} />
        </>
      )}
    </section>
  )
}
