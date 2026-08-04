import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
}

/** The single `h1` every screen gets — see style-guide.md §2. */
export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <header className="flex justify-between">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold text-fg">{title}</h1>
        </div>
        {description ? <p className="text-sm text-muted">{description}</p> : null}
      </div>
      {action}
    </header>
  )
}
