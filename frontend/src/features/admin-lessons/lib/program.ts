import type { AdminLessonItem, AdminSectionItem } from '../api/admin-lessons-api'

export interface ProgramRow {
  lesson: AdminLessonItem
  /** Number the student sees — lessons only, tests are not numbered. */
  number: number | null
}

export interface ProgramGroup {
  section: AdminSectionItem
  /** Reorderable lessons of the topic; the test is kept apart — the server always puts it last. */
  rows: ProgramRow[]
  test: ProgramRow | undefined
}

export interface AdminProgram {
  groups: ProgramGroup[]
  loose: ProgramRow[]
}

/**
 * Groups the subject's lessons by topic, keeping the server order. A lesson
 * pointing to an unknown topic (the two lists raced) lands in the loose list.
 */
export function buildAdminProgram(
  lessons: AdminLessonItem[],
  sections: AdminSectionItem[],
): AdminProgram {
  const groups = new Map<number, ProgramGroup>(
    sections.map((section) => [section.id, { section, rows: [], test: undefined }]),
  )
  const loose: ProgramRow[] = []
  let counter = 0

  for (const lesson of lessons) {
    if (lesson.kind === 'LESSON') counter += 1
    const row: ProgramRow = { lesson, number: lesson.kind === 'LESSON' ? counter : null }
    const group = lesson.sectionId === null ? undefined : groups.get(lesson.sectionId)

    if (group === undefined) loose.push(row)
    else if (lesson.kind === 'TEST' && group.test === undefined) group.test = row
    else group.rows.push(row)
  }

  return { groups: [...groups.values()], loose }
}

/**
 * `.../lessons/order` takes every lesson of the subject, while the admin moves
 * them inside one block: the block's new order is written back into its own
 * positions of the full list, everything else stays put.
 */
export function withGroupOrder(allIds: number[], groupIds: number[]): number[] {
  const inGroup = new Set(groupIds)
  const queue = [...groupIds]

  return allIds.map((id) => (inGroup.has(id) ? (queue.shift() ?? id) : id))
}
