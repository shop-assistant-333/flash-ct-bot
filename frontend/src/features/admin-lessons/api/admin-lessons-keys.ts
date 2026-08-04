export const adminLessonsKeys = {
  all: ['admin', 'lessons'] as const,
  /** Lessons of one subject, in the order the admin set. */
  list: (subjectId: number) => [...adminLessonsKeys.all, 'list', subjectId] as const,
  /** One lesson with its questions. */
  detail: (lessonId: number) => [...adminLessonsKeys.all, 'detail', lessonId] as const,
} as const
