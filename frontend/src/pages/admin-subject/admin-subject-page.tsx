import { Pencil, SearchX, WifiOff } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'

import {
  ADMIN_ROUTES,
  adminSubjectLessonsPath,
  adminSubjectPracticeQuestionsPath,
} from '@/app/routes'
import { RenameSubjectModal, SubjectDetails, useAdminSubjects } from '@/features/admin-subjects'
import { PageHeader } from '@/shared/ui/page-header'
import { Spinner } from '@/shared/ui/spinner'
import { StateMessage } from '@/shared/ui/state-message'

export function AdminSubjectPage() {
  const { subjectId } = useParams()
  const navigate = useNavigate()
  const [isRenaming, setIsRenaming] = useState(false)
  const subjectsQuery = useAdminSubjects()

  if (subjectsQuery.isPending) {
    return (
      <section className="flex flex-col gap-6">
        <PageHeader title="Предмет" />
        <Spinner />
      </section>
    )
  }

  if (subjectsQuery.isError) {
    return (
      <section className="flex flex-col gap-6">
        <PageHeader title="Предмет" />
        <StateMessage
          icon={WifiOff}
          title="Не удалось загрузить предмет"
          description="Проверьте соединение и попробуйте ещё раз"
          action={{ label: 'Повторить', onClick: () => void subjectsQuery.refetch() }}
        />
      </section>
    )
  }

  // There is no `GET /admin/subjects/{id}` in the contract, so the card takes
  // its subject out of the list.
  const subject = subjectsQuery.data.find((item) => item.id === Number(subjectId))

  if (subject === undefined) {
    return (
      <section className="flex flex-col gap-6">
        <PageHeader title="Предмет" />
        <StateMessage
          icon={SearchX}
          title="Предмет не найден"
          description="Возможно, его уже удалили"
          action={{
            label: 'К списку предметов',
            onClick: () => void navigate(ADMIN_ROUTES.subjects),
          }}
        />
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title={subject.name}
        description="Название, уроки и вопросы практики"
        action={
          <button
            type="button"
            aria-label="Переименовать предмет"
            onClick={() => setIsRenaming(true)}
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-fg transition-colors duration-150 active:bg-surface-sunken"
          >
            <Pencil aria-hidden className="size-5" />
          </button>
        }
      />

      <SubjectDetails
        subject={subject}
        lessonsHref={adminSubjectLessonsPath(subject.id)}
        practiceQuestionsHref={adminSubjectPracticeQuestionsPath(subject.id)}
        onDeleted={() => void navigate(ADMIN_ROUTES.subjects, { replace: true })}
      />

      {isRenaming ? (
        <RenameSubjectModal subject={subject} onClose={() => setIsRenaming(false)} />
      ) : null}
    </section>
  )
}
