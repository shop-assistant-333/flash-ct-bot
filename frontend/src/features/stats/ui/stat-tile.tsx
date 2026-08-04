import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface StatTileProps {
  icon: LucideIcon
  label: string
  value: string
  /** Строка под числом: дельта, прогресс-бар, пояснение. */
  hint?: ReactNode
}

/** Тайл сетки статистики: число крупно, всё остальное — тише. */
export function StatTile({ icon: Icon, label, value, hint }: StatTileProps) {
  return (
    <div className="flex flex-col gap-1 rounded-card bg-surface p-4 shadow-card">
      <div className="flex items-center gap-2 text-muted">
        <Icon aria-hidden className="size-4 shrink-0" />
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-2xl font-semibold text-fg tabular-nums">{value}</span>
      {hint}
    </div>
  )
}
