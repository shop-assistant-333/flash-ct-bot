import { useState } from 'react'

import type { LocalDateTime, SubscriptionItem } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'

import { useRevokeSubscription } from '../hooks/use-revoke-subscription'
import { useSaveSubscription } from '../hooks/use-save-subscription'
import { SubscriptionModal, type SubjectOption } from './subscription-modal'
import { SubscriptionRow } from './subscription-row'

interface SubscriptionsSectionProps {
  userId: number
  subscriptions: SubscriptionItem[]
  /** Comes from the subjects feature through the page — features stay unaware of each other. */
  subjects: SubjectOption[]
}

/** Payment happens outside the app, so dates are granted and revoked by hand. */
export function SubscriptionsSection({
  userId,
  subscriptions,
  subjects,
}: SubscriptionsSectionProps) {
  const [editing, setEditing] = useState<{ subscription: SubscriptionItem | null } | null>(null)
  const [revoking, setRevoking] = useState<SubscriptionItem | null>(null)

  const saveSubscription = useSaveSubscription(userId)
  const revokeSubscription = useRevokeSubscription(userId)

  function closeEditor() {
    setEditing(null)
    saveSubscription.reset()
  }

  function handleSave(subjectId: number, paidUntil: LocalDateTime) {
    saveSubscription.mutate({ subjectId, paidUntil }, { onSuccess: closeEditor })
  }

  function handleRevoke() {
    if (revoking === null) return

    revokeSubscription.mutate(revoking.subjectId, {
      onSuccess: () => setRevoking(null),
    })
  }

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-medium text-muted">Подписки</h2>

      {subscriptions.length === 0 ? (
        <p className="rounded-card bg-surface p-3 text-sm text-muted shadow-card">
          Подписок нет — ученик пока не видит ни одного предмета
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {subscriptions.map((subscription) => (
            <SubscriptionRow
              key={subscription.subjectId}
              subscription={subscription}
              onExtend={() => setEditing({ subscription })}
              onRevoke={() => setRevoking(subscription)}
            />
          ))}
        </ul>
      )}

      {revokeSubscription.isError ? (
        <p className="text-sm text-danger">Не удалось отозвать подписку</p>
      ) : null}

      <Button variant="secondary" onClick={() => setEditing({ subscription: null })}>
        Выдать доступ
      </Button>

      {editing === null ? null : (
        <SubscriptionModal
          subjects={subjects}
          subscription={editing.subscription}
          onSubmit={handleSave}
          onClose={closeEditor}
          saving={saveSubscription.isPending}
          error={saveSubscription.error}
        />
      )}

      <ConfirmDialog
        open={revoking !== null}
        title="Отозвать подписку?"
        description={
          revoking === null
            ? ''
            : `Ученик потеряет доступ к предмету «${revoking.subjectName}» и его урокам.`
        }
        confirmLabel="Отозвать"
        onConfirm={handleRevoke}
        onClose={() => setRevoking(null)}
        loading={revokeSubscription.isPending}
      />
    </section>
  )
}
