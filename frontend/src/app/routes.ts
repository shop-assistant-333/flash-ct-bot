/** Every path in one place — no string literals scattered across components. */
export const ROUTES = {
  /** Landing tab: the mini-app always opens on the lesson list. */
  homework: '/',
  /** Solving one lesson; part of the homework tab. */
  lesson: '/lessons/:lessonId',
  practice: '/practice',
  statistics: '/statistics',
  profile: '/profile',
} as const

function withSubject(path: string, subjectId: number | undefined): string {
  if (subjectId === undefined) return path
  return `${path}?${new URLSearchParams({ subjectId: String(subjectId) }).toString()}`
}

/**
 * The selected subject travels in the URL: it has to survive a reload and the
 * way back from a lesson to the list.
 */
export function homeworkPath(subjectId?: number): string {
  return withSubject(ROUTES.homework, subjectId)
}

export function lessonPath(lessonId: number, subjectId?: number): string {
  return withSubject(`/lessons/${lessonId}`, subjectId)
}
