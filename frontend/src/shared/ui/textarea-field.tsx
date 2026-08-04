import { useId } from 'react'

import {
  describedByProps,
  FIELD_ERROR,
  FIELD_HINT,
  FIELD_LABEL,
  fieldControlClasses,
} from '@/shared/ui/field-base'

interface TextareaFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  hint?: string
  required?: boolean
  placeholder?: string
  rows?: number
}

/** Multi-line twin of {@link TextField}: lesson descriptions, explanations. */
export function TextareaField({
  label,
  value,
  onChange,
  error,
  hint,
  required = false,
  placeholder,
  rows = 4,
}: TextareaFieldProps) {
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
      <textarea
        id={id}
        rows={rows}
        value={value}
        required={required}
        placeholder={placeholder}
        aria-invalid={error !== undefined}
        {...described}
        onChange={(event) => onChange(event.target.value)}
        className={`${fieldControlClasses(error !== undefined)} resize-y`}
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
