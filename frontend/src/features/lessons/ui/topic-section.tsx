import { ChevronDown, ChevronUp } from 'lucide-react'
import { useId, useState } from 'react'

import type { LessonItem } from '../api/lessons-api'
import { lessonsOnly, type ProgramTopic } from '../lib/program'
import { LessonCard } from './lesson-card'

interface TopicSectionProps {
  topic: ProgramTopic
  /** Read once on mount: afterwards the student decides what stays open. */
  initiallyExpanded: boolean
  hrefOf: (lesson: LessonItem) => string
}

/** One topic of the programme: an accordion over its lessons and its test. */
export function TopicSection({ topic, initiallyExpanded, hrefOf }: TopicSectionProps) {
  const [expanded, setExpanded] = useState(initiallyExpanded)
  const listId = useId()

  const lessons = lessonsOnly(topic.entries)
  const completed = lessons.filter(({ lesson }) => lesson.status === 'COMPLETED').length

  return (
    <li className="flex flex-col gap-3">
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={listId}
        onClick={() => setExpanded((value) => !value)}
        className="flex min-h-11 w-full items-center gap-3 rounded-card bg-surface p-4 text-left text-fg shadow-card transition-colors duration-150 active:bg-surface-sunken"
      >
        <span className="min-w-0 flex-1 font-semibold break-words">{topic.section.title}</span>
        {lessons.length > 0 ? (
          <span className="shrink-0 text-sm text-muted tabular-nums">
            {completed} из {lessons.length}
          </span>
        ) : null}
        {expanded ? (
          <ChevronUp aria-hidden className="size-5 shrink-0 text-subtle" />
        ) : (
          <ChevronDown aria-hidden className="size-5 shrink-0 text-subtle" />
        )}
      </button>

      {/* `hidden` rather than unmounting keeps the `aria-controls` target in the DOM. */}
      <ul id={listId} hidden={!expanded} className="flex flex-col gap-3">
        {topic.entries.map(({ lesson, number }) => (
          <LessonCard key={lesson.id} lesson={lesson} number={number} href={hrefOf(lesson)} />
        ))}
      </ul>
    </li>
  )
}
