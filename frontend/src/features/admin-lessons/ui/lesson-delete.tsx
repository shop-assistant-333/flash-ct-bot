import { useState } from 'react'

import { Button } from '@/shared/ui/button'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'

import { useDeleteLesson } from '../hooks/use-delete-lesson'

interface LessonDeleteProps {
  lessonId: number
  subjectId: number
  /** The screen leaves for the lesson list — navigation stays in the page. */
  onDeleted: () => void
}

export function LessonDelete({ lessonId, subjectId, onDeleted }: LessonDeleteProps) {
  const [confirming, setConfirming] = useState(false)
  const deleteLesson = useDeleteLesson(lessonId, subjectId)

  return (
    <div className="flex flex-col gap-2">
      <Button variant="danger" onClick={() => setConfirming(true)}>
        Удалить урок
      </Button>
      {deleteLesson.isError ? <p className="text-sm text-danger">Не удалось удалить урок</p> : null}

      <ConfirmDialog
        open={confirming}
        title="Удалить урок?"
        description="Вместе с уроком пропадут все его вопросы и прогресс студентов по нему. Отменить это нельзя."
        confirmLabel="Удалить"
        loading={deleteLesson.isPending}
        onClose={() => setConfirming(false)}
        onConfirm={() => deleteLesson.mutate(undefined, { onSuccess: onDeleted })}
      />
    </div>
  )
}
