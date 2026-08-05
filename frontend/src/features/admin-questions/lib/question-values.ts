import type { AdminQuestionDto, QuestionType } from '@/shared/api'

import type { AnswerOptionRequest, QuestionRequest } from '../api/admin-questions-api'

/**
 * Draft of one answer option. A freshly added option has no backend id yet, so
 * the list needs a key of its own — the index would break on reordering.
 */
export interface OptionDraft {
  key: string
  id: number | null
  text: string
  correct: boolean
}

export interface QuestionValues {
  title: string
  type: QuestionType
  correctAnswer: string
  explanation: string
  options: OptionDraft[]
}

/** A question belongs either to a lesson or straight to a subject — never both. */
export type QuestionOwner = { lessonId: number } | { subjectId: number }

let newOptionCount = 0

/** Counter, not a random id: the key only has to be unique inside one form. */
export function emptyOption(): OptionDraft {
  newOptionCount += 1
  return { key: `new-${newOptionCount}`, id: null, text: '', correct: false }
}

export function emptyQuestionValues(): QuestionValues {
  return {
    title: '',
    type: 'SINGLE_ANSWER',
    correctAnswer: '',
    explanation: '',
    options: [emptyOption(), emptyOption()],
  }
}

export function questionToValues(question: AdminQuestionDto): QuestionValues {
  return {
    title: question.title,
    type: question.type,
    correctAnswer: question.correctAnswer ?? '',
    explanation: question.explanation,
    options: question.options.map((option) => ({
      key: `saved-${option.id}`,
      id: option.id,
      text: option.text,
      correct: option.correct,
    })),
  }
}

export function questionOwner(question: AdminQuestionDto): QuestionOwner | undefined {
  if (question.lessonId !== null) return { lessonId: question.lessonId }
  if (question.subjectId !== null) return { subjectId: question.subjectId }
  return undefined
}

/**
 * SINGLE_ANSWER allows exactly one correct option: switching over from
 * MULTI_ANSWER keeps the options themselves and drops every mark but the first.
 */
export function normalizeOptions(options: OptionDraft[], type: QuestionType): OptionDraft[] {
  if (type !== 'SINGLE_ANSWER') return options

  const first = options.findIndex((option) => option.correct)
  return options.map((option, index) => ({ ...option, correct: index === first }))
}

export function withCorrectMark(
  options: OptionDraft[],
  key: string,
  correct: boolean,
  single: boolean,
): OptionDraft[] {
  return options.map((option) => {
    if (option.key === key) return { ...option, correct }
    // Marking one option correct in a single-answer question unmarks the rest.
    return single && correct ? { ...option, correct: false } : option
  })
}

/** Client-side guard against the four requests the backend would reject anyway. */
export function validateQuestion(values: QuestionValues): Record<string, string> {
  const errors: Record<string, string> = {}

  if (values.title.trim() === '') {
    errors.title = 'Введите текст вопроса'
  }

  if (values.type === 'INPUT') {
    if (values.correctAnswer.trim() === '') {
      errors.correctAnswer = 'Укажите правильный ответ'
    }
    return errors
  }

  const filled = values.options.filter((option) => option.text.trim() !== '')
  if (filled.length < 2) {
    errors.options = 'Нужно минимум два варианта ответа'
  } else if (!filled.some((option) => option.correct)) {
    errors.options = 'Отметьте хотя бы один правильный вариант'
  }

  return errors
}

function toOptionRequest(option: OptionDraft): AnswerOptionRequest {
  const body: AnswerOptionRequest = { text: option.text.trim(), correct: option.correct }
  // No id means "new option", and `exactOptionalPropertyTypes` forbids sending
  // the key with an explicit `undefined`.
  return option.id === null ? body : { ...body, id: option.id }
}

/**
 * `order` is passed only when the question already has a place in its list:
 * a new question goes to the end, an edited one keeps the order the admin set.
 */
export function toQuestionRequest(
  values: QuestionValues,
  owner: QuestionOwner,
  order?: number,
): QuestionRequest {
  const base: QuestionRequest = {
    ...owner,
    title: values.title.trim(),
    type: values.type,
    explanation: values.explanation.trim(),
    ...(order === undefined ? {} : { order }),
  }

  if (values.type === 'INPUT') {
    return { ...base, correctAnswer: values.correctAnswer.trim() }
  }

  return {
    ...base,
    options: values.options
      .filter((option) => option.text.trim() !== '')
      .map((option) => toOptionRequest(option)),
  }
}
