import { ChevronDown, ChevronUp } from 'lucide-react'
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
          <span className="min-w-0 flex-1 font-medium text-fg">Пройденные уроки</span>
          {expanded ? (
            <ChevronUp aria-hidden className="size-5 shrink-0 text-subtle" />
          ) : (
            <ChevronDown aria-hidden className="size-5 shrink-0 text-subtle" />
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
