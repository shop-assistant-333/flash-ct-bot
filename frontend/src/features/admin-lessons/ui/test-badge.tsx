import { ClipboardCheck } from 'lucide-react'

/** Marks a test among lessons — the `test` colour group, style guide §1.2. */
export function TestBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-control bg-test-soft px-2 py-0.5 text-xs font-medium text-test-soft-fg">
      <ClipboardCheck aria-hidden className="size-3.5" />
      Тест
    </span>
  )
}
