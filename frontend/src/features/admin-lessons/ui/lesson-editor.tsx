import { ChevronLeft, SearchX, WifiOff } from 'lucide-react'
import { Link } from 'react-router'

import { isApiError } from '@/shared/api'
import { Spinner } from '@/shared/ui/spinner'
import { StateMessage } from '@/shared/ui/state-message'

import { useAdminLesson } from '../hooks/use-admin-lesson'
import { LessonDelete } from './lesson-delete'
import { LessonForm } from './lesson-form'
import { LessonQuestions } from './lesson-questions'

interface LessonEditorProps {
  lessonId: number
  /** The subject is known only once the lesson is loaded, hence the callbacks. */
  lessonsHrefOf: (subjectId: number) => string
  hrefOfQuestion: (questionId: number) => string
  newQuestionHref: string
  onDeleted: (subjectId: number) => void
}

/** One lesson: its fields, its questions and the way to delete it. */
export function LessonEditor({
  lessonId,
  lessonsHrefOf,
  hrefOfQuestion,
  newQuestionHref,
  onDeleted,
}: LessonEditorProps) {
  const lessonQuery = useAdminLesson(lessonId)

  if (lessonQuery.isPending) return <Spinner />

  if (lessonQuery.isError) {
    const { error } = lessonQuery

    if (isApiError(error) && error.is('NOT_FOUND')) {
      return (
        <StateMessage
          icon={SearchX}
          title="Урок не найден"
          description="Возможно, его уже удалили — откройте список уроков предмета"
        />
      )
    }

    return (
      <StateMessage
        icon={WifiOff}
        title="Не удалось загрузить урок"
        description="Проверьте соединение и попробуйте ещё раз"
        action={{ label: 'Повторить', onClick: () => void lessonQuery.refetch() }}
      />
    )
  }

  const lesson = lessonQuery.data

  return (
    <div className="flex flex-col gap-6">
      <Link
        to={lessonsHrefOf(lesson.subjectId)}
        className="-ml-1 flex min-h-11 items-center gap-1 self-start text-sm text-muted"
      >
        <ChevronLeft aria-hidden className="size-4" />
        Все уроки
      </Link>

      <LessonForm lesson={lesson} />

      <LessonQuestions
        lessonId={lesson.id}
        questions={lesson.questions}
        hrefOfQuestion={hrefOfQuestion}
        newQuestionHref={newQuestionHref}
      />

      <LessonDelete
        lessonId={lesson.id}
        subjectId={lesson.subjectId}
        onDeleted={() => onDeleted(lesson.subjectId)}
      />
    </div>
  )
}
