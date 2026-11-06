import { ChevronLeft, ChevronRight, SearchX, TriangleAlert, WifiOff } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'

import { isApiError, type LessonKind } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { Spinner } from '@/shared/ui/spinner'
import { StateMessage } from '@/shared/ui/state-message'

import { useAdminQuestion } from '../hooks/use-admin-question'
import { useDeleteQuestion } from '../hooks/use-delete-question'
import { useUpdateQuestion } from '../hooks/use-update-question'
import {
  questionOwner,
  questionToValues,
  toQuestionRequest,
  type QuestionValues,
} from '../lib/question-values'
import { QuestionForm } from './question-form'

interface QuestionDetailProps {
  questionId: number
  /**
   * Where the question belongs — known only after it is loaded, hence builders.
   * With `focusQuestionId` the lesson screen scrolls back to that question.
   */
  lessonHref: (lessonId: number, focusQuestionId?: number) => string
  practiceHref: (subjectId: number) => string
  /** Kind of the owning lesson, from the lessons feature; undefined while unknown. */
  lessonKind: LessonKind | undefined
  /** The question asked after this one; undefined on the last one and outside lessons. */
  nextQuestionHref: string | undefined
}

const NOTE: Record<LessonKind, string> = {
  LESSON: 'Вопрос урока — входит в программу и в практику',
  TEST: 'Вопрос теста — в практику не входит',
}

const PRACTICE_NOTE = 'Только практика — вопрос не входит ни в один урок'

/** Undefined while the owning lesson is still loading: its kind decides the wording. */
function noteOf(inLesson: boolean, lessonKind: LessonKind | undefined): string | undefined {
  if (!inLesson) return PRACTICE_NOTE
  return lessonKind === undefined ? undefined : NOTE[lessonKind]
}

/** One existing question: load, edit, delete. */
export function QuestionDetail({
  questionId,
  lessonHref,
  practiceHref,
  lessonKind,
  nextQuestionHref,
}: QuestionDetailProps) {
  const navigate = useNavigate()
  const questionQuery = useAdminQuestion(questionId)
  const updateQuestion = useUpdateQuestion(questionId)
  const deleteQuestion = useDeleteQuestion(questionId)
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (questionQuery.isPending) return <Spinner />

  if (questionQuery.isError) {
    if (isApiError(questionQuery.error) && questionQuery.error.is('NOT_FOUND')) {
      return (
        <StateMessage
          icon={SearchX}
          title="Вопрос не найден"
          description="Возможно, его уже удалили"
        />
      )
    }

    return (
      <StateMessage
        icon={WifiOff}
        title="Не получилось загрузить вопрос"
        description="Проверьте соединение и попробуйте ещё раз"
        action={{ label: 'Повторить', onClick: () => void questionQuery.refetch() }}
      />
    )
  }

  const question = questionQuery.data
  const owner = questionOwner(question)

  if (owner === undefined) {
    return (
      <StateMessage
        icon={TriangleAlert}
        title="Вопрос не привязан к разделу"
        description="Он не относится ни к уроку, ни к предмету — такой вопрос нельзя отредактировать"
      />
    )
  }

  const inLesson = 'lessonId' in owner
  const backHref =
    'lessonId' in owner ? lessonHref(owner.lessonId, question.id) : practiceHref(owner.subjectId)
  // After a delete there is no row to return to — the lesson opens as usual.
  const afterDeleteHref =
    'lessonId' in owner ? lessonHref(owner.lessonId) : practiceHref(owner.subjectId)
  const note = noteOf(inLesson, lessonKind)

  const handleSubmit = (values: QuestionValues) => {
    updateQuestion.mutate(toQuestionRequest(values, owner, question.order))
  }

  const handleDelete = () => {
    deleteQuestion.mutate(undefined, {
      onSuccess: () => {
        void navigate(afterDeleteHref, { replace: true })
      },
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <nav className="flex items-center justify-between gap-3">
        <Link to={backHref} className="-ml-1 flex min-h-11 items-center gap-1 text-sm text-muted">
          <ChevronLeft aria-hidden className="size-4" />
          {inLesson ? (lessonKind === 'TEST' ? 'К тесту' : 'К уроку') : 'К вопросам практики'}
        </Link>
        {nextQuestionHref === undefined ? null : (
          <Link
            to={nextQuestionHref}
            className="-mr-1 flex min-h-11 items-center gap-1 text-sm text-link"
          >
            Следующий вопрос
            <ChevronRight aria-hidden className="size-4" />
          </Link>
        )}
      </nav>

      {note === undefined ? null : <p className="text-sm text-muted">{note}</p>}

      <QuestionForm
        key={question.id}
        initialValues={questionToValues(question)}
        submitLabel="Сохранить"
        submitting={updateQuestion.isPending}
        error={updateQuestion.error}
        onSubmit={handleSubmit}
      />

      {updateQuestion.isSuccess ? (
        <p role="status" className="text-sm text-success">
          Изменения сохранены
        </p>
      ) : null}

      <Button variant="danger" onClick={() => setConfirmOpen(true)}>
        Удалить вопрос
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        title="Удалить вопрос?"
        description="Вопрос исчезнет вместе со всеми вариантами ответа. Отменить удаление нельзя."
        confirmLabel="Удалить"
        onConfirm={handleDelete}
        onClose={() => setConfirmOpen(false)}
        loading={deleteQuestion.isPending}
      />
    </div>
  )
}
