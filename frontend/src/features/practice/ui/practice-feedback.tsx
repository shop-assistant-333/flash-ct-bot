import { Check, X } from 'lucide-react'

import type { AnswerResultDto } from '../api/practice-api'

interface PracticeFeedbackProps {
  result: AnswerResultDto
}

/** Verdict + explanation shown after an answer — announced to screen readers. */
export function PracticeFeedback({ result }: PracticeFeedbackProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col gap-2 rounded-control bg-surface-sunken p-3"
    >
      <div
        className={`flex items-center gap-2 text-sm font-medium ${
          result.correct ? 'text-success' : 'text-danger'
        }`}
      >
        {result.correct ? (
          <Check aria-hidden className="size-4" />
        ) : (
          <X aria-hidden className="size-4" />
        )}
        <span>{result.correct ? 'Верно' : 'Неверно'}</span>
      </div>
      {!result.correct && result.correctAnswer ? (
        <p className="text-sm text-muted">Правильный ответ: {result.correctAnswer}</p>
      ) : null}
      {result.explanation ? <p className="text-sm text-muted">{result.explanation}</p> : null}
    </div>
  )
}
