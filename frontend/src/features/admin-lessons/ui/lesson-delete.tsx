import { useState } from 'react'

import type { LessonKind } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'

import { useDeleteLesson } from '../hooks/use-delete-lesson'
import { KIND_WORDS } from '../lib/kind-words'

interface LessonDeleteProps {
  lessonId: number
  subjectId: number
  kind: LessonKind
  /** The screen leaves for the lesson list — navigation stays in the page. */
  onDeleted: () => void
}

export function LessonDelete({ lessonId, subjectId, kind, onDeleted }: LessonDeleteProps) {
  const [confirming, setConfirming] = useState(false)
  const deleteLesson = useDeleteLesson(lessonId, subjectId)
  const words = KIND_WORDS[kind]

  return (
    <div className="flex flex-col gap-2">
      <Button variant="danger" onClick={() => setConfirming(true)}>
        Удалить {words.accusative}
      </Button>
      {deleteLesson.isError ? (
        <p className="text-sm text-danger">Не удалось удалить {words.accusative}</p>
      ) : null}

      <ConfirmDialog
        open={confirming}
        title={`Удалить ${words.accusative}?`}
        description="Вместе с ним пропадут все его вопросы и прогресс студентов по нему. Отменить это нельзя."
        confirmLabel="Удалить"
        loading={deleteLesson.isPending}
        onClose={() => setConfirming(false)}
        onConfirm={() => deleteLesson.mutate(undefined, { onSuccess: onDeleted })}
      />
    </div>
  )
}
