import type { QuestionDto } from '@/shared/api'
import { AnswerOption, type OptionVisualState } from '@/shared/ui/answer-option'

/**
 * The part of a graded answer this view needs. Both `AnswerResultDto` (practice
 * and homework verdicts) and `AnswerDto` (a stored homework answer) satisfy it.
 */
export interface AnswerVerdict {
  correct: boolean
  correctOptionIds: number[]
  correctAnswer: string | null
  explanation: string
}

interface QuestionViewProps {
  question: QuestionDto
  selectedOptionIds: number[]
  answerText: string
  /** Set once the question is graded: locks the input and paints the options. */
  verdict: AnswerVerdict | undefined
  onToggleOption: (optionId: number) => void
  onChangeText: (text: string) => void
}

function getOptionState(
  optionId: number,
  selectedOptionIds: number[],
  verdict: AnswerVerdict | undefined,
): OptionVisualState {
  const isSelected = selectedOptionIds.includes(optionId)

  if (!verdict) return isSelected ? 'selected' : 'idle'
  if (verdict.correctOptionIds.includes(optionId)) return 'correct'
  return isSelected ? 'incorrect' : 'idle'
}

/** Question text plus its answer controls — shared by homework and practice. */
export function QuestionView({
  question,
  selectedOptionIds,
  answerText,
  verdict,
  onToggleOption,
  onChangeText,
}: QuestionViewProps) {
  const answered = verdict !== undefined

  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg break-words text-fg">{question.title}</p>

      {question.type === 'INPUT' ? (
        <input
          type="text"
          value={answerText}
          disabled={answered}
          onChange={(event) => onChangeText(event.target.value)}
          placeholder="Ваш ответ"
          className={`min-h-11 rounded-control px-4 py-3 text-base text-fg placeholder:text-subtle disabled:cursor-not-allowed ${
            answered
              ? `border ${verdict.correct ? 'border-success bg-success-soft text-success-soft-fg' : 'border-danger bg-danger-soft text-danger-soft-fg'}`
              : 'bg-surface-sunken'
          }`}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {question.options.map((option) => (
            <AnswerOption
              key={option.id}
              option={option}
              state={getOptionState(option.id, selectedOptionIds, verdict)}
              disabled={answered}
              selected={selectedOptionIds.includes(option.id)}
              onToggle={onToggleOption}
            />
          ))}
        </div>
      )}
    </div>
  )
}
