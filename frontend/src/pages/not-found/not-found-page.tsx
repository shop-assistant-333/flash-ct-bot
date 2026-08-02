import { Link } from 'react-router'

import { ROUTES } from '@/app/routes'

export function NotFoundPage() {
  return (
    <section>
      <h1>Страница не найдена</h1>
      <Link to={ROUTES.home}>На главную</Link>
    </section>
  )
}
