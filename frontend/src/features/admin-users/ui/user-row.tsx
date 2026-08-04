import { ListRow } from '@/shared/ui/list-row'

import type { AdminUserItem } from '../api/admin-users-api'
import { userDisplayName } from '../lib/user-format'
import { SubscriptionBadge } from './subscription-badge'

interface UserRowProps {
  user: AdminUserItem
  href: string
}

function UserMeta({ user }: { user: AdminUserItem }) {
  return (
    <>
      {user.role === 'ADMIN' ? (
        <span className="inline-flex items-center rounded-control bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary-soft-fg">
          Администратор
        </span>
      ) : null}
      {user.subscriptions.map((subscription) => (
        <SubscriptionBadge key={subscription.subjectId} subscription={subscription} />
      ))}
      {user.subscriptions.length === 0 ? (
        <span className="text-xs text-subtle">Без подписок</span>
      ) : null}
      {user.tgId === '' ? <span className="text-xs text-subtle">· ещё не заходил</span> : null}
    </>
  )
}

export function UserRow({ user, href }: UserRowProps) {
  return (
    <li>
      <ListRow
        title={userDisplayName(user)}
        subtitle={`@${user.username}`}
        meta={<UserMeta user={user} />}
        to={href}
      />
    </li>
  )
}
