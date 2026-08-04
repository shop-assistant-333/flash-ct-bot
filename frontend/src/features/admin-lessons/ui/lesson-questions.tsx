import { ListChecks } from 'lucide-react'

import { LinkButton } from '@/shared/ui/link-button'
import { ListRow } from '@/shared/ui/list-row'
import { ReorderableList } from '@/shared/ui/reorderable-list'
import { StateMessage } from '@/shared/ui/state-message'

import type { AdminQuestionDto } from '../api/admin-lessons-api'
import { useReorderLessonQuestions } from '../hooks/use-reorder-lesson-questions'
import { QuestionTypeBadge } from './question-type-badge'

interface LessonQuestionsProps {
  lessonId: number
  questions: AdminQuestionDto[]
  hrefOfQuestion: (questionId: number) => string
  newQuestionHref: string
}

/** Questions of a lesson: their order is the order they are asked in. */
export function LessonQuestions({
  lessonId,
  questions,
  hrefOfQuestion,
  newQuestionHref,
}: LessonQuestionsProps) {
  const reorderQuestions = useReorderLessonQuestions(lessonId)

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-muted">Вопросы</h2>

      {questions.length === 0 ? (
        <StateMessage
          icon={ListChecks}
          title="Вопросов пока нет"
          description="Из вопросов складывается тест урока — добавьте первый"
        />
      ) : (
        <>
          {reorderQuestions.isError ? (
            <p className="text-sm text-danger">Не удалось сохранить порядок вопросов</p>
          ) : null}

          <ReorderableList
            items={questions}
            getId={(question) => question.id}
            disabled={reorderQuestions.isPending}
            onReorder={(ids) => reorderQuestions.mutate(ids)}
            renderItem={(question, index) => (
              <ListRow
                title={`${index + 1}. ${question.title}`}
                meta={<QuestionTypeBadge type={question.type} />}
                to={hrefOfQuestion(question.id)}
              />
            )}
          />
        </>
      )}

      <LinkButton to={newQuestionHref} variant="secondary">
        Добавить вопрос
      </LinkButton>
    </section>
  )
}
