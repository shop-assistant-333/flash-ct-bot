import { useState } from 'react'
import type { FormEvent } from 'react'

import type { LessonKind } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { Modal } from '@/shared/ui/modal'

import type { LessonDraft } from '../api/admin-lessons-api'
import { useAdminSections } from '../hooks/use-admin-sections'
import { useCreateLesson } from '../hooks/use-create-lesson'
import { KIND_WORDS } from '../lib/kind-words'
import { lessonFormErrors } from '../lib/lesson-form-errors'
import { LessonFields } from './lesson-fields'

const EMPTY_DRAFT: LessonDraft = { title: '', description: '', opensAt: null, sectionId: null }

interface LessonCreateProps {
  subjectId: number
  /** Which button this is: «Добавить урок» (the main action) or «Добавить тест». */
  kind: LessonKind
}

/** «Добавить урок» / «Добавить тест» and its sheet. `order` is not sent — it goes last in its topic. */
export function LessonCreate({ subjectId, kind }: LessonCreateProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<LessonDraft>(EMPTY_DRAFT)
  const createLesson = useCreateLesson(subjectId, kind)
  const sectionsQuery = useAdminSections(subjectId)

  const words = KIND_WORDS[kind]
  const errors = lessonFormErrors(createLesson.error)
  const hasFieldErrors = Object.keys(errors).length > 0

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    createLesson.mutate(draft, {
      onSuccess: () => {
        setDraft(EMPTY_DRAFT)
        setOpen(false)
      },
    })
  }

  function handleClose() {
    setOpen(false)
    createLesson.reset()
  }

  return (
    <>
      <Button variant={kind === 'LESSON' ? 'primary' : 'secondary'} onClick={() => setOpen(true)}>
        Добавить {words.accusative}
      </Button>

      <Modal
        open={open}
        title={kind === 'TEST' ? 'Новый тест' : 'Новый урок'}
        onClose={handleClose}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <LessonFields
            kind={kind}
            values={draft}
            onChange={setDraft}
            sections={sectionsQuery.data ?? []}
            errors={errors}
          />
          {sectionsQuery.isError ? (
            <p className="text-sm text-danger">Не удалось загрузить темы предмета</p>
          ) : null}
          {createLesson.isError && !hasFieldErrors ? (
            <p className="text-sm text-danger">Не удалось создать {words.accusative}</p>
          ) : null}
          <Button type="submit" loading={createLesson.isPending}>
            Создать
          </Button>
        </form>
      </Modal>
    </>
  )
}
