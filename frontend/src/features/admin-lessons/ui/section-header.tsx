import { ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { Modal } from '@/shared/ui/modal'

import type { AdminSectionItem } from '../api/admin-lessons-api'
import { useDeleteSection } from '../hooks/use-delete-section'
import { useUpdateSection } from '../hooks/use-update-section'
import { SectionForm } from './section-form'

interface SectionHeaderProps {
  section: AdminSectionItem
  /** Undefined at the edge of the list, or while a reorder is in flight. */
  onMoveUp: (() => void) | undefined
  onMoveDown: (() => void) | undefined
}

const ICON_BUTTON =
  'flex size-11 shrink-0 items-center justify-center rounded-control text-subtle transition-colors duration-150 active:bg-surface-sunken disabled:opacity-40'

/**
 * Title of a topic block with its own move buttons: wrapping the whole block in
 * `ReorderableList` would add a second column of arrows next to the lesson
 * arrows and squeeze the rows on a phone.
 */
export function SectionHeader({ section, onMoveUp, onMoveDown }: SectionHeaderProps) {
  const [renaming, setRenaming] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const updateSection = useUpdateSection(section.id, section.subjectId)
  const deleteSection = useDeleteSection(section.id)

  function closeRename() {
    setRenaming(false)
    updateSection.reset()
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <h3 className="min-w-0 flex-1 font-semibold break-words text-fg">{section.title}</h3>
        <button
          type="button"
          aria-label="Переименовать тему"
          onClick={() => setRenaming(true)}
          className={ICON_BUTTON}
        >
          <Pencil aria-hidden className="size-5" />
        </button>
        <button
          type="button"
          aria-label="Удалить тему"
          onClick={() => setConfirming(true)}
          className={ICON_BUTTON}
        >
          <Trash2 aria-hidden className="size-5" />
        </button>
        <button
          type="button"
          aria-label="Переместить тему выше"
          disabled={onMoveUp === undefined}
          onClick={onMoveUp}
          className={ICON_BUTTON}
        >
          <ChevronUp aria-hidden className="size-5" />
        </button>
        <button
          type="button"
          aria-label="Переместить тему ниже"
          disabled={onMoveDown === undefined}
          onClick={onMoveDown}
          className={ICON_BUTTON}
        >
          <ChevronDown aria-hidden className="size-5" />
        </button>
      </div>

      {deleteSection.isError ? (
        <p className="text-sm text-danger">Не удалось удалить тему</p>
      ) : null}

      {renaming ? (
        <Modal open title="Переименовать тему" onClose={closeRename}>
          <SectionForm
            initialTitle={section.title}
            submitLabel="Сохранить"
            pending={updateSection.isPending}
            error={updateSection.error}
            onSubmit={(title) => updateSection.mutate(title, { onSuccess: closeRename })}
          />
        </Modal>
      ) : null}

      <ConfirmDialog
        open={confirming}
        title="Удалить тему?"
        description="Уроки темы останутся без темы — они не удалятся и останутся у студентов."
        confirmLabel="Удалить"
        loading={deleteSection.isPending}
        onClose={() => setConfirming(false)}
        onConfirm={() => deleteSection.mutate(undefined, { onSuccess: () => setConfirming(false) })}
      />
    </div>
  )
}
