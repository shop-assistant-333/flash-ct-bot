import { http, type StreakDto } from '@/shared/api'

export interface PeriodStatsDto {
  answered: number
  correct: number
  accuracyPercent: number
}

export interface LessonStatsItem {
  lessonId: number
  title: string
  correct: number
  total: number
  accuracyPercent: number
}

export interface StatsDto {
  subjectId: number
  total: PeriodStatsDto
  /** Окно, по которому бэкенд считает прогноз балла. */
  lastMonth: PeriodStatsDto
  lessonsCompleted: number
  lessonsTotal: number
  timeSpentMinutes: number
  streak: StreakDto
  byLesson: LessonStatsItem[]
}

export function fetchStats(subjectId: number, signal: AbortSignal): Promise<StatsDto> {
  return http.get<StatsDto>('/stats', { query: { subjectId }, signal })
}
