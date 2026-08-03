import { Check, Clock, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { SubscriptionItem } from '../api/profile-api'
import { getSubscriptionStatus, type SubscriptionStatus } from '../lib/subscription-status'

interface SubscriptionBadgeProps {
  subscription: SubscriptionItem
}

const VARIANTS: Record<SubscriptionStatus, { label: string; icon: LucideIcon; className: string }> =
  {
    active: { label: 'Активна', icon: Check, className: 'bg-success-soft text-success-soft-fg' },
    expiring: { label: 'Истекает', icon: Clock, className: 'bg-warning-soft text-warning-soft-fg' },
    expired: { label: 'Истекла', icon: X, className: 'bg-danger-soft text-danger-soft-fg' },
  }

export function SubscriptionBadge({ subscription }: SubscriptionBadgeProps) {
  const status = getSubscriptionStatus(subscription)
  const variant = VARIANTS[status]
  const Icon = variant.icon

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-control px-2 py-1 text-xs font-medium ${variant.className}`}
    >
      <Icon aria-hidden className="size-3.5" />
      {variant.label}
    </span>
  )
}
