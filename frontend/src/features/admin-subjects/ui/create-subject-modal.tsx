import { Modal } from '@/shared/ui/modal'

import { useCreateSubject } from '../hooks/use-create-subject'
import { SubjectForm } from './subject-form'

interface CreateSubjectModalProps {
  onClose: () => void
}

/**
 * Mounted only while it is open — that is what resets the form between two
 * openings, without copying the props into state.
 */
export function CreateSubjectModal({ onClose }: CreateSubjectModalProps) {
  const createMutation = useCreateSubject()

  return (
    <Modal open title="Новый предмет" onClose={onClose}>
      <SubjectForm
        initialName=""
        submitLabel="Добавить"
        pending={createMutation.isPending}
        error={createMutation.error}
        onSubmit={(name) => createMutation.mutate({ name }, { onSuccess: onClose })}
      />
    </Modal>
  )
}
