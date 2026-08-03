import { BookOpenCheck, ChartColumn, Dumbbell, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router'

import { ROUTES } from '@/app/routes'

interface Tab {
  to: string
  label: string
  icon: LucideIcon
  /** Root path matches every child route unless the match is exact. */
  end: boolean
}

const TABS: readonly Tab[] = [
  { to: ROUTES.homework, label: 'ДЗ', icon: BookOpenCheck, end: true },
  { to: ROUTES.practice, label: 'Практика', icon: Dumbbell, end: false },
  { to: ROUTES.statistics, label: 'Статистика', icon: ChartColumn, end: false },
  { to: ROUTES.profile, label: 'Профиль', icon: User, end: false },
]

/**
 * The four primary tabs, fixed to the bottom of the viewport.
 *
 * `RootLayout` reserves the space it covers via `pb-nav-safe`, so screens never
 * have to account for it. Styling rules: ../../style-guide.md (§6).
 */
export function BottomNav() {
  return (
    <nav
      aria-label="Основная навигация"
      className="fixed inset-x-0 bottom-0 z-10 border-t bg-surface-raised pb-safe shadow-nav"
    >
      <ul className="mx-auto flex h-nav w-full max-w-app items-stretch px-gutter">
        {TABS.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex h-full flex-col items-center justify-center gap-1 transition-colors duration-150 ${
                  isActive ? 'text-primary' : 'text-subtle'
                }`
              }
            >
              <Icon aria-hidden className="size-5" />
              <span className="text-xs font-medium">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
