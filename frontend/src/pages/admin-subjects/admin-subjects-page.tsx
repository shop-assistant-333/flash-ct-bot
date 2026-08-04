import { Wrench } from 'lucide-react'

import { PageHeader } from '@/shared/ui/page-header'
import { StateMessage } from '@/shared/ui/state-message'

export function AdminSubjectsPage() {
  return (
    <section className="flex flex-col gap-6">
      <PageHeader title="Предметы" description="Предметы, уроки и вопросы практики" />
      <StateMessage
        icon={Wrench}
        title="Раздел в разработке"
        description="Экран появится в одной из следующих задач админки"
      />
    </section>
  )
}
