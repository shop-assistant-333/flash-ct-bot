export const adminLessonsKeys = {
  all: ['admin', 'lessons'] as const,
  /** Lessons of one subject, in the order the admin set. */
  list: (subjectId: number) => [...adminLessonsKeys.all, 'list', subjectId] as const,
  /** One lesson with its questions; undefined while the id is not known yet. */
  detail: (lessonId: number | undefined) => [...adminLessonsKeys.all, 'detail', lessonId] as const,
  /** Topics of one subject, in their order. */
  sections: (subjectId: number) => [...adminLessonsKeys.all, 'sections', subjectId] as const,
} as const
