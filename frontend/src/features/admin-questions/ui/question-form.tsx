import { useState } from 'react'
import type { FormEvent } from 'react'

import { isApiError } from '@/shared/api'
import { fieldErrors } from '@/shared/lib/form-errors'
import { Button } from '@/shared/ui/button'
import { SelectField } from '@/shared/ui/select-field'
import { TextField } from '@/shared/ui/text-field'
import { TextareaField } from '@/shared/ui/textarea-field'

import { errorProp } from '../lib/error-prop'
import { QUESTION_TYPE_OPTIONS, toQuestionType } from '../lib/question-type'
import {
  normalizeOptions,
  validateQuestion,
  type OptionDraft,
  type QuestionValues,
} from '../lib/question-values'
import { AnswerOptionsEditor } from './answer-options-editor'

interface QuestionFormProps {
  initialValues: QuestionValues
  submitLabel: string
  submitting: boolean
  /** Failure of the last save: field messages go under the fields, the rest above the button. */
  error: unknown
  onSubmit: (values: QuestionValues) => void
}

/** Anything but a failed validation is shown as one line — codes are not for the admin. */
function generalMessage(error: unknown): string | undefined {
  if (error === null || error === undefined) return undefined
  if (isApiError(error) && error.is('VALIDATION_FAILED')) return undefined
  return 'Не удалось сохранить вопрос. Проверьте соединение и попробуйте ещё раз'
}

/** The editor itself — shared by the "new question" and "edit question" screens. */
export function QuestionForm({
  initialValues,
  submitLabel,
  submitting,
  error,
  onSubmit,
}: QuestionFormProps) {
  // A form is a draft, not server state: it starts from `initialValues` and the
  // owner remounts it (`key`) when a different question is loaded.
  const [values, setValues] = useState(initialValues)
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({})

  const errors = { ...localErrors, ...fieldErrors(error) }
  const general = generalMessage(error)
  const withOptions = values.type !== 'INPUT'

  const handleTypeChange = (value: string) => {
    const type = toQuestionType(value)
    setValues((current) => ({
      ...current,
      type,
      options: normalizeOptions(current.options, type),
    }))
  }

  const handleOptionsChange = (options: OptionDraft[]) => {
    setValues((current) => ({ ...current, options }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const found = validateQuestion(values)
    setLocalErrors(found)
    if (Object.keys(found).length > 0) return

    onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <TextareaField
        label="Текст вопроса"
        value={values.title}
        onChange={(title) => setValues((current) => ({ ...current, title }))}
        required
        rows={3}
        {...errorProp(errors.title)}
      />

      <SelectField
        label="Тип вопроса"
        value={values.type}
        options={QUESTION_TYPE_OPTIONS}
        onChange={handleTypeChange}
        {...errorProp(errors.type)}
      />

      {withOptions ? (
        <AnswerOptionsEditor
          options={values.options}
          single={values.type === 'SINGLE_ANSWER'}
          onChange={handleOptionsChange}
          {...errorProp(errors.options)}
        />
      ) : (
        <TextField
          label="Правильный ответ"
          value={values.correctAnswer}
          onChange={(correctAnswer) => setValues((current) => ({ ...current, correctAnswer }))}
          required
          hint="Ответ сравнивается без учёта регистра — достаточно одного написания"
          {...errorProp(errors.correctAnswer)}
        />
      )}

      <TextareaField
        label="Пояснение"
        value={values.explanation}
        onChange={(explanation) => setValues((current) => ({ ...current, explanation }))}
        hint="Студент видит его сразу после ответа на вопрос"
        {...errorProp(errors.explanation)}
      />

      {general === undefined ? null : (
        <p role="alert" className="text-sm text-danger">
          {general}
        </p>
      )}

      <Button type="submit" loading={submitting}>
        {submitLabel}
      </Button>
    </form>
  )
}
