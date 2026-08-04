import { SearchX, Users, WifiOff } from 'lucide-react'

import { Spinner } from '@/shared/ui/spinner'
import { StateMessage } from '@/shared/ui/state-message'

import type { AdminUserItem } from '../api/admin-users-api'
import { useAdminUsers } from '../hooks/use-admin-users'
import { UserRow } from './user-row'
import { UsersPagination } from './users-pagination'

interface UsersListProps {
  search: string
  page: number
  onPageChange: (page: number) => void
  /** Routing belongs to the page: the feature only asks for a user's address. */
  hrefOf: (user: AdminUserItem) => string
}

export function UsersList({ search, page, onPageChange, hrefOf }: UsersListProps) {
  const usersQuery = useAdminUsers(search, page)

  if (usersQuery.isPending) return <Spinner />

  if (usersQuery.isError) {
    return (
      <StateMessage
        icon={WifiOff}
        title="Не удалось загрузить пользователей"
        description="Проверьте соединение и попробуйте ещё раз"
        action={{ label: 'Повторить', onClick: () => void usersQuery.refetch() }}
      />
    )
  }

  const { content, totalElements, totalPages } = usersQuery.data

  if (content.length === 0) {
    return search === '' ? (
      <StateMessage
        icon={Users}
        title="Пользователей пока нет"
        description="Добавьте первого — достаточно знать его username"
      />
    ) : (
      <StateMessage
        icon={SearchX}
        title="Ничего не найдено"
        description={`По запросу «${search}» никого нет`}
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-subtle tabular-nums">Всего: {totalElements}</p>
      <ul
        aria-busy={usersQuery.isFetching}
        className={`flex flex-col gap-2 transition-opacity duration-150 ${
          usersQuery.isFetching ? 'opacity-60' : ''
        }`}
      >
        {content.map((user) => (
          <UserRow key={user.id} user={user} href={hrefOf(user)} />
        ))}
      </ul>
      <UsersPagination
        page={usersQuery.data.page}
        totalPages={totalPages}
        onChange={onPageChange}
      />
    </div>
  )
}
