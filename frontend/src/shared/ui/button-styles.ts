export type ButtonVariant = 'primary' | 'secondary' | 'danger'

const BASE =
  'flex min-h-11 w-full items-center justify-center rounded-control px-4 py-3 font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-fg active:bg-primary-hover',
  secondary: 'border border-border bg-surface text-fg active:bg-surface-sunken',
  /** Destructive confirmation only — deleting a user, a subject, a lesson. */
  danger: 'bg-danger text-danger-fg active:bg-danger-hover',
}

/** Shared by `Button` and `LinkButton`, so an action looks the same either way. */
export function buttonClasses(variant: ButtonVariant): string {
  return `${BASE} ${VARIANTS[variant]}`
}
