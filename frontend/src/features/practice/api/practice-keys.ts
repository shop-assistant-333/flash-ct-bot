export const practiceKeys = {
  all: ['practice'] as const,
  next: (subjectId: number) => [...practiceKeys.all, 'next', subjectId] as const,
} as const
