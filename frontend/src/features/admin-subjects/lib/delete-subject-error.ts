import { isApiError } from '@/shared/api'

/**
 * Почему предмет не удалился. Бэкенд не даёт удалить непустой предмет и называет причину
 * кодом — админу нужно видеть, что именно осталось внутри, а не общее «не получилось».
 */
export function formatDeleteSubjectError(error: unknown): string {
  if (isApiError(error)) {
    if (error.is('SUBJECT_HAS_LESSONS')) {
      return 'В предмете ещё остались уроки. Сначала удалите их — предмет удаляется только пустым'
    }
    if (error.is('SUBJECT_HAS_PRACTICE_QUESTIONS')) {
      return 'В предмете ещё остались вопросы для практики. Сначала удалите их'
    }
    if (error.is('SUBJECT_HAS_SUBSCRIPTIONS')) {
      return 'Предмет выдан студентам. Сначала заберите у них доступ'
    }
    if (error.is('SUBJECT_HAS_TEACHERS')) {
      return 'Предмет закреплён за учителями. Сначала снимите его с них'
    }
  }
  return 'Не удалось удалить предмет. Попробуйте ещё раз'
}
