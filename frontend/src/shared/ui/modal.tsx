import { X } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

/**
 * Bottom sheet — the one overlay of the app (style guide §3: `rounded-sheet`,
 * `shadow-pop`). Closes on the backdrop and on Escape; the backdrop is a real
 * button so it is reachable without a pointer.
 */
export function Modal({ open, title, onClose, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  // Escape and the scroll lock are both properties of the document, not of the
  // panel — hence an effect with a cleanup that restores the page as it was.
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  // Move the focus off the trigger and into the sheet, so the next Tab stays
  // inside it and a screen reader announces the dialog.
  useEffect(() => {
    if (open) panelRef.current?.focus()
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center">
      <button
        type="button"
        aria-label="Закрыть"
        onClick={onClose}
        className="absolute inset-0 bg-overlay"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative max-h-full w-full max-w-app overflow-y-auto rounded-t-sheet bg-surface-raised pt-4 px-gutter pb-safe shadow-pop"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className="text-lg font-semibold text-fg">
            {title}
          </h2>
          <button
            type="button"
            aria-label="Закрыть"
            onClick={onClose}
            className="-mt-1 -mr-2 flex size-11 shrink-0 items-center justify-center rounded-full text-subtle transition-colors duration-150 active:bg-surface-sunken"
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>
        <div className="pt-3 pb-6">{children}</div>
      </div>
    </div>
  )
}
