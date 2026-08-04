import { Check, ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

import type { LessonItem } from '../api/lessons-api'
import { LessonCard } from './lesson-card'

interface CompletedLessonEntry {
  lesson: LessonItem
  number: number
}

interface CompletedLessonsGroupProps {
  items: CompletedLessonEntry[]
  hrefOf: (lesson: LessonItem) => string
}

function plural(count: number): string {
  const lastTwo = count % 100
  const last = count % 10

  if (lastTwo >= 11 && lastTwo <= 14) return 'уроков'
  if (last === 1) return 'урок'
  if (last >= 2 && last <= 4) return 'урока'
  return 'уроков'
}

/**
 * Collapsed by default so a student with a long history isn't scrolling past
 * finished lessons to reach the current one. Renders as siblings of the
 * toggle row (not nested inside it) so expanded cards sit at the same list
 * level as the open and upcoming lessons.
 */
export function CompletedLessonsGroup({ items, hrefOf }: CompletedLessonsGroupProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <li>
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
          className="flex min-h-11 w-full items-center gap-3 rounded-card bg-surface p-4 text-left text-fg shadow-card transition-colors duration-150 active:bg-surface-sunken"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-success-soft text-success-soft-fg">
            <Check aria-hidden className="size-5" />
          </span>
          <span className="min-w-0 flex-1 text-base font-medium">
            Пройдено ({items.length} {plural(items.length)})
          </span>
          {expanded ? (
            <ChevronDown aria-hidden className="size-5 shrink-0 text-subtle" />
          ) : (
            <ChevronRight aria-hidden className="size-5 shrink-0 text-subtle" />
          )}
        </button>
      </li>

      {expanded
        ? items.map(({ lesson, number }) => (
            <LessonCard key={lesson.id} lesson={lesson} number={number} href={hrefOf(lesson)} />
          ))
        : null}
    </>
  )
}
