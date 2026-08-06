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
      <div className="flex flex-col gap-1">
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
        {/*
         * Своя кнопка вместо «Сброс» в нативном пикере: на iOS он закрывает
         * попап, не отдавая пустое значение полю, и дата остаётся на месте.
         */}
        {values.opensAt === null ? null : (
          <button
            type="button"
            onClick={() => onChange({ ...values, opensAt: null })}
            className="flex min-h-11 items-center self-start text-sm text-link"
          >
            Убрать дату
          </button>
        )}
      </div>
    </>
  )
}
