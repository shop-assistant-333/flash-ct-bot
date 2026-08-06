import type { SubscriptionItem } from '@/shared/api'

import { formatDate } from '../lib/format-date'
import { SubscriptionBadge } from './subscription-badge'

interface SubscriptionListItemProps {
  subscription: SubscriptionItem
}

export function SubscriptionListItem({ subscription }: SubscriptionListItemProps) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-card bg-surface p-4 shadow-card">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-base font-medium text-fg">{subscription.subjectName}</span>
        <span className="text-sm text-muted">оплачено до {formatDate(subscription.paidUntil)}</span>
      </div>
      <SubscriptionBadge subscription={subscription} />
    </li>
  )
}
