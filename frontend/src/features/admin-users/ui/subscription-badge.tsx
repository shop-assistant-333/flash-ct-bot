import { Check, X } from 'lucide-react'

import type { SubscriptionItem } from '@/shared/api'

import { formatDate } from '../lib/user-format'

interface SubscriptionBadgeProps {
  subscription: SubscriptionItem
}

/**
 * Subject and paid-through date in one chip: in the list the admin has to see
 * at a glance who is paid up and until when.
 */
export function SubscriptionBadge({ subscription }: SubscriptionBadgeProps) {
  const { active, subjectName, paidUntil } = subscription
  const Icon = active ? Check : X

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-control px-2 py-0.5 text-xs font-medium ${
        active ? 'bg-success-soft text-success-soft-fg' : 'bg-danger-soft text-danger-soft-fg'
      }`}
    >
      <Icon aria-hidden className="size-3.5" />
      {subjectName} · до {formatDate(paidUntil)}
    </span>
  )
}
