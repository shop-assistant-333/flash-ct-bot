export const subjectsKeys = {
  all: ['subjects'] as const,
  list: () => [...subjectsKeys.all, 'list'] as const,
} as const
