import type { StatsDto } from '../api/stats-api'
import { pluralize } from './format'

/**
 * ЗАГЛУШКА прогноза балла — считается на клиенте и с бэкендом не соединена.
 *
 * Настоящий источник — `GET /api/stats/prediction` (`PredictionDto`): он ходит во внешнюю
 * модель, поэтому вынесен в отдельный медленный вызов. Когда его подключат, этот файл
 * удаляется, а `ScoreCard` получает `score`/`comment` из хука над эндпоинтом — форма данных
 * здесь специально совпадает с `PredictionDto`.
 *
 * Арифметика повторяет `LocalScorePredictor` на бэкенде: точность за последний месяц,
 * приспущенная за темы, которых студент ещё не касался — экзамен покрывает всю программу.
 */
export interface ScorePrediction {
  /** null, пока данных за месяц мало. */
  score: number | null
  comment: string
}

/** Меньше этого числа ответов за месяц — рассуждать не о чем (`app.stats.prediction-min-answers`). */
const MIN_ANSWERS = 20

/** Какая доля оценки приходится на охват программы, а не на точность ответов. */
const COVERAGE_WEIGHT = 0.25

export function predictScore(stats: StatsDto): ScorePrediction {
  const { answered, correct, accuracyPercent } = stats.lastMonth

  if (answered < MIN_ANSWERS) {
    const left = MIN_ANSWERS - answered
    return {
      score: null,
      comment: `Пока мало данных: за последний месяц решено ${answered} ${pluralize(answered, 'задание', 'задания', 'заданий')} из ${MIN_ANSWERS}. Решите ещё ${left} — и появится прогноз.`,
    }
  }

  const coverage = topicCoverage(stats)
  const score = Math.round(
    accuracyPercent * (1 - COVERAGE_WEIGHT) + accuracyPercent * coverage * COVERAGE_WEIGHT,
  )

  return {
    score: Math.min(100, Math.max(0, score)),
    comment:
      `За последний месяц верно ${correct} из ${answered}.` +
      (coverage < 1 ? ` Часть тем ещё не пройдена, поэтому оценка занижена.` : ''),
  }
}

/** Доля тем предмета, в которых студент решил хоть что-то. */
function topicCoverage(stats: StatsDto): number {
  if (stats.byLesson.length === 0) return 1

  const touched = stats.byLesson.filter((lesson) => lesson.total > 0).length
  return touched / stats.byLesson.length
}
