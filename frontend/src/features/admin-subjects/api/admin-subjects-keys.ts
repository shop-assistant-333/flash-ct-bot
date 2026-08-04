export const adminSubjectsKeys = {
  all: ['admin', 'subjects'] as const,
  list: () => [...adminSubjectsKeys.all, 'list'] as const,
  detail: (subjectId: number) => [...adminSubjectsKeys.all, 'detail', subjectId] as const,
} as const
