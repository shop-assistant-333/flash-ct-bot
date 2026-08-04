import { useState } from 'react'
import type { FormEvent } from 'react'

import type { LocalDateTime, SubscriptionItem } from '@/shared/api'
import { toDateInput, toLocalDateTime } from '@/shared/lib/local-date-time'
import { Button } from '@/shared/ui/button'
import { Modal } from '@/shared/ui/modal'
import { SelectField } from '@/shared/ui/select-field'
import { TextField } from '@/shared/ui/text-field'

import { errorProp } from '../lib/field-error'

export interface SubjectOption {
  id: number
  name: string
}

interface SubscriptionModalProps {
  subjects: SubjectOption[]
  /** The subscription being extended; null when access is granted for the first time. */
  subscription: SubscriptionItem | null
  onSubmit: (subjectId: number, paidUntil: LocalDateTime) => void
  onClose: () => void
  saving: boolean
  error: unknown
}

const DATE_HINT = 'Доступ действует до конца выбранного дня'

/**
 * Mounted only while open, so every opening starts from the values of the
 * subscription it was opened for — no effect syncing props into state.
 */
export function SubscriptionModal({
  subjects,
  subscription,
  onSubmit,
  onClose,
  saving,
  error,
}: SubscriptionModalProps) {
  const [subjectId, setSubjectId] = useState(
    String(subscription?.subjectId ?? subjects[0]?.id ?? ''),
  )
  const [date, setDate] = useState(subscription === null ? '' : toDateInput(subscription.paidUntil))
  const [dateError, setDateError] = useState('')

  const title = subscription === null ? 'Выдать доступ' : `Продлить: ${subscription.subjectName}`

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (date === '') {
      setDateError('Укажите дату, до которой оплачено')
      return
    }

    setDateError('')
    onSubmit(Number(subjectId), toLocalDateTime(date))
  }

  return (
    <Modal open title={title} onClose={onClose}>
      {subjects.length === 0 ? (
        <p className="text-sm text-muted">
          Список предметов не загрузился — обновите страницу и попробуйте ещё раз
        </p>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <SelectField
            label="Предмет"
            value={subjectId}
            options={subjects.map((subject) => ({
              value: String(subject.id),
              label: subject.name,
            }))}
            onChange={setSubjectId}
          />
          <TextField
            label="Оплачено до"
            type="date"
            value={date}
            onChange={setDate}
            required
            hint={DATE_HINT}
            {...errorProp(dateError)}
          />
          {error === null || error === undefined ? null : (
            <p className="text-sm text-danger">Не удалось сохранить подписку</p>
          )}
          <Button type="submit" loading={saving}>
            Сохранить
          </Button>
        </form>
      )}
    </Modal>
  )
}
