import { ChevronLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router'

import { ADMIN_ROUTES, adminUserPath } from '@/app/routes'
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
      <Link
        to={ADMIN_ROUTES.users}
        className="-ml-1 flex min-h-11 items-center gap-1 self-start text-sm text-muted"
      >
        <ChevronLeft aria-hidden className="size-4" />
        Все пользователи
      </Link>
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
