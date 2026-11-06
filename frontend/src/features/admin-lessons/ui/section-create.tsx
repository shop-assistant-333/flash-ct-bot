import { useState } from 'react'

import { Button } from '@/shared/ui/button'
import { Modal } from '@/shared/ui/modal'

import { useCreateSection } from '../hooks/use-create-section'
import { SectionForm } from './section-form'

interface SectionCreateProps {
  subjectId: number
}

/** «Добавить тему» and its sheet. A new topic goes to the end of the programme. */
export function SectionCreate({ subjectId }: SectionCreateProps) {
  const [open, setOpen] = useState(false)
  const createSection = useCreateSection(subjectId)

  function handleClose() {
    setOpen(false)
    createSection.reset()
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Добавить тему
      </Button>

      {/* Mounted only while open, so the form starts empty every time. */}
      {open ? (
        <Modal open title="Новая тема" onClose={handleClose}>
          <SectionForm
            initialTitle=""
            submitLabel="Создать"
            pending={createSection.isPending}
            error={createSection.error}
            onSubmit={(title) => createSection.mutate(title, { onSuccess: handleClose })}
          />
        </Modal>
      ) : null}
    </>
  )
}
