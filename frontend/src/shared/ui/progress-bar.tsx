interface ProgressBarProps {
  value: number
  max: number
  label: string
}

/** Thin progress line — style guide §6 ("Прохождение теста"). */
export function ProgressBar({ value, max, label }: ProgressBarProps) {
  const percent = max === 0 ? 0 : Math.round((Math.min(value, max) / max) * 100)

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className="h-1 w-full overflow-hidden rounded-full bg-surface-sunken"
    >
      {/* The only inline style in the app: the width is data, not styling, and a
          utility class cannot carry a runtime value. */}
      <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
    </div>
  )
}
