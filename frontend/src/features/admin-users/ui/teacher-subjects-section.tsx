import { useState } from 'react'

import { Button } from '@/shared/ui/button'
import { SelectField } from '@/shared/ui/select-field'

import type { TaughtSubjectItem } from '../api/admin-users-api'
import { useAssignTeacherSubject } from '../hooks/use-assign-teacher-subject'
import { useUnassignTeacherSubject } from '../hooks/use-unassign-teacher-subject'
import type { SubjectOption } from './subscription-modal'

interface TeacherSubjectsSectionProps {
  userId: number
  taughtSubjects: TaughtSubjectItem[]
  /** Comes from the subjects feature through the page — features stay unaware of each other. */
  subjects: SubjectOption[]
}

const REMOVE =
  'min-h-11 shrink-0 rounded-control px-3 text-sm font-medium text-danger transition-colors duration-150 active:bg-surface-sunken'

/**
 * Which subjects a teacher may edit. Deliberately apart from the subscriptions
 * block: this is the right to change the content, not paid access to it.
 */
export function TeacherSubjectsSection({
  userId,
  taughtSubjects,
  subjects,
}: TeacherSubjectsSectionProps) {
  const assignSubject = useAssignTeacherSubject(userId)
  const unassignSubject = useUnassignTeacherSubject(userId)

  const taughtIds = new Set(taughtSubjects.map((subject) => subject.subjectId))
  const available = subjects.filter((subject) => !taughtIds.has(subject.id))
  const [selected, setSelected] = useState('')

  // The list shrinks as subjects are handed out, so the choice follows it
  // instead of pointing at a subject that is already assigned.
  const subjectId = available.some((subject) => String(subject.id) === selected)
    ? selected
    : String(available[0]?.id ?? '')

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-medium text-muted">Преподаёт</h2>

      {taughtSubjects.length === 0 ? (
        <p className="rounded-card bg-surface p-3 text-sm text-muted shadow-card">
          Предметов нет — учитель пока ничего не может редактировать
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {taughtSubjects.map((subject) => (
            <li
              key={subject.subjectId}
              className="flex items-center justify-between gap-2 rounded-card bg-surface p-3 shadow-card"
            >
              <span className="truncate text-sm font-medium text-fg">{subject.subjectName}</span>
              <button
                type="button"
                className={REMOVE}
                onClick={() => unassignSubject.mutate(subject.subjectId)}
              >
                Убрать
              </button>
            </li>
          ))}
        </ul>
      )}

      {unassignSubject.isError ? (
        <p className="text-sm text-danger">Не удалось убрать предмет</p>
      ) : null}

      {available.length === 0 ? null : (
        <>
          <SelectField
            label="Добавить предмет"
            value={subjectId}
            options={available.map((subject) => ({
              value: String(subject.id),
              label: subject.name,
            }))}
            onChange={setSelected}
          />
          <Button
            variant="secondary"
            loading={assignSubject.isPending}
            onClick={() => assignSubject.mutate(Number(subjectId))}
          >
            Выдать предмет
          </Button>
          {assignSubject.isError ? (
            <p className="text-sm text-danger">Не удалось выдать предмет</p>
          ) : null}
        </>
      )}
    </section>
  )
}
