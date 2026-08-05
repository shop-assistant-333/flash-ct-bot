import type { QuestionType } from '@/shared/api'

export const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  SINGLE_ANSWER: 'Один вариант',
  MULTI_ANSWER: 'Несколько вариантов',
  INPUT: 'Ввод ответа',
}
