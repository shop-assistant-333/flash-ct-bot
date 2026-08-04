import { useState } from 'react'

import { Button } from '@/shared/ui/button'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'

import { useDeleteUser } from '../hooks/use-delete-user'

interface DeleteUserButtonProps {
  userId: number
  /** Shown in the confirmation, so the admin sees who exactly is about to go. */
  userName: string
  onDeleted: () => void
}

export function DeleteUserButton({ userId, userName, onDeleted }: DeleteUserButtonProps) {
  const [confirming, setConfirming] = useState(false)
  const deleteUser = useDeleteUser(userId)

  function handleConfirm() {
    deleteUser.mutate(undefined, {
      onSuccess: () => {
        setConfirming(false)
        onDeleted()
      },
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <Button variant="danger" onClick={() => setConfirming(true)}>
        Удалить пользователя
      </Button>
      {deleteUser.isError ? (
        <p className="text-sm text-danger">Не удалось удалить пользователя</p>
      ) : null}

      <ConfirmDialog
        open={confirming}
        title="Удалить пользователя?"
        description={`${userName} потеряет доступ к приложению, вместе с ним пропадут его подписки и прогресс.`}
        confirmLabel="Удалить"
        onConfirm={handleConfirm}
        onClose={() => setConfirming(false)}
        loading={deleteUser.isPending}
      />
    </div>
  )
}
