import { SearchX } from 'lucide-react'
import { useParams } from 'react-router'

import { adminLessonPath, adminQuestionPath, adminSubjectPracticeQuestionsPath } from '@/app/routes'
import { nextQuestionId, useAdminLesson } from '@/features/admin-lessons'
import { QuestionDetail, useAdminQuestion } from '@/features/admin-questions'
import { PageHeader } from '@/shared/ui/page-header'
import { StateMessage } from '@/shared/ui/state-message'

function toId(value: string | undefined): number | undefined {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : undefined
}

/**
 * The question and its lesson live in two features: the page reads the owning
 * lesson (usually already cached by the lesson screen) to name its kind and
 * link to the next question, and hands both down to the question feature.
 */
export function AdminQuestionPage() {
  const { questionId } = useParams()

  const id = toId(questionId)
  const questionQuery = useAdminQuestion(id)
  const lessonQuery = useAdminLesson(questionQuery.data?.lessonId ?? undefined)
  const lesson = lessonQuery.data
  const nextId = lesson === undefined || id === undefined ? undefined : nextQuestionId(lesson, id)

  return (
    <section className="flex flex-col gap-6">
      <PageHeader title="Вопрос" description="Текст, тип и варианты ответа" />

      {id === undefined ? (
        <StateMessage
          icon={SearchX}
          title="Вопрос не найден"
          description="Ссылка на вопрос выглядит неверной"
        />
      ) : (
        // Keyed by id: «Следующий вопрос» stays on this route, and the save/delete
        // state of the previous question must not carry over to the next one.
        <QuestionDetail
          key={id}
          questionId={id}
          lessonHref={adminLessonPath}
          practiceHref={adminSubjectPracticeQuestionsPath}
          lessonKind={lesson?.kind}
          nextQuestionHref={nextId === undefined ? undefined : adminQuestionPath(nextId)}
        />
      )}
    </section>
  )
}
