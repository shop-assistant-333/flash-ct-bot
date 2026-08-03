import { TriangleAlert } from 'lucide-react'

import { ProfileCard, SubscriptionList, useProfile } from '@/features/profile'
import { PageHeader } from '@/shared/ui/page-header'
import { Spinner } from '@/shared/ui/spinner'

export function ProfilePage() {
  const profileQuery = useProfile()

  return (
    <section className="flex flex-col gap-6">
      <PageHeader title="Профиль" description="Данные аккаунта и доступ к предметам" />

      {profileQuery.isPending ? <Spinner /> : null}

      {profileQuery.isError ? (
        <div className="flex flex-col items-center gap-3 rounded-card bg-surface p-6 text-center shadow-card">
          <TriangleAlert aria-hidden className="size-6 text-danger" />
          <p className="text-sm text-muted">Не удалось загрузить профиль</p>
          <button
            type="button"
            onClick={() => void profileQuery.refetch()}
            className="min-h-11 rounded-control bg-primary px-4 py-2 text-sm font-semibold text-primary-fg transition-colors duration-150 active:bg-primary-hover"
          >
            Повторить
          </button>
        </div>
      ) : null}

      {profileQuery.data ? (
        <>
          <ProfileCard profile={profileQuery.data} />
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-medium text-muted">Предметы</h2>
            <SubscriptionList subscriptions={profileQuery.data.subscriptions} />
          </div>
        </>
      ) : null}
    </section>
  )
}
