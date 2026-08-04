/** «5 уроков» / «1 урок» — счётчики видны админу, склонение обязательно. */
function pluralize(count: number, one: string, few: string, many: string): string {
  const mod100 = Math.abs(count) % 100
  const mod10 = mod100 % 10

  if (mod100 >= 11 && mod100 <= 14) return many
  if (mod10 === 1) return one
  if (mod10 >= 2 && mod10 <= 4) return few
  return many
}

export function formatLessonsCount(count: number): string {
  return `${count} ${pluralize(count, 'урок', 'урока', 'уроков')}`
}

export function formatPracticeQuestionsCount(count: number): string {
  return `${count} ${pluralize(count, 'вопрос', 'вопроса', 'вопросов')}`
}

/** Подпись строки списка: «5 уроков · 12 вопросов практики». */
export function formatSubjectCounts(lessonsCount: number, practiceQuestionsCount: number): string {
  return `${formatLessonsCount(lessonsCount)} · ${formatPracticeQuestionsCount(practiceQuestionsCount)} практики`
}
