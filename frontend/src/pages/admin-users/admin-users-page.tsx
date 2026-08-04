import { Wrench } from 'lucide-react'

import { PageHeader } from '@/shared/ui/page-header'
import { StateMessage } from '@/shared/ui/state-message'

export function AdminUsersPage() {
  return (
    <section className="flex flex-col gap-6">
      <PageHeader title="Пользователи" description="Список пользователей, поиск и подписки" />
      <StateMessage
        icon={Wrench}
        title="Раздел в разработке"
        description="Экран появится в одной из следующих задач админки"
      />
    </section>
  )
}
