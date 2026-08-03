import { BookX } from 'lucide-react'

import type { SubscriptionItem } from '../api/profile-api'
import { SubscriptionListItem } from './subscription-list-item'

interface SubscriptionListProps {
  subscriptions: SubscriptionItem[]
}

export function SubscriptionList({ subscriptions }: SubscriptionListProps) {
  if (subscriptions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-card bg-surface p-6 text-center shadow-card">
        <BookX aria-hidden className="size-6 text-subtle" />
        <p className="text-base font-medium text-fg">Нет подключённых предметов</p>
        <p className="text-sm text-muted">Доступ откроется после оплаты</p>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {subscriptions.map((subscription) => (
        <SubscriptionListItem key={subscription.subjectId} subscription={subscription} />
      ))}
    </ul>
  )
}
