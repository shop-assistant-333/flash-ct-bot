import { useState } from 'react'
import type { FormEvent } from 'react'

import { fieldErrors } from '@/shared/lib/form-errors'
import { Button } from '@/shared/ui/button'
import { TextField } from '@/shared/ui/text-field'

interface SectionFormProps {
  initialTitle: string
  submitLabel: string
  pending: boolean
  /** Failure of the mutation the modal owns: validation lands on the field. */
  error: Error | null
  onSubmit: (title: string) => void
}

/** The one field a topic has — shared by «добавить» and «переименовать». */
export function SectionForm({
  initialTitle,
  submitLabel,
  pending,
  error,
  onSubmit,
}: SectionFormProps) {
  const [title, setTitle] = useState(initialTitle)
  const [emptyError, setEmptyError] = useState<string | undefined>(undefined)

  const fields = fieldErrors(error)
  const titleError = emptyError ?? fields.title

  function handleChange(value: string) {
    setTitle(value)
    setEmptyError(undefined)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = title.trim()

    if (trimmed === '') {
      setEmptyError('Введите название темы')
      return
    }

    onSubmit(trimmed)
  }

  // `noValidate` for the same reason as in the subject form: our own message,
  // not the browser bubble in the webview's language.
  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <TextField
        label="Название"
        value={title}
        required
        placeholder="Например, «Орфография»"
        onChange={handleChange}
        {...(titleError === undefined ? {} : { error: titleError })}
      />
      {error !== null && Object.keys(fields).length === 0 ? (
        <p className="text-sm text-danger">Не удалось сохранить тему. Попробуйте ещё раз</p>
      ) : null}
      <Button type="submit" loading={pending}>
        {submitLabel}
      </Button>
    </form>
  )
}
