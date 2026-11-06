import { questionAnchorId } from '@/shared/lib/question-anchor'

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

/**
 * The admin panel is a second branch of the app, not a section of the student
 * one: `role === 'ADMIN'` sees only these routes — see backend/API.md
 * ("Аутентификация") and `require-role.tsx`.
 */
export const ADMIN_ROUTES = {
  users: '/admin/users',
  userNew: '/admin/users/new',
  user: '/admin/users/:userId',
  subjects: '/admin/subjects',
  subject: '/admin/subjects/:subjectId',
  subjectLessons: '/admin/subjects/:subjectId/lessons',
  subjectPracticeQuestions: '/admin/subjects/:subjectId/practice-questions',
  subjectQuestionNew: '/admin/subjects/:subjectId/questions/new',
  lesson: '/admin/lessons/:lessonId',
  lessonQuestionNew: '/admin/lessons/:lessonId/questions/new',
  question: '/admin/questions/:questionId',
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

export function adminUserPath(userId: number): string {
  return `/admin/users/${userId}`
}

export function adminSubjectPath(subjectId: number): string {
  return `/admin/subjects/${subjectId}`
}

export function adminSubjectLessonsPath(subjectId: number): string {
  return `/admin/subjects/${subjectId}/lessons`
}

export function adminSubjectPracticeQuestionsPath(subjectId: number): string {
  return `/admin/subjects/${subjectId}/practice-questions`
}

export function adminSubjectQuestionNewPath(subjectId: number): string {
  return `/admin/subjects/${subjectId}/questions/new`
}

/**
 * With `focusQuestionId` the lesson screen scrolls to that question — the way
 * back from editing a question lands where the teacher left off. A hash, not a
 * query: it is a position on the page, not a different page.
 */
export function adminLessonPath(lessonId: number, focusQuestionId?: number): string {
  const path = `/admin/lessons/${lessonId}`
  return focusQuestionId === undefined ? path : `${path}#${questionAnchorId(focusQuestionId)}`
}

export function adminLessonQuestionNewPath(lessonId: number): string {
  return `/admin/lessons/${lessonId}/questions/new`
}

export function adminQuestionPath(questionId: number): string {
  return `/admin/questions/${questionId}`
}
