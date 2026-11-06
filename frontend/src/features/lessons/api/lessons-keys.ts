export const lessonsKeys = {
  all: ['lessons'] as const,
  list: (subjectId: number) => [...lessonsKeys.all, 'list', subjectId] as const,
  sections: (subjectId: number) => [...lessonsKeys.all, 'sections', subjectId] as const,
  /** Keyed by lesson, not by attempt: the screen is opened by lesson id. */
  attempt: (lessonId: number) => [...lessonsKeys.all, 'attempt', lessonId] as const,
} as const
