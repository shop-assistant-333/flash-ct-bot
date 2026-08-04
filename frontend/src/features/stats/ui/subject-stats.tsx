import { TriangleAlert } from 'lucide-react'

import { Spinner } from '@/shared/ui/spinner'
import { StateMessage } from '@/shared/ui/state-message'

import { useStats } from '../hooks/use-stats'
import { ScoreCard } from './score-card'
import { StatsOverview } from './stats-overview'
import { TopicAccuracy } from './topic-accuracy'

interface SubjectStatsProps {
  subjectId: number
}

/** Вся статистика одного предмета. */
export function SubjectStats({ subjectId }: SubjectStatsProps) {
  const statsQuery = useStats(subjectId)

  if (statsQuery.isPending) {
    return <Spinner />
  }

  if (statsQuery.isError) {
    return (
      <StateMessage
        icon={TriangleAlert}
        title="Не удалось загрузить статистику"
        description="Проверьте соединение и попробуйте ещё раз"
        action={{ label: 'Повторить', onClick: () => void statsQuery.refetch() }}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <ScoreCard subjectId={subjectId} />
      <StatsOverview stats={statsQuery.data} />
      <TopicAccuracy lessons={statsQuery.data.byLesson} />
    </div>
  )
}
