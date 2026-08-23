import { createBrowserRouter } from 'react-router'

import { AdminLayout } from '@/app/admin-layout'
import { RequireAdmin } from '@/app/require-admin'
import { RequireRole } from '@/app/require-role'
import { RootLayout } from '@/app/root-layout'
import { ADMIN_ROUTES, ROUTES } from '@/app/routes'
import { ErrorScreen } from '@/shared/ui/error-screen'

/**
 * Two disjoint branches, each behind `RequireRole`: a student sees the four
 * tabs, an admin sees the admin panel and nothing else. The catch-all stays in
 * the student branch, so an unknown URL still lands an admin on their own root.
 *
 * A teacher lives in the admin branch, with the screens closed to them nested
 * under `RequireAdmin` instead of a branch of their own.
 *
 * Pages are code-split: only the chunk for the visited route is downloaded.
 * `lazy` returns the route module, so add `loader`/`action` there when needed.
 */
export const router = createBrowserRouter([
  {
    element: <RequireRole roles={['USER']} />,
    errorElement: <ErrorScreen />,
    children: [
      {
        element: <RootLayout />,
        children: [
          {
            path: ROUTES.homework,
            lazy: async () => {
              const { HomeworkPage } = await import('@/pages/homework/homework-page')
              return { Component: HomeworkPage }
            },
          },
          {
            path: ROUTES.lesson,
            lazy: async () => {
              const { LessonPage } = await import('@/pages/lesson/lesson-page')
              return { Component: LessonPage }
            },
          },
          {
            path: ROUTES.practice,
            lazy: async () => {
              const { PracticePage } = await import('@/pages/practice/practice-page')
              return { Component: PracticePage }
            },
          },
          {
            path: ROUTES.statistics,
            lazy: async () => {
              const { StatisticsPage } = await import('@/pages/statistics/statistics-page')
              return { Component: StatisticsPage }
            },
          },
          {
            path: ROUTES.profile,
            lazy: async () => {
              const { ProfilePage } = await import('@/pages/profile/profile-page')
              return { Component: ProfilePage }
            },
          },
          {
            path: '*',
            lazy: async () => {
              const { NotFoundPage } = await import('@/pages/not-found/not-found-page')
              return { Component: NotFoundPage }
            },
          },
        ],
      },
    ],
  },
  {
    element: <RequireRole roles={['ADMIN', 'TEACHER']} />,
    errorElement: <ErrorScreen />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            path: ADMIN_ROUTES.users,
            lazy: async () => {
              const { AdminUsersPage } = await import('@/pages/admin-users/admin-users-page')
              return { Component: AdminUsersPage }
            },
          },
          {
            element: <RequireAdmin />,
            children: [
              {
                path: ADMIN_ROUTES.userNew,
                lazy: async () => {
                  const { AdminUserNewPage } =
                    await import('@/pages/admin-user-new/admin-user-new-page')
                  return { Component: AdminUserNewPage }
                },
              },
            ],
          },
          {
            path: ADMIN_ROUTES.user,
            lazy: async () => {
              const { AdminUserPage } = await import('@/pages/admin-user/admin-user-page')
              return { Component: AdminUserPage }
            },
          },
          {
            path: ADMIN_ROUTES.subjects,
            lazy: async () => {
              const { AdminSubjectsPage } =
                await import('@/pages/admin-subjects/admin-subjects-page')
              return { Component: AdminSubjectsPage }
            },
          },
          {
            path: ADMIN_ROUTES.subject,
            lazy: async () => {
              const { AdminSubjectPage } = await import('@/pages/admin-subject/admin-subject-page')
              return { Component: AdminSubjectPage }
            },
          },
          {
            path: ADMIN_ROUTES.subjectLessons,
            lazy: async () => {
              const { AdminLessonsPage } = await import('@/pages/admin-lessons/admin-lessons-page')
              return { Component: AdminLessonsPage }
            },
          },
          {
            path: ADMIN_ROUTES.subjectPracticeQuestions,
            lazy: async () => {
              const { AdminPracticeQuestionsPage } =
                await import('@/pages/admin-practice-questions/admin-practice-questions-page')
              return { Component: AdminPracticeQuestionsPage }
            },
          },
          {
            path: ADMIN_ROUTES.subjectQuestionNew,
            lazy: async () => {
              const { AdminQuestionNewPage } =
                await import('@/pages/admin-question-new/admin-question-new-page')
              return { Component: AdminQuestionNewPage }
            },
          },
          {
            path: ADMIN_ROUTES.lesson,
            lazy: async () => {
              const { AdminLessonPage } = await import('@/pages/admin-lesson/admin-lesson-page')
              return { Component: AdminLessonPage }
            },
          },
          {
            path: ADMIN_ROUTES.lessonQuestionNew,
            lazy: async () => {
              const { AdminQuestionNewPage } =
                await import('@/pages/admin-question-new/admin-question-new-page')
              return { Component: AdminQuestionNewPage }
            },
          },
          {
            path: ADMIN_ROUTES.question,
            lazy: async () => {
              const { AdminQuestionPage } =
                await import('@/pages/admin-question/admin-question-page')
              return { Component: AdminQuestionPage }
            },
          },
        ],
      },
    ],
  },
])
