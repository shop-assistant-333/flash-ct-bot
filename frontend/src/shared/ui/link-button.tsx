import type { ReactNode } from 'react'
import { Link } from 'react-router'

import { buttonClasses, type ButtonVariant } from '@/shared/ui/button-styles'

interface LinkButtonProps {
  children: ReactNode
  to: string
  variant?: ButtonVariant
}

/** A navigation that looks like a button — stays a link, so it is still a link. */
export function LinkButton({ children, to, variant = 'primary' }: LinkButtonProps) {
  return (
    <Link to={to} className={buttonClasses(variant)}>
      {children}
    </Link>
  )
}
