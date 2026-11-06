import type { LessonItem, SectionItem } from '../api/lessons-api'

export interface ProgramEntry {
  lesson: LessonItem
  /** «Урок 9» — counted over lessons only; null for a test, which has no number. */
  number: number | null
}

export interface ProgramTopic {
  section: SectionItem
  entries: ProgramEntry[]
}

export interface Program {
  topics: ProgramTopic[]
  /** Lessons outside every topic, drawn as a flat list under the topics. */
  loose: ProgramEntry[]
}

function numbered(lessons: LessonItem[]): ProgramEntry[] {
  let counter = 0

  return lessons.map((lesson) => {
    if (lesson.kind === 'TEST') return { lesson, number: null }
    counter += 1
    return { lesson, number: counter }
  })
}

/**
 * The server already returns lessons in programme order, so grouping keeps it
 * as is. A lesson pointing to a topic the client does not know (the two lists
 * raced with an admin edit) falls back to the loose list rather than vanishing.
 * Empty topics are left out: the student has nothing to open in them.
 */
export function buildProgram(lessons: LessonItem[], sections: SectionItem[]): Program {
  const bySection = new Map<number, ProgramEntry[]>(sections.map((section) => [section.id, []]))
  const loose: ProgramEntry[] = []

  for (const entry of numbered(lessons)) {
    const bucket =
      entry.lesson.sectionId === null ? undefined : bySection.get(entry.lesson.sectionId)
    if (bucket === undefined) loose.push(entry)
    else bucket.push(entry)
  }

  const topics = sections
    .map((section) => ({ section, entries: bySection.get(section.id) ?? [] }))
    .filter((topic) => topic.entries.length > 0)

  return { topics, loose }
}

function isOpen(entry: ProgramEntry): boolean {
  return entry.lesson.status === 'AVAILABLE' || entry.lesson.status === 'IN_PROGRESS'
}

/** The topic to unfold first: where the student has something to do right now. */
export function initialTopicId(topics: ProgramTopic[]): number | undefined {
  const current = topics.find((topic) => topic.entries.some(isOpen))
  return (current ?? topics[0])?.section.id
}

/** Progress counts lessons only — tests stay out of every statistic. */
export function lessonsOnly(entries: ProgramEntry[]): ProgramEntry[] {
  return entries.filter((entry) => entry.lesson.kind === 'LESSON')
}
