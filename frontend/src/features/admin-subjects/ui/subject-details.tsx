import { useState } from 'react'

import { Button } from '@/shared/ui/button'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { ListRow } from '@/shared/ui/list-row'

import type { SubjectDto } from '../api/admin-subjects-api'
import { useDeleteSubject } from '../hooks/use-delete-subject'
import { formatDeleteSubjectError } from '../lib/delete-subject-error'
import { formatLessonsCount, formatPracticeQuestionsCount } from '../lib/format-counts'

interface SubjectDetailsProps {
  subject: SubjectDto
  /** Screens of other features: the page hands over their addresses. */
  lessonsHref: string
  practiceQuestionsHref: string
  /** A teacher edits the content of a subject but never drops the subject itself. */
  canDelete: boolean
  onDeleted: () => void
}

interface CountTileProps {
  value: number
  label: string
}

function CountTile({ value, label }: CountTileProps) {
  return (
    <div className="flex flex-col gap-1 rounded-card bg-surface p-4 shadow-card">
      <p className="text-2xl font-semibold text-fg tabular-nums">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  )
}

/** Counters of one subject, the way into its content, and its removal. */
export function SubjectDetails({
  subject,
  lessonsHref,
  practiceQuestionsHref,
  canDelete,
  onDeleted,
}: SubjectDetailsProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const deleteMutation = useDeleteSubject(subject.id)

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <CountTile value={subject.lessonsCount} label="Уроков" />
        <CountTile value={subject.practiceOnlyQuestionsCount} label="Вопросов практики" />
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-muted">Содержание</h2>
        <ListRow
          title="Уроки"
          subtitle={formatLessonsCount(subject.lessonsCount)}
          to={lessonsHref}
        />
        <ListRow
          title="Вопросы для практики"
          subtitle={formatPracticeQuestionsCount(subject.practiceOnlyQuestionsCount)}
          to={practiceQuestionsHref}
        />
      </div>

      {canDelete ? (
        <div className="flex flex-col gap-2">
          <Button variant="secondary" onClick={() => setIsConfirmingDelete(true)}>
            Удалить предмет
          </Button>
          {deleteMutation.isError ? (
            <p className="text-sm text-danger">{formatDeleteSubjectError(deleteMutation.error)}</p>
          ) : null}
        </div>
      ) : null}

      <ConfirmDialog
        open={isConfirmingDelete}
        title="Удалить предмет?"
        description={`«${subject.name}» пропадёт из списка. Удалить можно только пустой предмет: уроки и вопросы практики удаляются отдельно, до него. Отменить это будет нельзя.`}
        confirmLabel="Удалить"
        loading={deleteMutation.isPending}
        onConfirm={() =>
          // The failure message lives on the page, so the sheet gets out of the
          // way instead of holding a dead confirm button.
          deleteMutation.mutate(undefined, {
            onSuccess: onDeleted,
            onError: () => setIsConfirmingDelete(false),
          })
        }
        onClose={() => setIsConfirmingDelete(false)}
      />
    </>
  )
}
