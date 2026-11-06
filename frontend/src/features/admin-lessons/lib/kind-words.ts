import type { LessonKind } from '@/shared/api'

interface KindWords {
  /** «Урок» / «Тест» — headings and labels. */
  title: string
  /** «урока» / «теста» — «Данные урока». */
  genitive: string
  /** «урок» / «тест» — «Удалить урок». */
  accusative: string
}

/** The editor talks about a test as a test — same screens, other words. */
export const KIND_WORDS: Record<LessonKind, KindWords> = {
  LESSON: { title: 'Урок', genitive: 'урока', accusative: 'урок' },
  TEST: { title: 'Тест', genitive: 'теста', accusative: 'тест' },
}
