import { ListPlus, WifiOff } from 'lucide-react'

import { ListRow } from '@/shared/ui/list-row'
import { QuestionTypeBadge } from '@/shared/ui/question-type-badge'
import { Spinner } from '@/shared/ui/spinner'
import { StateMessage } from '@/shared/ui/state-message'

import { usePracticeQuestions } from '../hooks/use-practice-questions'

interface PracticeQuestionsListProps {
  subjectId: number
  questionHref: (questionId: number) => string
}

/** Questions of a subject that belong to no lesson — style guide §6, dense rows. */
export function PracticeQuestionsList({ subjectId, questionHref }: PracticeQuestionsListProps) {
  const questionsQuery = usePracticeQuestions(subjectId)

  if (questionsQuery.isPending) return <Spinner />

  if (questionsQuery.isError) {
    return (
      <StateMessage
        icon={WifiOff}
        title="Не получилось загрузить вопросы"
        description="Проверьте соединение и попробуйте ещё раз"
        action={{ label: 'Повторить', onClick: () => void questionsQuery.refetch() }}
      />
    )
  }

  const questions = questionsQuery.data

  if (questions.length === 0) {
    return (
      <StateMessage
        icon={ListPlus}
        title="Вопросов пока нет"
        description="Это дополнительные задания вне уроков: студент встречает их только на вкладке «Практика»"
      />
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {questions.map((question) => (
        <li key={question.id}>
          <ListRow
            title={question.title}
            meta={<QuestionTypeBadge type={question.type} />}
            to={questionHref(question.id)}
          />
        </li>
      ))}
    </ul>
  )
}
