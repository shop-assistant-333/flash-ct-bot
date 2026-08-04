import type { QueryClient } from '@tanstack/react-query'

import { adminLessonsKeys } from '@/features/admin-lessons'
import { adminSubjectsKeys } from '@/features/admin-subjects'

import { adminQuestionsKeys } from '../api/admin-questions-keys'

/**
 * Every question mutation touches three caches at once: the question itself,
 * the lesson it sits in (its question list and counter), and the subject
 * counters (`practiceOnlyQuestionsCount`). Both foreign key factories are
 * exported for exactly this — see their `index.ts`.
 */
export function invalidateQuestionCaches(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: adminQuestionsKeys.all })
  void queryClient.invalidateQueries({ queryKey: adminLessonsKeys.all })
  void queryClient.invalidateQueries({ queryKey: adminSubjectsKeys.all })
}
