import { ChevronDown } from 'lucide-react'
import { useId } from 'react'

import {
  describedByProps,
  FIELD_ERROR,
  FIELD_HINT,
  FIELD_LABEL,
  fieldControlClasses,
} from '@/shared/ui/field-base'

export interface SelectOption {
  value: string
  label: string
}

interface SelectFieldProps {
  label: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  error?: string
  hint?: string
}

/** Native `<select>`: on a phone it opens the platform picker, which beats any custom list. */
export function SelectField({ label, value, options, onChange, error, hint }: SelectFieldProps) {
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
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          aria-invalid={error !== undefined}
          {...described}
          onChange={(event) => onChange(event.target.value)}
          className={`${fieldControlClasses(error !== undefined)} appearance-none pr-10`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-3 my-auto size-5 text-subtle"
        />
      </div>
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
