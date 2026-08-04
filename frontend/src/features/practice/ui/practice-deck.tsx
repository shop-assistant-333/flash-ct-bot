import { Inbox, LockKeyhole } from 'lucide-react'
import { useState } from 'react'

import { isApiError } from '@/shared/api'
import type { SubmitAnswerRequest } from '@/shared/api'
import { AnswerFeedback } from '@/shared/ui/answer-feedback'
import { Button } from '@/shared/ui/button'
import { QuestionView } from '@/shared/ui/question-view'
import { Spinner } from '@/shared/ui/spinner'
import { StateMessage } from '@/shared/ui/state-message'

import { useAdvancePractice } from '../hooks/use-advance-practice'
import { usePracticeAnswer } from '../hooks/use-practice-answer'
import { usePracticeQuestion } from '../hooks/use-practice-question'
import { useSubmitPracticeAnswer } from '../hooks/use-submit-practice-answer'

interface PracticeDeckProps {
  subjectId: number
}

/** One subject's practice loop: question → answer → feedback → next. */
export function PracticeDeck({ subjectId }: PracticeDeckProps) {
  const questionQuery = usePracticeQuestion(subjectId)
  const answerQuery = usePracticeAnswer(subjectId)
  const submitMutation = useSubmitPracticeAnswer(subjectId)
  const advance = useAdvancePractice(subjectId)

  const [selectedOptionIds, setSelectedOptionIds] = useState<number[]>([])
  const [answerText, setAnswerText] = useState('')

  if (questionQuery.isPending) return <Spinner />

  if (questionQuery.isError) {
    const { error } = questionQuery

    if (isApiError(error) && error.is('PRACTICE_DECK_EMPTY')) {
      return (
        <StateMessage
          icon={Inbox}
          title="Пока нет вопросов для практики"
          description="Загляните позже — база пополняется"
        />
      )
    }

    if (isApiError(error) && error.is('SUBSCRIPTION_EXPIRED')) {
      return (
        <StateMessage
          icon={LockKeyhole}
          title="Подписка на предмет закончилась"
          description="Продлите доступ, чтобы продолжить практику"
        />
      )
    }

    return (
      <StateMessage
        icon={Inbox}
        title="Не получилось загрузить вопрос"
        description="Проверьте соединение и попробуйте ещё раз"
        action={{ label: 'Повторить', onClick: () => void questionQuery.refetch() }}
      />
    )
  }

  const { question } = questionQuery.data
  const cachedAnswer = answerQuery.data
  const result = cachedAnswer?.result.questionId === question.id ? cachedAnswer.result : undefined
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
    const body: SubmitAnswerRequest =
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
      <QuestionView
        question={question}
        selectedOptionIds={selectedOptionIds}
        answerText={answerText}
        verdict={result}
        onToggleOption={toggleOption}
        onChangeText={setAnswerText}
      />

      {result ? <AnswerFeedback verdict={result} /> : null}

      {answered ? (
        <Button onClick={handleNext}>Следующий вопрос</Button>
      ) : (
        <Button onClick={handleSubmit} disabled={!canSubmit} loading={submitMutation.isPending}>
          Проверить
        </Button>
      )}

      {submitMutation.isError ? (
        <p role="status" className="text-sm text-danger">
          Не получилось отправить ответ. Попробуйте ещё раз.
        </p>
      ) : null}
    </div>
  )
}
