import { useState } from 'react'
import type { FormEvent } from 'react'

import { fieldErrors } from '@/shared/lib/form-errors'
import { Button } from '@/shared/ui/button'
import { Modal } from '@/shared/ui/modal'

import type { LessonDraft } from '../api/admin-lessons-api'
import { useCreateLesson } from '../hooks/use-create-lesson'
import { LessonFields } from './lesson-fields'

const EMPTY_DRAFT: LessonDraft = { title: '', description: '', opensAt: null }

interface LessonCreateProps {
  subjectId: number
}

/** «Добавить урок» and its sheet. `order` is not sent — a new lesson goes last. */
export function LessonCreate({ subjectId }: LessonCreateProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<LessonDraft>(EMPTY_DRAFT)
  const createLesson = useCreateLesson(subjectId)

  const errors = fieldErrors(createLesson.error)
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
      <Button onClick={() => setOpen(true)}>Добавить урок</Button>

      <Modal open={open} title="Новый урок" onClose={handleClose}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <LessonFields values={draft} onChange={setDraft} errors={errors} />
          {createLesson.isError && !hasFieldErrors ? (
            <p className="text-sm text-danger">Не удалось создать урок</p>
          ) : null}
          <Button type="submit" loading={createLesson.isPending}>
            Создать
          </Button>
        </form>
      </Modal>
    </>
  )
}
