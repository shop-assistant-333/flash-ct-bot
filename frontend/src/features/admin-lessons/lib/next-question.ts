import type { AdminLessonDto } from '../api/admin-lessons-api'

/** The question asked after this one in the lesson, by `order`; undefined on the last one. */
export function nextQuestionId(lesson: AdminLessonDto, questionId: number): number | undefined {
  const ordered = lesson.questions.toSorted((a, b) => a.order - b.order)
  const index = ordered.findIndex((question) => question.id === questionId)

  return index === -1 ? undefined : ordered[index + 1]?.id
}
