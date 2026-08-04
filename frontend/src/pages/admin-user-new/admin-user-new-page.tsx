import { useNavigate } from 'react-router'

import { adminUserPath } from '@/app/routes'
import { UserForm, useCreateUser, type UserRequest } from '@/features/admin-users'
import { PageHeader } from '@/shared/ui/page-header'

export function AdminUserNewPage() {
  const navigate = useNavigate()
  const createUser = useCreateUser()

  function handleSubmit(body: UserRequest) {
    createUser.mutate(body, {
      // `replace`: going back should return to the list, not to an empty form.
      onSuccess: (user) => void navigate(adminUserPath(user.id), { replace: true }),
    })
  }

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title="Новый пользователь"
        description="Пользователя можно завести до его первого запуска"
      />
      <UserForm
        submitLabel="Создать"
        onSubmit={handleSubmit}
        saving={createUser.isPending}
        error={createUser.error}
      />
    </section>
  )
}
