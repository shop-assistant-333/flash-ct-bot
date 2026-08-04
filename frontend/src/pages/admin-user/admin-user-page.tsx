import { ChevronLeft, UserX, WifiOff } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'

import { ADMIN_ROUTES } from '@/app/routes'
import { useAdminSubjects } from '@/features/admin-subjects'
import {
  DeleteUserButton,
  SubscriptionsSection,
  UserForm,
  UserProgressList,
  useAdminUser,
  userDisplayName,
  useUpdateUser,
} from '@/features/admin-users'
import { isApiError } from '@/shared/api'
import { PageHeader } from '@/shared/ui/page-header'
import { Spinner } from '@/shared/ui/spinner'
import { StateMessage } from '@/shared/ui/state-message'

/** Same way back as on a lesson screen: first element of the page, every state. */
const BACK_TO_USERS = (
  <Link
    to={ADMIN_ROUTES.users}
    className="-ml-1 flex min-h-11 items-center gap-1 self-start text-sm text-muted"
  >
    <ChevronLeft aria-hidden className="size-4" />
    Все пользователи
  </Link>
)

export function AdminUserPage() {
  const params = useParams()
  const navigate = useNavigate()

  const userId = Number(params.userId)
  const userQuery = useAdminUser(userId)
  // Two features meet on this screen, so the subject list is fetched here and
  // handed to the subscriptions block as props (CLAUDE.md §1).
  const subjectsQuery = useAdminSubjects()
  const updateUser = useUpdateUser(userId)

  const notFound =
    !Number.isInteger(userId) ||
    (userQuery.isError && isApiError(userQuery.error) && userQuery.error.is('NOT_FOUND'))

  if (notFound) {
    return (
      <section className="flex flex-col gap-6">
        {BACK_TO_USERS}
        <PageHeader title="Пользователь" />
        <StateMessage
          icon={UserX}
          title="Пользователь не найден"
          description="Возможно, его удалили — вернитесь к списку"
        />
      </section>
    )
  }

  if (userQuery.isError) {
    return (
      <section className="flex flex-col gap-6">
        {BACK_TO_USERS}
        <PageHeader title="Пользователь" />
        <StateMessage
          icon={WifiOff}
          title="Не удалось загрузить пользователя"
          description="Проверьте соединение и попробуйте ещё раз"
          action={{ label: 'Повторить', onClick: () => void userQuery.refetch() }}
        />
      </section>
    )
  }

  if (userQuery.isPending) {
    return (
      <section className="flex flex-col gap-6">
        {BACK_TO_USERS}
        <PageHeader title="Пользователь" />
        <Spinner />
      </section>
    )
  }

  const user = userQuery.data

  return (
    <section className="flex flex-col gap-6">
      {BACK_TO_USERS}
      <PageHeader title={userDisplayName(user)} description={`@${user.username}`} />

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-muted">Данные</h2>
        <UserForm
          user={user}
          submitLabel="Сохранить"
          onSubmit={(body) => updateUser.mutate(body)}
          saving={updateUser.isPending}
          error={updateUser.error}
        />
        {updateUser.isSuccess ? <p className="text-sm text-success">Изменения сохранены</p> : null}
      </div>

      <SubscriptionsSection
        userId={user.id}
        subscriptions={user.subscriptions}
        subjects={subjectsQuery.data ?? []}
      />

      <UserProgressList progress={user.progress} />

      <DeleteUserButton
        userId={user.id}
        userName={userDisplayName(user)}
        onDeleted={() => void navigate(ADMIN_ROUTES.users, { replace: true })}
      />
    </section>
  )
}
