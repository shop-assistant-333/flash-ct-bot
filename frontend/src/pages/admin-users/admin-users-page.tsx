import { UserPlus } from 'lucide-react'
import { useCallback } from 'react'
import { Link, useSearchParams } from 'react-router'

import { ADMIN_ROUTES, adminUserPath } from '@/app/routes'
import { UsersList, UsersSearch, type AdminUserItem } from '@/features/admin-users'
import { useProfile } from '@/features/profile'
import { PageHeader } from '@/shared/ui/page-header'

const ADD_LINK =
  'flex min-h-11 shrink-0 items-center gap-1 rounded-control bg-primary px-3 text-sm font-semibold text-primary-fg transition-colors duration-150 active:bg-primary-hover'

export function AdminUsersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  // The role is read here and handed down: features know nothing of each other,
  // and nothing of who is looking at them (CLAUDE.md §1).
  const isAdmin = useProfile().data?.role === 'ADMIN'

  const search = searchParams.get('search') ?? ''
  const requestedPage = Number(searchParams.get('page'))
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 0

  // The query lives in the URL, so the way back from a user's card keeps the
  // list where it was. Debounced typing replaces the history entry instead of
  // piling up a record per keystroke.
  const handleSearch = useCallback(
    (value: string) => {
      void setSearchParams(
        (params) => {
          if (value === '') {
            params.delete('search')
          } else {
            params.set('search', value)
          }
          params.delete('page')
          return params
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  function handlePageChange(nextPage: number) {
    void setSearchParams((params) => {
      params.set('page', String(nextPage))
      return params
    })
  }

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title={isAdmin ? 'Пользователи' : 'Ученики'}
        description={
          isAdmin ? 'Поиск, доступ к предметам и прогресс' : 'Прогресс учеников по вашему предмету'
        }
        action={
          isAdmin ? (
            <Link to={ADMIN_ROUTES.userNew} className={ADD_LINK}>
              <UserPlus aria-hidden className="size-4" />
              Добавить
            </Link>
          ) : null
        }
      />

      <div className="flex flex-col gap-4">
        <UsersSearch value={search} onChange={handleSearch} />
        <UsersList
          search={search}
          page={page}
          onPageChange={handlePageChange}
          hrefOf={(user: AdminUserItem) => adminUserPath(user.id)}
        />
      </div>
    </section>
  )
}
