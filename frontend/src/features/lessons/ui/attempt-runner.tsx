import { useState } from 'react'

import { isApiError } from '@/shared/api'
import type { SubmitAnswerRequest } from '@/shared/api'
import { AnswerFeedback } from '@/shared/ui/answer-feedback'
import { Button } from '@/shared/ui/button'
import { ProgressBar } from '@/shared/ui/progress-bar'
import { QuestionView } from '@/shared/ui/question-view'

import type { AttemptDto, AttemptResultDto } from '../api/lessons-api'
import { useCompleteAttempt } from '../hooks/use-complete-attempt'
import { useSubmitAnswer } from '../hooks/use-submit-answer'

interface AttemptRunnerProps {
  attempt: AttemptDto
  /** The attempt is being refetched after an answer — the cursor is not final yet. */
  refreshing: boolean
  onCompleted: (result: AttemptResultDto) => void
}

function submitErrorText(error: unknown): string {
  if (isApiError(error) && error.is('QUESTION_ALREADY_ANSWERED')) {
    return 'Ответ на этот вопрос уже сохранён. Обновите экран.'
  }
  if (isApiError(error) && error.is('ATTEMPT_ALREADY_COMPLETED')) {
    return 'Урок уже завершён. Обновите экран.'
  }
  return 'Не получилось отправить ответ. Попробуйте ещё раз.'
}

/** Solving of a lesson: question → verdict → next, and the finish button at the end. */
export function AttemptRunner({ attempt, refreshing, onCompleted }: AttemptRunnerProps) {
  const submitMutation = useSubmitAnswer(attempt.lesson.id, attempt.id)
  const completeMutation = useCompleteAttempt(attempt.id)

  const [selectedOptionIds, setSelectedOptionIds] = useState<number[]>([])
  const [answerText, setAnswerText] = useState('')

  const questions = attempt.lesson.questions
  const verdict = submitMutation.data
  // While the verdict is on screen the attempt has already moved on server-side,
  // so the answered question is looked up by id rather than by the cursor.
  const question = verdict
    ? questions.find((candidate) => candidate.id === verdict.questionId)
    : questions[attempt.currentQuestionIndex]

  function toggleOption(optionId: number) {
    if (verdict || question === undefined) return

    setSelectedOptionIds((current) => {
      if (question.type === 'SINGLE_ANSWER') return [optionId]
      return current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId]
    })
  }

  function handleSubmit() {
    if (question === undefined) return

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
  }

  function handleComplete() {
    completeMutation.mutate(undefined, { onSuccess: onCompleted })
  }

  const answeredCount = attempt.answers.length
  const position = question ? questions.indexOf(question) + 1 : questions.length
  const canSubmit =
    question?.type === 'INPUT' ? answerText.trim() !== '' : selectedOptionIds.length > 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted tabular-nums">
          Вопрос {position} из {questions.length}
        </p>
        <ProgressBar value={answeredCount} max={questions.length} label="Прогресс по уроку" />
      </div>

      {question === undefined ? (
        <p className="text-base text-fg">
          Все вопросы отвечены. Завершите урок, чтобы увидеть результат и открыть следующий.
        </p>
      ) : (
        <>
          <QuestionView
            question={question}
            selectedOptionIds={selectedOptionIds}
            answerText={answerText}
            verdict={verdict}
            onToggleOption={toggleOption}
            onChangeText={setAnswerText}
          />
          {verdict ? <AnswerFeedback verdict={verdict} /> : null}
        </>
      )}

      {/* Sticky: on a long question the action stays reachable — style guide §6. */}
      <div className="sticky bottom-nav-safe">
        {question === undefined || verdict?.lastQuestion ? (
          <Button onClick={handleComplete} loading={completeMutation.isPending}>
            Завершить урок
          </Button>
        ) : verdict ? (
          <Button onClick={handleNext} loading={refreshing}>
            Следующий вопрос
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={!canSubmit} loading={submitMutation.isPending}>
            Проверить
          </Button>
        )}
      </div>

      {submitMutation.isError ? (
        <p role="status" className="text-sm text-danger">
          {submitErrorText(submitMutation.error)}
        </p>
      ) : null}
      {completeMutation.isError ? (
        <p role="status" className="text-sm text-danger">
          Не получилось завершить урок. Попробуйте ещё раз.
        </p>
      ) : null}
    </div>
  )
}
