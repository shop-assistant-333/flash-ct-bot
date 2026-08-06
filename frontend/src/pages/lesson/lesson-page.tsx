import { ChevronLeft, SearchX } from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router'

import { homeworkPath } from '@/app/routes'
import { LessonAttempt } from '@/features/lessons'
import { StateMessage } from '@/shared/ui/state-message'

export function LessonPage() {
  const { lessonId } = useParams()
  const [searchParams] = useSearchParams()

  const subjectId = Number(searchParams.get('subjectId'))
  const subject = Number.isInteger(subjectId) && subjectId > 0 ? subjectId : undefined
  const lessonsHref = homeworkPath(subject)

  const id = Number(lessonId)

  return (
    <section className="flex flex-col gap-4">
      <Link
        to={lessonsHref}
        className="-ml-1 flex min-h-11 items-center gap-1 self-start text-sm text-muted"
      >
        <ChevronLeft aria-hidden className="size-4" />
        Все уроки
      </Link>

      {Number.isInteger(id) && id > 0 ? (
        <LessonAttempt lessonId={id} lessonsHref={lessonsHref} />
      ) : (
        <StateMessage
          icon={SearchX}
          title="Урок не найден"
          description="Ссылка на урок выглядит неверной — вернитесь к списку"
        />
      )}
    </section>
  )
}
