import { BookOpen, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { NavLink, useLocation, useNavigation } from 'react-router'

import { ADMIN_ROUTES } from '@/app/routes'
import { useProfile } from '@/features/profile'

interface AdminTab {
  to: string
  label: string
  icon: LucideIcon
  /** Screens that belong to the tab without living under its path. */
  branches: readonly string[]
}

// A teacher sees the same two tabs over a narrower list, so the labels say what
// is actually behind them: their own students and their own subject.
const LABELS = {
  users: { admin: 'Пользователи', teacher: 'Ученики' },
  subjects: { admin: 'Предметы', teacher: 'Мой предмет' },
} as const

function tabsFor(isTeacher: boolean): readonly AdminTab[] {
  const variant = isTeacher ? 'teacher' : 'admin'
  return [
    { to: ADMIN_ROUTES.users, label: LABELS.users[variant], icon: Users, branches: [] },
    {
      to: ADMIN_ROUTES.subjects,
      label: LABELS.subjects[variant],
      icon: BookOpen,
      // Lessons and questions are reached from a subject, so they keep its tab lit.
      branches: ['/admin/lessons/', '/admin/questions/'],
    },
  ]
}

/** The admin twin of `BottomNav` — same chrome, two tabs (style guide §6). */
export function AdminNav() {
  const { pathname } = useLocation()
  const hasPendingNavigation = useNavigation().state === 'loading'
  const tabs = tabsFor(useProfile().data?.role === 'TEACHER')

  return (
    <nav
      aria-label="Навигация админ-панели"
      className="fixed inset-x-0 bottom-0 z-10 border-t bg-surface-raised pb-safe shadow-nav"
    >
      <ul className="mx-auto flex h-nav w-full max-w-app items-stretch px-gutter">
        {tabs.map(({ to, label, icon: Icon, branches }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              className={({ isActive, isPending }) =>
                `flex h-full flex-col items-center justify-center gap-1 transition-colors duration-150 ${
                  isPending ||
                  (!hasPendingNavigation &&
                    (isActive || branches.some((branch) => pathname.startsWith(branch))))
                    ? 'text-primary'
                    : 'text-subtle'
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
