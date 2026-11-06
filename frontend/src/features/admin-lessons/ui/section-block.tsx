import type { AdminLessonItem } from '../api/admin-lessons-api'
import type { ProgramGroup } from '../lib/program'
import { ProgramLessonRow } from './program-lesson-row'
import { ProgramRows } from './program-rows'
import { SectionHeader } from './section-header'

interface SectionMoves {
  up: (() => void) | undefined
  down: (() => void) | undefined
}

interface SectionBlockProps {
  group: ProgramGroup
  moves: SectionMoves
  onReorderLessons: (ids: number[]) => void
  disabled: boolean
  hrefOf: (lesson: AdminLessonItem) => string
}

/** One topic in the admin programme: its header, its lessons, then its test. */
export function SectionBlock({
  group,
  moves,
  onReorderLessons,
  disabled,
  hrefOf,
}: SectionBlockProps) {
  const empty = group.rows.length === 0 && group.test === undefined

  return (
    <section className="flex flex-col gap-2">
      <SectionHeader section={group.section} onMoveUp={moves.up} onMoveDown={moves.down} />

      {empty ? (
        <p className="text-sm text-muted">
          В теме пока нет уроков — выберите её в форме урока или теста
        </p>
      ) : null}

      {group.rows.length > 0 ? (
        <ProgramRows
          rows={group.rows}
          onReorder={onReorderLessons}
          disabled={disabled}
          hrefOf={hrefOf}
        />
      ) : null}

      {/* The server always keeps the test last in its topic, so it has no arrows;
          the right padding lines it up with the rows that do. */}
      {group.test === undefined ? null : (
        <div className="pr-13">
          <ProgramLessonRow row={group.test} href={hrefOf(group.test.lesson)} />
        </div>
      )}
    </section>
  )
}
