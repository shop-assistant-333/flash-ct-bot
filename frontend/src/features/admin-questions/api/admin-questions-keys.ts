export const adminQuestionsKeys = {
  all: ['admin', 'questions'] as const,
  detail: (questionId: number | undefined) =>
    [...adminQuestionsKeys.all, 'detail', questionId] as const,
  practiceList: (subjectId: number) => [...adminQuestionsKeys.all, 'practice', subjectId] as const,
} as const
