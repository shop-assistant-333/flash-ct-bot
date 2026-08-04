import type { QuestionType } from '@/shared/api'

const TYPE_LABELS: Record<QuestionType, string> = {
  SINGLE_ANSWER: 'Один вариант',
  MULTI_ANSWER: 'Несколько вариантов',
  INPUT: 'Ввод ответа',
}

interface QuestionTypeBadgeProps {
  type: QuestionType
}

export function QuestionTypeBadge({ type }: QuestionTypeBadgeProps) {
  return (
    <span className="rounded-control bg-surface-sunken px-2 py-0.5 text-xs text-muted">
      {TYPE_LABELS[type]}
    </span>
  )
}
