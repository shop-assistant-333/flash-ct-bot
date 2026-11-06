import type { LessonKind } from '@/shared/api'

import type { LessonDraft, LessonRequest } from '../api/admin-lessons-api'

/**
 * `sectionId` is written as sent, and «без темы» is a missing key rather than
 * null in the contract — hence the spread instead of passing the draft through.
 */
export function toLessonRequest(
  subjectId: number,
  { sectionId, ...draft }: LessonDraft,
  kind?: LessonKind,
): LessonRequest {
  return {
    subjectId,
    ...draft,
    ...(sectionId === null ? {} : { sectionId }),
    ...(kind === undefined ? {} : { kind }),
  }
}
