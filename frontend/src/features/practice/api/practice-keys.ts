export const practiceKeys = {
  all: ['practice'] as const,
  next: (subjectId: number) => [...practiceKeys.all, 'next', subjectId] as const,
  answer: (subjectId: number) => [...practiceKeys.all, 'answer', subjectId] as const,
} as const
