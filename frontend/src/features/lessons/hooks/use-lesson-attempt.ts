import { useQuery } from '@tanstack/react-query'

import { openLessonAttempt } from '../api/lessons-api'
import { lessonsKeys } from '../api/lessons-keys'

/**
 * The whole state of the lesson screen: questions, answers already given and the
 * question to resume at. One call restores the screen after Telegram was closed
 * mid-test, so it is the only source the runner reads from.
 */
export function useLessonAttempt(lessonId: number) {
  return useQuery({
    queryKey: lessonsKeys.attempt(lessonId),
    queryFn: ({ signal }) => openLessonAttempt(lessonId, signal),
  })
}
