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
        path: ROUTES.home,
        lazy: async () => {
          const { HomePage } = await import('@/pages/home/home-page')
          return { Component: HomePage }
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
