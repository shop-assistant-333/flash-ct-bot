import { createBrowserRouter } from 'react-router'

import { RootLayout } from '@/app/root-layout'
import { ROUTES } from '@/app/routes'
import { ErrorScreen } from '@/shared/ui/error-screen'

/**
 * Pages are code-split: only the chunk for the visited route is downloaded.
 * `lazy` returns the route module, so add `loader`/`action` there when needed.
 */
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <ErrorScreen />,
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
])
