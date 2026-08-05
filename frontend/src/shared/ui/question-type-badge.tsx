import type { QuestionType } from '@/shared/api'
import { QUESTION_TYPE_LABEL } from '@/shared/lib/question-type'

interface QuestionTypeBadgeProps {
  type: QuestionType
}

export function QuestionTypeBadge({ type }: QuestionTypeBadgeProps) {
  return (
    <span className="rounded-control bg-surface-sunken px-2 py-0.5 text-xs text-muted">
      {QUESTION_TYPE_LABEL[type]}
    </span>
  )
}
