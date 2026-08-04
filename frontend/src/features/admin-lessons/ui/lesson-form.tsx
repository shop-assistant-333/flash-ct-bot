import { useState } from 'react'
import type { FormEvent } from 'react'

import { fieldErrors } from '@/shared/lib/form-errors'
import { Button } from '@/shared/ui/button'

import type { AdminLessonDto, LessonDraft } from '../api/admin-lessons-api'
import { useUpdateLesson } from '../hooks/use-update-lesson'
import { LessonFields } from './lesson-fields'

interface LessonFormProps {
  lesson: AdminLessonDto
}

/** Title and description of an existing lesson. */
export function LessonForm({ lesson }: LessonFormProps) {
  // A draft of what the admin is typing, not a copy of server state: it is
  // seeded once from the loaded lesson, so a refetch cannot overwrite edits.
  const [draft, setDraft] = useState<LessonDraft>({
    title: lesson.title,
    description: lesson.description,
  })
  const updateLesson = useUpdateLesson(lesson.id, lesson.subjectId)

  const errors = fieldErrors(updateLesson.error)
  const hasFieldErrors = Object.keys(errors).length > 0

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    updateLesson.mutate(draft)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-card bg-surface p-3 shadow-card"
    >
      <h2 className="text-sm font-medium text-muted">Данные урока</h2>

      <LessonFields values={draft} onChange={setDraft} errors={errors} />

      {updateLesson.isError && !hasFieldErrors ? (
        <p className="text-sm text-danger">Не удалось сохранить урок</p>
      ) : null}
      {updateLesson.isSuccess ? (
        <p role="status" className="text-sm text-success">
          Изменения сохранены
        </p>
      ) : null}

      <Button type="submit" loading={updateLesson.isPending}>
        Сохранить
      </Button>
    </form>
  )
}
