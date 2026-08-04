import { ChevronLeft, SearchX } from 'lucide-react'
import { Link, useParams } from 'react-router'

import { adminLessonPath, adminSubjectPracticeQuestionsPath } from '@/app/routes'
import { QuestionCreator, type QuestionOwner } from '@/features/admin-questions'
import { PageHeader } from '@/shared/ui/page-header'
import { StateMessage } from '@/shared/ui/state-message'

interface NewQuestionTarget {
  owner: QuestionOwner
  backHref: string
  backLabel: string
}

function toId(value: string | undefined): number | undefined {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : undefined
}

/**
 * One screen behind two routes: the question belongs either to the lesson or to
 * the subject, and the route says which — exactly one id reaches `useParams`.
 */
function targetOf(
  lessonParam: string | undefined,
  subjectParam: string | undefined,
): NewQuestionTarget | undefined {
  const lessonId = toId(lessonParam)
  if (lessonId !== undefined) {
    return { owner: { lessonId }, backHref: adminLessonPath(lessonId), backLabel: 'К уроку' }
  }

  const subjectId = toId(subjectParam)
  if (subjectId !== undefined) {
    return {
      owner: { subjectId },
      backHref: adminSubjectPracticeQuestionsPath(subjectId),
      backLabel: 'К вопросам практики',
    }
  }

  return undefined
}

export function AdminQuestionNewPage() {
  const { lessonId, subjectId } = useParams()

  const target = targetOf(lessonId, subjectId)

  return (
    <section className="flex flex-col gap-4">
      {target === undefined ? null : (
        <Link
          to={target.backHref}
          className="-ml-1 flex min-h-11 items-center gap-1 self-start text-sm text-muted"
        >
          <ChevronLeft aria-hidden className="size-4" />
          {target.backLabel}
        </Link>
      )}

      <PageHeader title="Новый вопрос" description="Текст, тип и варианты ответа" />

      {target === undefined ? (
        <StateMessage
          icon={SearchX}
          title="Раздел не найден"
          description="Ссылка на урок или предмет выглядит неверной"
        />
      ) : (
        <QuestionCreator owner={target.owner} backHref={target.backHref} />
      )}
    </section>
  )
}
