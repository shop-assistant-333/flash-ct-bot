import type { LucideIcon } from 'lucide-react'

interface PracticeStateMessageProps {
  icon: LucideIcon
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}

/** Empty / no-access / load-error placeholder — style guide §4 "пустое состояние". */
export function PracticeStateMessage({
  icon: Icon,
  title,
  description,
  action,
}: PracticeStateMessageProps) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <Icon aria-hidden className="size-8 text-subtle" />
      <p className="text-base font-medium text-fg">{title}</p>
      <p className="text-sm text-muted">{description}</p>
      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-2 min-h-11 rounded-control border border-border bg-surface px-4 py-2 font-semibold text-fg transition-colors duration-150 active:bg-surface-sunken"
        >
          {action.label}
        </button>
      ) : null}
    </div>
  )
}
