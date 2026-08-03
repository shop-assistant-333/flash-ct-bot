interface PageHeaderProps {
  title: string
  description?: string
}

/** The single `h1` every screen gets — see style-guide.md §2. */
export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-1">
      <h1 className="text-xl font-semibold text-fg">{title}</h1>
      {description ? <p className="text-sm text-muted">{description}</p> : null}
    </header>
  )
}
