import { Check, X } from 'lucide-react'

import type { AnswerOptionDto } from '../api/practice-api'

export type OptionVisualState = 'idle' | 'selected' | 'correct' | 'incorrect'

interface AnswerOptionProps {
  option: AnswerOptionDto
  state: OptionVisualState
  disabled: boolean
  selected: boolean
  onToggle: (optionId: number) => void
}

const STATE_CLASSES: Record<OptionVisualState, string> = {
  idle: 'border-border bg-surface active:bg-surface-sunken',
  selected: 'border-primary bg-primary-soft text-primary-soft-fg',
  correct: 'border-success bg-success-soft text-success-soft-fg',
  incorrect: 'border-danger bg-danger-soft text-danger-soft-fg',
}

export function AnswerOption({ option, state, disabled, selected, onToggle }: AnswerOptionProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      onClick={() => onToggle(option.id)}
      className={`flex min-h-12 w-full items-center justify-between gap-2 rounded-control border px-4 py-3 text-left text-base transition-colors duration-150 disabled:cursor-not-allowed ${STATE_CLASSES[state]}`}
    >
      <span className="break-words">{option.text}</span>
      {state === 'correct' ? <Check aria-hidden className="size-5 shrink-0" /> : null}
      {state === 'incorrect' ? <X aria-hidden className="size-5 shrink-0" /> : null}
    </button>
  )
}
