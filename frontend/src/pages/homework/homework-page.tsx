import { useSearchParams } from 'react-router'

import { lessonPath } from '@/app/routes'
import { LessonsList, type LessonItem } from '@/features/lessons'
import { SubjectTabs, useSubjects } from '@/features/subjects'
import { PageHeader } from '@/shared/ui/page-header'
import { Spinner } from '@/shared/ui/spinner'

const HEADER = { title: 'Домашние задания', description: 'Уроки открываются по порядку' }

export function HomeworkPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const subjectsQuery = useSubjects()

  if (subjectsQuery.isPending) {
    return (
      <section className="flex flex-col gap-6">
        <PageHeader {...HEADER} />
        <Spinner />
      </section>
    )
  }

  if (subjectsQuery.isError) {
    throw subjectsQuery.error
  }

  const subjects = subjectsQuery.data
  const requestedSubjectId = Number(searchParams.get('subjectId'))
  const selectedSubject =
    subjects.find((subject) => subject.id === requestedSubjectId) ?? subjects[0]

  function handleSelectSubject(subjectId: number) {
    setSearchParams((params) => {
      params.set('subjectId', String(subjectId))
      return params
    })
  }

  return (
    <section className="flex flex-col gap-6">
      <PageHeader {...HEADER} />

      {selectedSubject ? (
        <>
          <SubjectTabs
            subjects={subjects}
            selectedId={selectedSubject.id}
            onSelect={handleSelectSubject}
          />
          <LessonsList
            subjectId={selectedSubject.id}
            hrefOf={(lesson: LessonItem) => lessonPath(lesson.id, selectedSubject.id)}
          />
        </>
      ) : (
        <p className="py-10 text-center text-sm text-muted">Нет доступных предметов</p>
      )}
    </section>
  )
}
