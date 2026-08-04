import { Check, ChevronRight, Lock } from 'lucide-react'
import { Link } from 'react-router'

import type { LessonItem } from '../api/lessons-api'

interface LessonCardProps {
  lesson: LessonItem
  /** Position in the list — the lesson number the student sees. */
  number: number
  href: string
}

const CARD_CLASSES =
  'flex w-full min-h-11 items-center gap-3 rounded-card bg-surface p-4 text-left shadow-card'

function plural(count: number): string {
  const lastTwo = count % 100
  const last = count % 10

  if (lastTwo >= 11 && lastTwo <= 14) return 'вопросов'
  if (last === 1) return 'вопрос'
  if (last >= 2 && last <= 4) return 'вопроса'
  return 'вопросов'
}

/** Sub-title line: what the student gets out of the card at a glance. */
function meta(lesson: LessonItem): string {
  const questions = `${lesson.questionCount} ${plural(lesson.questionCount)}`

  switch (lesson.status) {
    case 'COMPLETED':
      return `${lesson.correctAnswers ?? 0} из ${lesson.questionCount} верно`
    case 'IN_PROGRESS':
      return `Начат · ${questions}`
    case 'LOCKED':
      return 'Откроется после предыдущего урока'
    default:
      return questions
  }
}

export function LessonCard({ lesson, number, href }: LessonCardProps) {
  const locked = lesson.status === 'LOCKED'

  const body = (
    <>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-xs text-subtle">Урок {number}</span>
        <span className="text-base font-medium break-words">{lesson.title}</span>
        {lesson.description && !locked ? (
          <span className="line-clamp-2 text-sm text-muted">{lesson.description}</span>
        ) : null}
        <span className={`text-xs ${locked ? 'text-subtle' : 'text-muted'}`}>{meta(lesson)}</span>
      </div>

      {locked ? <Lock aria-hidden className="size-5 shrink-0 text-subtle" /> : null}
      {lesson.status === 'COMPLETED' ? (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-success-soft text-success-soft-fg">
          <Check aria-hidden className="size-5" />
        </span>
      ) : null}
      {lesson.status === 'AVAILABLE' || lesson.status === 'IN_PROGRESS' ? (
        <ChevronRight aria-hidden className="size-5 shrink-0 text-subtle" />
      ) : null}
    </>
  )

  return (
    <li>
      {locked ? (
        <button
          type="button"
          disabled
          aria-disabled
          className={`${CARD_CLASSES} text-subtle opacity-60`}
        >
          {body}
        </button>
      ) : (
        <Link
          to={href}
          className={`${CARD_CLASSES} text-fg transition-colors duration-150 active:bg-surface-sunken`}
        >
          {body}
        </Link>
      )}
    </li>
  )
}
