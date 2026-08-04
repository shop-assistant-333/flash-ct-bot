import { UserX, WifiOff } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'

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
        <PageHeader title="Пользователь" />
        <StateMessage
          icon={UserX}
          title="Пользователь не найден"
          description="Возможно, его удалили — вернитесь к списку"
          action={{ label: 'К списку', onClick: () => void navigate(ADMIN_ROUTES.users) }}
        />
      </section>
    )
  }

  if (userQuery.isError) {
    return (
      <section className="flex flex-col gap-6">
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
        <PageHeader title="Пользователь" />
        <Spinner />
      </section>
    )
  }

  const user = userQuery.data

  return (
    <section className="flex flex-col gap-6">
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
