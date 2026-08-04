interface CheckboxFieldProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

/**
 * The whole row is the label, so the tap target is the full width and at least
 * 44px tall — style guide §3.
 */
export function CheckboxField({ label, checked, onChange, disabled = false }: CheckboxFieldProps) {
  return (
    <label
      className={`flex min-h-11 items-center gap-3 text-base text-fg ${
        disabled ? 'cursor-not-allowed opacity-50' : ''
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="size-5 shrink-0 accent-primary"
      />
      <span>{label}</span>
    </label>
  )
}
