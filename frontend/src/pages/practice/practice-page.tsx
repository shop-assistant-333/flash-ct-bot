import { useSearchParams } from 'react-router'

import { PracticeDeck } from '@/features/practice'
import { SubjectTabs, useSubjects } from '@/features/subjects'
import { Spinner } from '@/shared/ui/spinner'
import { PageHeader } from '@/shared/ui/page-header'

export function PracticePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const subjectsQuery = useSubjects()

  if (subjectsQuery.isPending) {
    return (
      <section className="flex flex-col gap-6">
        <PageHeader title="Практика" description="Случайные задания из всех уроков" />
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
      <PageHeader title="Практика" description="Случайные задания из всех уроков" />

      {selectedSubject ? (
        <>
          <SubjectTabs
            subjects={subjects}
            selectedId={selectedSubject.id}
            onSelect={handleSelectSubject}
          />
          <PracticeDeck key={selectedSubject.id} subjectId={selectedSubject.id} />
        </>
      ) : (
        <p className="py-10 text-center text-sm text-muted">Нет доступных предметов</p>
      )}
    </section>
  )
}
