import { useId } from 'react'

import {
  describedByProps,
  FIELD_ERROR,
  FIELD_HINT,
  FIELD_LABEL,
  fieldControlClasses,
} from '@/shared/ui/field-base'

interface TextFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  /** Message from `fieldErrors(error)` or from local validation. */
  error?: string
  /** Explanation shown under the field while it is valid. */
  hint?: string
  required?: boolean
  placeholder?: string
  type?: 'text' | 'date' | 'datetime-local'
}

/** Single-line form control of the admin panel — style guide §6. */
export function TextField({
  label,
  value,
  onChange,
  error,
  hint,
  required = false,
  placeholder,
  type = 'text',
}: TextFieldProps) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const described = describedByProps([
    error === undefined ? undefined : errorId,
    hint === undefined ? undefined : hintId,
  ])

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className={FIELD_LABEL}>
        {label}
        {required ? <span aria-hidden> *</span> : null}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        aria-invalid={error !== undefined}
        {...described}
        onChange={(event) => onChange(event.target.value)}
        className={fieldControlClasses(error !== undefined)}
      />
      {hint === undefined ? null : (
        <p id={hintId} className={FIELD_HINT}>
          {hint}
        </p>
      )}
      {error === undefined ? null : (
        <p id={errorId} className={FIELD_ERROR}>
          {error}
        </p>
      )}
    </div>
  )
}
