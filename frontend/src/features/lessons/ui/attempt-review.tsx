import { AnswerFeedback } from '@/shared/ui/answer-feedback'
import { QuestionView } from '@/shared/ui/question-view'

import type { AttemptDto } from '../api/lessons-api'

interface AttemptReviewProps {
  attempt: AttemptDto
}

const noop = () => {}

/** A lesson is solved once, so a finished attempt opens read-only — API.md, «Вкладка ДЗ». */
export function AttemptReview({ attempt }: AttemptReviewProps) {
  const questions = attempt.lesson.questions
  const answers = new Map(attempt.answers.map((answer) => [answer.questionId, answer]))
  const correctCount = attempt.answers.filter((answer) => answer.correct).length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3 rounded-card bg-surface p-4 shadow-card">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted">Урок пройден</span>
          <span className="text-base font-medium text-fg">Разбор ответов</span>
        </div>
        <span className="text-2xl font-semibold text-fg tabular-nums">
          {correctCount} / {questions.length}
        </span>
      </div>

      <ol className="flex flex-col gap-8">
        {questions.map((question, index) => {
          const answer = answers.get(question.id)

          return (
            <li key={question.id} className="flex flex-col gap-3">
              <span className="text-xs text-subtle tabular-nums">
                Вопрос {index + 1} из {questions.length}
              </span>
              <QuestionView
                question={question}
                selectedOptionIds={answer?.selectedOptionIds ?? []}
                answerText={answer?.answerText ?? ''}
                verdict={answer}
                onToggleOption={noop}
                onChangeText={noop}
              />
              {answer ? <AnswerFeedback verdict={answer} /> : null}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
