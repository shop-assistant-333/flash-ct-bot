import { Trash2 } from 'lucide-react'
import { useId } from 'react'

import { Button } from '@/shared/ui/button'
import { FIELD_ERROR, FIELD_HINT, FIELD_LABEL, fieldControlClasses } from '@/shared/ui/field-base'

import { emptyOption, withCorrectMark, type OptionDraft } from '../lib/question-values'

interface AnswerOptionsEditorProps {
  options: OptionDraft[]
  /** SINGLE_ANSWER marks the correct option like a radio, MULTI_ANSWER like a checkbox. */
  single: boolean
  onChange: (options: OptionDraft[]) => void
  error?: string
}

/** Options of a question with variants: add, remove, mark the correct one. */
export function AnswerOptionsEditor({
  options,
  single,
  onChange,
  error,
}: AnswerOptionsEditorProps) {
  // Radio buttons of one question have to share a name, and two editors can be
  // mounted at once (a form inside a modal over a form).
  const groupName = useId()

  const setText = (key: string, text: string) => {
    onChange(options.map((option) => (option.key === key ? { ...option, text } : option)))
  }

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className={FIELD_LABEL}>Варианты ответа</legend>
      <p className={FIELD_HINT}>
        {single
          ? 'Отметьте один правильный вариант'
          : 'Отметьте все правильные варианты — их может быть несколько'}
      </p>

      <ul className="flex flex-col gap-2">
        {options.map((option, index) => (
          <li key={option.key} className="flex items-center gap-1">
            <label className="flex size-11 shrink-0 items-center justify-center">
              <input
                type={single ? 'radio' : 'checkbox'}
                name={groupName}
                checked={option.correct}
                aria-label={`Вариант ${index + 1} — правильный`}
                onChange={(event) =>
                  onChange(withCorrectMark(options, option.key, event.target.checked, single))
                }
                className="size-5 accent-primary"
              />
            </label>
            <input
              type="text"
              value={option.text}
              aria-label={`Текст варианта ${index + 1}`}
              placeholder={`Вариант ${index + 1}`}
              onChange={(event) => setText(option.key, event.target.value)}
              className={fieldControlClasses(false)}
            />
            <button
              type="button"
              aria-label={`Удалить вариант ${index + 1}`}
              onClick={() => onChange(options.filter((item) => item.key !== option.key))}
              className="flex size-11 shrink-0 items-center justify-center rounded-control text-subtle transition-colors duration-150 active:bg-surface-sunken"
            >
              <Trash2 aria-hidden className="size-5" />
            </button>
          </li>
        ))}
      </ul>

      <Button variant="secondary" onClick={() => onChange([...options, emptyOption()])}>
        Добавить вариант
      </Button>

      {error === undefined ? null : <p className={FIELD_ERROR}>{error}</p>}
    </fieldset>
  )
}
