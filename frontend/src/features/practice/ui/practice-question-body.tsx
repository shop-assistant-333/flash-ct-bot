import type { AnswerResultDto, QuestionDto } from '../api/practice-api'
import { AnswerOption, type OptionVisualState } from './answer-option'

interface PracticeQuestionBodyProps {
  question: QuestionDto
  selectedOptionIds: number[]
  answerText: string
  result: AnswerResultDto | undefined
  onToggleOption: (optionId: number) => void
  onChangeText: (text: string) => void
}

function getOptionState(
  optionId: number,
  selectedOptionIds: number[],
  result: AnswerResultDto | undefined,
): OptionVisualState {
  const isSelected = selectedOptionIds.includes(optionId)

  if (!result) return isSelected ? 'selected' : 'idle'
  if (result.correctOptionIds.includes(optionId)) return 'correct'
  return isSelected ? 'incorrect' : 'idle'
}

export function PracticeQuestionBody({
  question,
  selectedOptionIds,
  answerText,
  result,
  onToggleOption,
  onChangeText,
}: PracticeQuestionBodyProps) {
  const answered = result !== undefined

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
          className="min-h-11 rounded-control bg-surface-sunken px-4 py-3 text-base text-fg placeholder:text-subtle disabled:cursor-not-allowed disabled:opacity-50"
        />
      ) : (
        <div className="flex flex-col gap-2">
          {question.options.map((option) => (
            <AnswerOption
              key={option.id}
              option={option}
              state={getOptionState(option.id, selectedOptionIds, result)}
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
