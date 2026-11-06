import { errorProp } from '@/shared/lib/form-errors'
import { fromDateTimeInput, toDateTimeInput } from '@/shared/lib/local-date-time'
import type { LessonKind } from '@/shared/api'
import { SelectField, type SelectOption } from '@/shared/ui/select-field'
import { TextField } from '@/shared/ui/text-field'
import { TextareaField } from '@/shared/ui/textarea-field'

import type { AdminSectionItem, LessonDraft } from '../api/admin-lessons-api'
import { KIND_WORDS } from '../lib/kind-words'

interface LessonFieldsProps {
  kind: LessonKind
  values: LessonDraft
  onChange: (values: LessonDraft) => void
  /** Topics of the subject; the select is left out while there are none. */
  sections: AdminSectionItem[]
  /** Per-field messages of a failed backend validation, plus `sectionId` for a taken topic. */
  errors: Record<string, string>
}

const NO_SECTION = ''

function sectionOptions(sections: AdminSectionItem[]): SelectOption[] {
  return [
    { value: NO_SECTION, label: 'Без темы' },
    ...sections.map((section) => ({ value: String(section.id), label: section.title })),
  ]
}

/** The fields of a lesson or a test — shared by the create sheet and the edit form. */
export function LessonFields({ kind, values, onChange, sections, errors }: LessonFieldsProps) {
  const words = KIND_WORDS[kind]

  return (
    <>
      <TextField
        label="Название"
        value={values.title}
        required
        placeholder={
          kind === 'TEST' ? 'Например, «Тест по орфографии»' : 'Например, «Квадратные уравнения»'
        }
        onChange={(title) => onChange({ ...values, title })}
        {...errorProp(errors.title)}
      />
      <TextareaField
        label="Описание"
        value={values.description}
        rows={3}
        hint={
          kind === 'TEST'
            ? 'Короткое пояснение, что проверяет этот тест'
            : 'Короткое пояснение, что студент разберёт в этом уроке'
        }
        onChange={(description) => onChange({ ...values, description })}
        {...errorProp(errors.description)}
      />
      {sections.length > 0 ? (
        <SelectField
          label="Тема"
          value={values.sectionId === null ? NO_SECTION : String(values.sectionId)}
          options={sectionOptions(sections)}
          hint={
            kind === 'TEST'
              ? 'В теме может быть только один тест — он идёт после её уроков'
              : 'Урок встанет в конец выбранной темы'
          }
          onChange={(value) =>
            onChange({ ...values, sectionId: value === NO_SECTION ? null : Number(value) })
          }
          {...errorProp(errors.sectionId)}
        />
      ) : null}
      <div className="flex flex-col gap-1">
        <TextField
          label="Открыть доступ"
          type="datetime-local"
          value={values.opensAt === null ? '' : toDateTimeInput(values.opensAt)}
          hint={`Дата и время, когда ${words.accusative} откроется всем ученикам. Пусто — ${words.accusative} под замком`}
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
