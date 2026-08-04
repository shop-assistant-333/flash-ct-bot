import type { SubscriptionItem } from '@/shared/api'

import { formatDate } from '../lib/user-format'

interface SubscriptionRowProps {
  subscription: SubscriptionItem
  onExtend: () => void
  onRevoke: () => void
}

const ACTION =
  'min-h-11 rounded-control px-3 text-sm font-medium transition-colors duration-150 active:bg-surface-sunken'

export function SubscriptionRow({ subscription, onExtend, onRevoke }: SubscriptionRowProps) {
  return (
    <li className="flex flex-col gap-2 rounded-card bg-surface p-3 shadow-card">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-sm font-medium text-fg">{subscription.subjectName}</span>
        <span className={`text-xs ${subscription.active ? 'text-muted' : 'text-danger'}`}>
          {subscription.active ? 'Оплачено до' : 'Истекла'} {formatDate(subscription.paidUntil)}
        </span>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onExtend} className={`${ACTION} text-primary`}>
          Продлить
        </button>
        <button type="button" onClick={onRevoke} className={`${ACTION} text-danger`}>
          Отозвать
        </button>
      </div>
    </li>
  )
}
