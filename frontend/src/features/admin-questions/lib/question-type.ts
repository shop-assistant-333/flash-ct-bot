import type { QuestionType } from '@/shared/api'
import type { SelectOption } from '@/shared/ui/select-field'

export const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  SINGLE_ANSWER: 'Один вариант',
  MULTI_ANSWER: 'Несколько вариантов',
  INPUT: 'Ввод ответа',
}

export const QUESTION_TYPE_OPTIONS: SelectOption[] = [
  { value: 'SINGLE_ANSWER', label: QUESTION_TYPE_LABEL.SINGLE_ANSWER },
  { value: 'MULTI_ANSWER', label: QUESTION_TYPE_LABEL.MULTI_ANSWER },
  { value: 'INPUT', label: QUESTION_TYPE_LABEL.INPUT },
]

/** `<select>` hands back a plain string; this narrows it without a cast. */
export function toQuestionType(value: string): QuestionType {
  return value === 'MULTI_ANSWER' || value === 'INPUT' ? value : 'SINGLE_ANSWER'
}
