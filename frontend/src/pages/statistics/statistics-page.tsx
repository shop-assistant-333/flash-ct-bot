import { useSearchParams } from 'react-router'

import { SubjectStats } from '@/features/stats'
import { SubjectTabs, useSubjects } from '@/features/subjects'
import { PageHeader } from '@/shared/ui/page-header'
import { Spinner } from '@/shared/ui/spinner'

export function StatisticsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const subjectsQuery = useSubjects()

  if (subjectsQuery.isPending) {
    return (
      <section className="flex flex-col gap-6">
        <PageHeader title="Статистика" description="Прогресс и прогноз балла за экзамен" />
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
      <PageHeader title="Статистика" description="Прогресс и прогноз балла за экзамен" />

      {selectedSubject ? (
        <>
          <SubjectTabs
            subjects={subjects}
            selectedId={selectedSubject.id}
            onSelect={handleSelectSubject}
          />
          <SubjectStats key={selectedSubject.id} subjectId={selectedSubject.id} />
        </>
      ) : (
        <p className="py-10 text-center text-sm text-muted">Нет доступных предметов</p>
      )}
    </section>
  )
}
