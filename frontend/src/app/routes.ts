/** Every path in one place — no string literals scattered across components. */
export const ROUTES = {
  /** Landing tab: the mini-app always opens on the lesson list. */
  homework: '/',
  practice: '/practice',
  statistics: '/statistics',
  profile: '/profile',
} as const
