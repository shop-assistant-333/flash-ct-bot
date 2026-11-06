import { useState } from 'react'
import type { FormEvent } from 'react'

import { Button } from '@/shared/ui/button'

import type { AdminLessonDto, LessonDraft } from '../api/admin-lessons-api'
import { useAdminSections } from '../hooks/use-admin-sections'
import { useUpdateLesson } from '../hooks/use-update-lesson'
import { KIND_WORDS } from '../lib/kind-words'
import { lessonFormErrors } from '../lib/lesson-form-errors'
import { LessonFields } from './lesson-fields'

interface LessonFormProps {
  lesson: AdminLessonDto
}

/** Fields of an existing lesson or test. Its kind is fixed at creation and not edited. */
export function LessonForm({ lesson }: LessonFormProps) {
  // A draft of what the admin is typing, not a copy of server state: it is
  // seeded once from the loaded lesson, so a refetch cannot overwrite edits.
  const [draft, setDraft] = useState<LessonDraft>({
    title: lesson.title,
    description: lesson.description,
    opensAt: lesson.opensAt,
    sectionId: lesson.sectionId,
  })
  const updateLesson = useUpdateLesson(lesson.id, lesson.subjectId)
  const sectionsQuery = useAdminSections(lesson.subjectId)

  const words = KIND_WORDS[lesson.kind]
  const errors = lessonFormErrors(updateLesson.error)
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
      <h2 className="text-sm font-medium text-muted">Данные {words.genitive}</h2>

      {/* Until the topics arrive the select is not drawn, and the draft keeps the
          lesson's topic — a save in between does not move the lesson. */}
      <LessonFields
        kind={lesson.kind}
        values={draft}
        onChange={setDraft}
        sections={sectionsQuery.data ?? []}
        errors={errors}
      />
      {sectionsQuery.isError ? (
        <p className="text-sm text-danger">Не удалось загрузить темы предмета</p>
      ) : null}

      {updateLesson.isError && !hasFieldErrors ? (
        <p className="text-sm text-danger">Не удалось сохранить {words.accusative}</p>
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
