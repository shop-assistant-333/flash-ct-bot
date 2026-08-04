import { ChevronLeft, ChevronRight } from 'lucide-react'

interface UsersPaginationProps {
  /** Zero-based, as the backend counts it. */
  page: number
  totalPages: number
  onChange: (page: number) => void
}

const NAV_BUTTON =
  'flex size-11 items-center justify-center rounded-control border border-border bg-surface text-fg transition-colors duration-150 active:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-50'

export function UsersPagination({ page, totalPages, onChange }: UsersPaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav aria-label="Страницы списка" className="flex items-center justify-between gap-3">
      <button
        type="button"
        aria-label="Предыдущая страница"
        disabled={page <= 0}
        onClick={() => onChange(page - 1)}
        className={NAV_BUTTON}
      >
        <ChevronLeft aria-hidden className="size-5" />
      </button>
      <span className="text-sm text-muted tabular-nums">
        {page + 1} из {totalPages}
      </span>
      <button
        type="button"
        aria-label="Следующая страница"
        disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}
        className={NAV_BUTTON}
      >
        <ChevronRight aria-hidden className="size-5" />
      </button>
    </nav>
  )
}
