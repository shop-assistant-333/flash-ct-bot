import { LoaderCircle } from 'lucide-react'
import type { ReactNode } from 'react'

import { buttonClasses, type ButtonVariant } from '@/shared/ui/button-styles'

interface ButtonProps {
  children: ReactNode
  /** Optional: a `submit` button is driven by the `<form onSubmit>` around it. */
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: ButtonVariant
  disabled?: boolean
  /** Swaps the label for a spinner without changing the button size — style guide §4. */
  loading?: boolean
}

/** The one button of the app: the single main action of a screen uses `primary`. */
export function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  loading = false,
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={buttonClasses(variant)}
    >
      {loading ? <LoaderCircle aria-hidden className="size-5 animate-spin" /> : children}
    </button>
  )
}
