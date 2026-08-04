import { Check, X } from 'lucide-react'

import type { AnswerVerdict } from '@/shared/ui/question-view'

interface AnswerFeedbackProps {
  verdict: AnswerVerdict
}

/** Verdict + explanation shown after an answer — announced to screen readers. */
export function AnswerFeedback({ verdict }: AnswerFeedbackProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col gap-2 rounded-control bg-surface-sunken p-3"
    >
      <div
        className={`flex items-center gap-2 text-sm font-medium ${
          verdict.correct ? 'text-success' : 'text-danger'
        }`}
      >
        {verdict.correct ? (
          <Check aria-hidden className="size-4" />
        ) : (
          <X aria-hidden className="size-4" />
        )}
        <span>{verdict.correct ? 'Верно' : 'Неверно'}</span>
      </div>
      {!verdict.correct && verdict.correctAnswer ? (
        <p className="text-sm text-muted">Правильный ответ: {verdict.correctAnswer}</p>
      ) : null}
      {verdict.explanation ? <p className="text-sm text-muted">{verdict.explanation}</p> : null}
    </div>
  )
}
