export { useAdminSubjects } from './hooks/use-admin-subjects'
/**
 * Exported on purpose, unlike other features' query keys: the subject counters
 * (`lessonsCount`, `practiceOnlyQuestionsCount`) are changed by the lessons and
 * questions features, and they have to invalidate this list.
 */
export { adminSubjectsKeys } from './api/admin-subjects-keys'
export type { SubjectDto } from './api/admin-subjects-api'
