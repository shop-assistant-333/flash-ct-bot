import { SearchX } from 'lucide-react'
import { useParams } from 'react-router'

import { adminLessonPath, adminSubjectPracticeQuestionsPath } from '@/app/routes'
import { QuestionDetail } from '@/features/admin-questions'
import { PageHeader } from '@/shared/ui/page-header'
import { StateMessage } from '@/shared/ui/state-message'

export function AdminQuestionPage() {
  const { questionId } = useParams()

  const id = Number(questionId)

  return (
    <section className="flex flex-col gap-6">
      <PageHeader title="Вопрос" description="Текст, тип и варианты ответа" />

      {Number.isInteger(id) && id > 0 ? (
        <QuestionDetail
          questionId={id}
          lessonHref={adminLessonPath}
          practiceHref={adminSubjectPracticeQuestionsPath}
        />
      ) : (
        <StateMessage
          icon={SearchX}
          title="Вопрос не найден"
          description="Ссылка на вопрос выглядит неверной"
        />
      )}
    </section>
  )
}
