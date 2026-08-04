import { Wrench } from 'lucide-react'

import { PageHeader } from '@/shared/ui/page-header'
import { StateMessage } from '@/shared/ui/state-message'

export function AdminPracticeQuestionsPage() {
  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title="Вопросы для практики"
        description="Задания вне уроков — только для вкладки «Практика»"
      />
      <StateMessage
        icon={Wrench}
        title="Раздел в разработке"
        description="Экран появится в одной из следующих задач админки"
      />
    </section>
  )
}
