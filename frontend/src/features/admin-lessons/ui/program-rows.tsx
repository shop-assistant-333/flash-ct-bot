import { ReorderableList } from '@/shared/ui/reorderable-list'

import type { AdminLessonItem } from '../api/admin-lessons-api'
import type { ProgramRow } from '../lib/program'
import { ProgramLessonRow } from './program-lesson-row'

interface ProgramRowsProps {
  rows: ProgramRow[]
  /** Ids of this block only, in the new order. */
  onReorder: (ids: number[]) => void
  disabled: boolean
  hrefOf: (lesson: AdminLessonItem) => string
}

/** The lessons of one block, movable only among themselves. */
export function ProgramRows({ rows, onReorder, disabled, hrefOf }: ProgramRowsProps) {
  return (
    <ReorderableList
      items={rows}
      getId={(row) => row.lesson.id}
      disabled={disabled}
      onReorder={onReorder}
      renderItem={(row) => <ProgramLessonRow row={row} href={hrefOf(row.lesson)} />}
    />
  )
}
