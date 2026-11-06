import { ChevronDown, ChevronUp } from 'lucide-react'
import type { ReactNode } from 'react'

import { withSwapped } from '@/shared/lib/with-swapped'

interface ReorderableListProps<T> {
  items: T[]
  getId: (item: T) => number
  renderItem: (item: T, index: number) => ReactNode
  /** Full list of ids in the new order — the shape both `.../order` endpoints take. */
  onReorder: (ids: number[]) => void
  disabled?: boolean
}

const MOVE_BUTTON =
  'flex size-11 shrink-0 items-center justify-center rounded-control text-subtle transition-colors duration-150 active:bg-surface-sunken disabled:opacity-40'

/**
 * Ordering by up/down buttons instead of drag and drop: inside the Telegram web
 * view a long drag fights the swipe-to-close gesture and the page scroll.
 *
 * The order is derived from `items` — there is no local copy of it, so the list
 * shows what the server returned and nothing else.
 */
export function ReorderableList<T>({
  items,
  getId,
  renderItem,
  onReorder,
  disabled = false,
}: ReorderableListProps<T>) {
  const ids = items.map(getId)

  function move(from: number, to: number) {
    onReorder(withSwapped(ids, from, to))
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, index) => (
        <li key={getId(item)} className="flex items-center gap-2">
          <div className="min-w-0 flex-1">{renderItem(item, index)}</div>
          <div className="flex shrink-0 flex-col">
            <button
              type="button"
              aria-label="Переместить выше"
              disabled={disabled || index === 0}
              onClick={() => move(index, index - 1)}
              className={MOVE_BUTTON}
            >
              <ChevronUp aria-hidden className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Переместить ниже"
              disabled={disabled || index === items.length - 1}
              onClick={() => move(index, index + 1)}
              className={MOVE_BUTTON}
            >
              <ChevronDown aria-hidden className="size-5" />
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
