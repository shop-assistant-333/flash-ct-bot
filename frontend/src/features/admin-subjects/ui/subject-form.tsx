import { useState } from 'react'
import type { FormEvent } from 'react'

import { fieldErrors } from '@/shared/lib/form-errors'
import { Button } from '@/shared/ui/button'
import { TextField } from '@/shared/ui/text-field'

interface SubjectFormProps {
  initialName: string
  submitLabel: string
  pending: boolean
  /** Failure of the mutation the modal owns: validation lands on the field. */
  error: Error | null
  onSubmit: (name: string) => void
}

/** The one field a subject has — shared by "добавить" and "переименовать". */
export function SubjectForm({
  initialName,
  submitLabel,
  pending,
  error,
  onSubmit,
}: SubjectFormProps) {
  const [name, setName] = useState(initialName)
  const [emptyError, setEmptyError] = useState<string | undefined>(undefined)

  const fields = fieldErrors(error)
  const nameError = emptyError ?? fields.name

  function handleChange(value: string) {
    setName(value)
    setEmptyError(undefined)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = name.trim()

    if (trimmed === '') {
      setEmptyError('Введите название предмета')
      return
    }

    onSubmit(trimmed)
  }

  // `noValidate`: an empty name is reported by our own Russian message, not by
  // the browser bubble in whatever language the webview happens to run in.
  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <TextField
        label="Название"
        value={name}
        required
        placeholder="Например, Математика"
        onChange={handleChange}
        {...(nameError === undefined ? {} : { error: nameError })}
      />
      {error !== null && Object.keys(fields).length === 0 ? (
        <p className="text-sm text-danger">Не удалось сохранить предмет. Попробуйте ещё раз</p>
      ) : null}
      <Button type="submit" loading={pending}>
        {submitLabel}
      </Button>
    </form>
  )
}
