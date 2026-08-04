import { Button } from '@/shared/ui/button'
import { Modal } from '@/shared/ui/modal'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void
  onClose: () => void
  loading?: boolean
}

/** The one confirmation of a destructive action — every delete goes through it. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onClose,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted">{description}</p>
        <div className="flex flex-col gap-2">
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Отмена
          </Button>
        </div>
      </div>
    </Modal>
  )
}
