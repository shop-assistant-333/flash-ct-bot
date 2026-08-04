import { useNavigate } from 'react-router'

import {
  emptyQuestionValues,
  toQuestionRequest,
  type QuestionOwner,
  type QuestionValues,
} from '../lib/question-values'
import { useCreateQuestion } from '../hooks/use-create-question'
import { QuestionForm } from './question-form'

interface QuestionCreatorProps {
  owner: QuestionOwner
  /** Where the admin came from: the lesson or the practice list of the subject. */
  backHref: string
}

/** A new question of a lesson or of the practice deck — `order` is left to the backend. */
export function QuestionCreator({ owner, backHref }: QuestionCreatorProps) {
  const navigate = useNavigate()
  const createQuestion = useCreateQuestion()

  const handleSubmit = (values: QuestionValues) => {
    createQuestion.mutate(toQuestionRequest(values, owner), {
      onSuccess: () => {
        void navigate(backHref, { replace: true })
      },
    })
  }

  return (
    <QuestionForm
      initialValues={emptyQuestionValues()}
      submitLabel="Добавить вопрос"
      submitting={createQuestion.isPending}
      error={createQuestion.error}
      onSubmit={handleSubmit}
    />
  )
}
