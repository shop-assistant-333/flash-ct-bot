import { ListChecks } from 'lucide-react'
import { useEffect, useState } from 'react'

import type { AdminQuestionDto, LessonKind } from '@/shared/api'
import { questionAnchorId } from '@/shared/lib/question-anchor'
import { LinkButton } from '@/shared/ui/link-button'
import { ListRow } from '@/shared/ui/list-row'
import { QuestionTypeBadge } from '@/shared/ui/question-type-badge'
import { ReorderableList } from '@/shared/ui/reorderable-list'
import { StateMessage } from '@/shared/ui/state-message'

import { useReorderLessonQuestions } from '../hooks/use-reorder-lesson-questions'

interface LessonQuestionsProps {
  lessonId: number
  kind: LessonKind
  questions: AdminQuestionDto[]
  /** The question the teacher came back from: scrolled to and briefly highlighted. */
  focusQuestionId: number | undefined
  hrefs: {
    question: (questionId: number) => string
    newQuestion: string
  }
}

const HIGHLIGHT_MS = 1600

/** Questions of a lesson: their order is the order they are asked in. */
export function LessonQuestions({
  lessonId,
  kind,
  questions,
  focusQuestionId,
  hrefs,
}: LessonQuestionsProps) {
  const reorderQuestions = useReorderLessonQuestions(lessonId)
  // The highlight is derived from the focus and switched off by a timer, so no
  // state has to be copied from the props.
  const [fadedId, setFadedId] = useState<number | undefined>(undefined)
  const highlightedId = focusQuestionId === fadedId ? undefined : focusQuestionId

  // Scrolling is a side effect on the document. The rows are already rendered —
  // the editor mounts this list only once the lesson is loaded — so it runs once
  // per focus, after the router's own hash handling (a layout effect) is done.
  useEffect(() => {
    if (focusQuestionId === undefined) return

    document.getElementById(questionAnchorId(focusQuestionId))?.scrollIntoView({ block: 'center' })
    const timer = window.setTimeout(() => setFadedId(focusQuestionId), HIGHLIGHT_MS)
    return () => window.clearTimeout(timer)
  }, [focusQuestionId])

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-muted">Вопросы</h2>

      <LinkButton to={hrefs.newQuestion} variant="secondary">
        Добавить вопрос
      </LinkButton>

      {questions.length === 0 ? (
        <StateMessage
          icon={ListChecks}
          title="Вопросов пока нет"
          description={
            kind === 'TEST'
              ? 'Из вопросов складывается тест — добавьте первый'
              : 'Из вопросов складывается тест урока — добавьте первый'
          }
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
              <div
                id={questionAnchorId(question.id)}
                className={`rounded-card ${question.id === highlightedId ? 'ring-2 ring-primary' : ''}`}
              >
                <ListRow
                  title={`${index + 1}. ${question.title}`}
                  meta={<QuestionTypeBadge type={question.type} />}
                  to={hrefs.question(question.id)}
                />
              </div>
            )}
          />
        </>
      )}
    </section>
  )
}
