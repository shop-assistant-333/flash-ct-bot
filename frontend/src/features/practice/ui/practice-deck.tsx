import { Inbox, LoaderCircle, LockKeyhole } from 'lucide-react'
import { useState } from 'react'

import { isApiError } from '@/shared/api'
import { Spinner } from '@/shared/ui/spinner'

import type { SubmitPracticeAnswerRequest } from '../api/practice-api'
import { useAdvancePractice } from '../hooks/use-advance-practice'
import { usePracticeQuestion } from '../hooks/use-practice-question'
import { useSubmitPracticeAnswer } from '../hooks/use-submit-practice-answer'
import { PracticeFeedback } from './practice-feedback'
import { PracticeQuestionBody } from './practice-question-body'
import { PracticeStateMessage } from './practice-state-message'
import { StreakBadge } from './streak-badge'

interface PracticeDeckProps {
  subjectId: number
}

/** One subject's practice loop: question → answer → feedback → next. */
export function PracticeDeck({ subjectId }: PracticeDeckProps) {
  const questionQuery = usePracticeQuestion(subjectId)
  const submitMutation = useSubmitPracticeAnswer(subjectId)
  const advance = useAdvancePractice(subjectId)

  const [selectedOptionIds, setSelectedOptionIds] = useState<number[]>([])
  const [answerText, setAnswerText] = useState('')

  if (questionQuery.isPending) return <Spinner />

  if (questionQuery.isError) {
    const { error } = questionQuery

    if (isApiError(error) && error.is('PRACTICE_DECK_EMPTY')) {
      return (
        <PracticeStateMessage
          icon={Inbox}
          title="Пока нет вопросов для практики"
          description="Загляните позже — база пополняется"
        />
      )
    }

    if (isApiError(error) && error.is('SUBSCRIPTION_EXPIRED')) {
      return (
        <PracticeStateMessage
          icon={LockKeyhole}
          title="Подписка на предмет закончилась"
          description="Продлите доступ, чтобы продолжить практику"
        />
      )
    }

    return (
      <PracticeStateMessage
        icon={Inbox}
        title="Не получилось загрузить вопрос"
        description="Проверьте соединение и попробуйте ещё раз"
        action={{ label: 'Повторить', onClick: () => void questionQuery.refetch() }}
      />
    )
  }

  const { question, streak } = questionQuery.data
  const result = submitMutation.data?.result
  const currentStreak = submitMutation.data?.streak ?? streak
  const answered = result !== undefined

  function toggleOption(optionId: number) {
    if (answered) return
    setSelectedOptionIds((current) => {
      if (question.type === 'SINGLE_ANSWER') return [optionId]
      return current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId]
    })
  }

  function handleSubmit() {
    const body: SubmitPracticeAnswerRequest =
      question.type === 'INPUT'
        ? { questionId: question.id, answerText }
        : { questionId: question.id, selectedOptionIds }

    submitMutation.mutate(body)
  }

  function handleNext() {
    submitMutation.reset()
    setSelectedOptionIds([])
    setAnswerText('')
    advance()
  }

  const canSubmit =
    question.type === 'INPUT' ? answerText.trim() !== '' : selectedOptionIds.length > 0

  return (
    <div className="flex flex-col gap-6">
      <StreakBadge streak={currentStreak} />

      <PracticeQuestionBody
        question={question}
        selectedOptionIds={selectedOptionIds}
        answerText={answerText}
        result={result}
        onToggleOption={toggleOption}
        onChangeText={setAnswerText}
      />

      {result ? <PracticeFeedback result={result} /> : null}

      {answered ? (
        <button
          type="button"
          onClick={handleNext}
          className="min-h-11 w-full rounded-control bg-primary px-4 py-3 font-semibold text-primary-fg transition-colors duration-150 active:bg-primary-hover"
        >
          Следующий вопрос
        </button>
      ) : (
        <button
          type="button"
          disabled={!canSubmit || submitMutation.isPending}
          onClick={handleSubmit}
          className="flex min-h-11 w-full items-center justify-center rounded-control bg-primary px-4 py-3 font-semibold text-primary-fg transition-colors duration-150 active:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitMutation.isPending ? (
            <LoaderCircle aria-hidden className="size-5 animate-spin" />
          ) : (
            'Проверить'
          )}
        </button>
      )}

      {submitMutation.isError ? (
        <p role="status" className="text-sm text-danger">
          Не получилось отправить ответ. Попробуйте ещё раз.
        </p>
      ) : null}
    </div>
  )
}
