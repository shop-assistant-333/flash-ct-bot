export const statsKeys = {
  all: ['stats'] as const,
  summary: (subjectId: number) => [...statsKeys.all, 'summary', subjectId] as const,
  prediction: (subjectId: number) => [...statsKeys.all, 'prediction', subjectId] as const,
} as const
