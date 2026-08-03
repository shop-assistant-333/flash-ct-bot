import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'

import { ROUTES } from '@/app/routes'

export function NotFoundPage() {
  return (
    <section className="text-center">
      <h1 className="mb-4 text-2xl font-semibold">Страница не найдена</h1>
      <Link to={ROUTES.home} className="inline-flex items-center gap-2 text-link">
        <ArrowLeft aria-hidden className="size-4" />
        На главную
      </Link>
    </section>
  )
}
