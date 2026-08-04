import { Plus } from 'lucide-react'
import { useState } from 'react'

import { adminSubjectPath } from '@/app/routes'
import { CreateSubjectModal, SubjectsList } from '@/features/admin-subjects'
import { PageHeader } from '@/shared/ui/page-header'

export function AdminSubjectsPage() {
  const [isCreating, setIsCreating] = useState(false)

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title="Предметы"
        description="Предметы, уроки и вопросы практики"
        action={
          <button
            type="button"
            aria-label="Добавить предмет"
            onClick={() => setIsCreating(true)}
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-fg transition-colors duration-150 active:bg-primary-hover"
          >
            <Plus aria-hidden className="size-5" />
          </button>
        }
      />

      <SubjectsList hrefOf={(subject) => adminSubjectPath(subject.id)} />

      {isCreating ? <CreateSubjectModal onClose={() => setIsCreating(false)} /> : null}
    </section>
  )
}
