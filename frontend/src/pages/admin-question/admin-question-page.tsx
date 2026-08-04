import { Wrench } from 'lucide-react'

import { PageHeader } from '@/shared/ui/page-header'
import { StateMessage } from '@/shared/ui/state-message'

export function AdminQuestionPage() {
  return (
    <section className="flex flex-col gap-6">
      <PageHeader title="Вопрос" description="Текст, тип и варианты ответа" />
      <StateMessage
        icon={Wrench}
        title="Раздел в разработке"
        description="Экран появится в одной из следующих задач админки"
      />
    </section>
  )
}
