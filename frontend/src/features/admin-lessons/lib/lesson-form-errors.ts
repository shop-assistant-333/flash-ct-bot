import { isApiError } from '@/shared/api'
import { fieldErrors } from '@/shared/lib/form-errors'

/**
 * Field messages of a failed save. A second test in a topic is a 409, not a
 * validation error, but it is about one field — so it lands on the topic select.
 */
export function lessonFormErrors(error: unknown): Record<string, string> {
  if (isApiError(error) && error.is('SECTION_HAS_TEST')) {
    return { sectionId: 'В этой теме уже есть тест — выберите другую тему' }
  }

  return fieldErrors(error)
}
