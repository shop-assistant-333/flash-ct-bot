import { Modal } from '@/shared/ui/modal'

import type { SubjectDto } from '../api/admin-subjects-api'
import { useUpdateSubject } from '../hooks/use-update-subject'
import { SubjectForm } from './subject-form'

interface RenameSubjectModalProps {
  subject: SubjectDto
  onClose: () => void
}

/** Mounted only while open, like the create modal — so the form starts fresh. */
export function RenameSubjectModal({ subject, onClose }: RenameSubjectModalProps) {
  const updateMutation = useUpdateSubject(subject.id)

  return (
    <Modal open title="Переименовать предмет" onClose={onClose}>
      <SubjectForm
        initialName={subject.name}
        submitLabel="Сохранить"
        pending={updateMutation.isPending}
        error={updateMutation.error}
        onSubmit={(name) => updateMutation.mutate({ name }, { onSuccess: onClose })}
      />
    </Modal>
  )
}
