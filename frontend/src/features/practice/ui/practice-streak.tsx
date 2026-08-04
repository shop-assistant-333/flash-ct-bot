import { usePracticeQuestion } from '../hooks/use-practice-question'
import { StreakBadge } from './streak-badge'

interface PracticeStreakProps {
  subjectId: number
}

/**
 * Reads the same "next question" query cache as `PracticeDeck` — no extra
 * request, and stays in sync because both consume one cache entry.
 */
export function PracticeStreak({ subjectId }: PracticeStreakProps) {
  const questionQuery = usePracticeQuestion(subjectId)

  if (!questionQuery.data) return null

  return <StreakBadge streak={questionQuery.data.streak} />
}
