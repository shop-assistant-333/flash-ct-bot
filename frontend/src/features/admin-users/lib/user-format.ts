interface NamedUser {
  firstName: string
  lastName: string
  username: string
}

/**
 * A local copy rather than a shared helper: features never import each other,
 * and the profile screen formats its own dates (CLAUDE.md §1).
 */
export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/** A user added by username alone has no name yet — the username is the title then. */
export function userDisplayName(user: NamedUser): string {
  const fullName = `${user.firstName} ${user.lastName ? user.lastName : ''}`.trim()
  return fullName === '' ? user.username : fullName
}
