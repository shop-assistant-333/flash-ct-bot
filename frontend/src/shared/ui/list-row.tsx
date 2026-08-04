import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'

interface ListRowProps {
  title: string
  subtitle?: string
  /** Badges, counters — anything that belongs under the subtitle. */
  meta?: ReactNode
  /** Right-hand side; a chevron is drawn instead when the row is a link. */
  trailing?: ReactNode
  to?: string
  onClick?: () => void
}

const ROW =
  'flex min-h-11 w-full items-center justify-between gap-3 rounded-card bg-surface p-3 text-left text-sm shadow-card transition-colors duration-150'

/** Row of any admin list — style guide §6: same card, denser padding. */
export function ListRow({ title, subtitle, meta, trailing, to, onClick }: ListRowProps) {
  const content = (
    <>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate font-medium text-fg">{title}</span>
        {subtitle === undefined ? null : <span className="text-xs text-muted">{subtitle}</span>}
        {meta === undefined ? null : <span className="flex flex-wrap gap-1 pt-0.5">{meta}</span>}
      </span>
      <span className="flex shrink-0 items-center gap-2">
        {trailing}
        {to !== undefined && trailing === undefined ? (
          <ChevronRight aria-hidden className="size-5 text-subtle" />
        ) : null}
      </span>
    </>
  )

  if (to !== undefined) {
    return (
      <Link to={to} className={`${ROW} active:bg-surface-sunken`}>
        {content}
      </Link>
    )
  }

  if (onClick !== undefined) {
    return (
      <button type="button" onClick={onClick} className={`${ROW} active:bg-surface-sunken`}>
        {content}
      </button>
    )
  }

  return <div className={ROW}>{content}</div>
}
