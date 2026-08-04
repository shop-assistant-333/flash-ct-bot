export const adminUsersKeys = {
  all: ['admin', 'users'] as const,
  list: (search: string, page: number) => [...adminUsersKeys.all, 'list', search, page] as const,
  detail: (userId: number) => [...adminUsersKeys.all, 'detail', userId] as const,
} as const
