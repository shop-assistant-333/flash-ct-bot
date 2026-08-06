import { errorProp } from '@/shared/lib/form-errors'
import { fromDateTimeInput, toDateTimeInput } from '@/shared/lib/local-date-time'
import { TextField } from '@/shared/ui/text-field'
import { TextareaField } from '@/shared/ui/textarea-field'

import type { LessonDraft } from '../api/admin-lessons-api'

interface LessonFieldsProps {
  values: LessonDraft
  onChange: (values: LessonDraft) => void
  /** Per-field messages of a failed backend validation. */
  errors: Record<string, string>
}

/** The fields of a lesson — shared by the create sheet and the edit form. */
export function LessonFields({ values, onChange, errors }: LessonFieldsProps) {
  return (
    <>
      <TextField
        label="Название"
        value={values.title}
        required
        placeholder="Например, «Квадратные уравнения»"
        onChange={(title) => onChange({ ...values, title })}
        {...errorProp(errors.title)}
      />
      <TextareaField
        label="Описание"
        value={values.description}
        rows={3}
        hint="Короткое пояснение, что студент разберёт в этом уроке"
        onChange={(description) => onChange({ ...values, description })}
        {...errorProp(errors.description)}
      />
      <TextField
        label="Открыть доступ"
        type="datetime-local"
        value={values.opensAt === null ? '' : toDateTimeInput(values.opensAt)}
        hint="Дата и время, когда урок откроется всем ученикам. Пусто — урок под замком"
        // Очистка поля даёт пустую строку — это и есть «снять дату».
        onChange={(input) =>
          onChange({ ...values, opensAt: input === '' ? null : fromDateTimeInput(input) })
        }
        {...errorProp(errors.opensAt)}
      />
    </>
  )
}
