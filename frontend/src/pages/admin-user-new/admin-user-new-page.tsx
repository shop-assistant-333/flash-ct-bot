import { Wrench } from 'lucide-react'

import { PageHeader } from '@/shared/ui/page-header'
import { StateMessage } from '@/shared/ui/state-message'

export function AdminUserNewPage() {
  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title="Новый пользователь"
        description="Пользователя можно завести до его первого запуска"
      />
      <StateMessage
        icon={Wrench}
        title="Раздел в разработке"
        description="Экран появится в одной из следующих задач админки"
      />
    </section>
  )
}
