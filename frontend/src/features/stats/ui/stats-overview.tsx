import {
  Clock,
  Flame,
  GraduationCap,
  ListChecks,
  Target,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'

import { ProgressBar } from '@/shared/ui/progress-bar'

import type { StatsDto } from '../api/stats-api'
import { formatMinutes, pluralize } from '../lib/format'
import { StatTile } from './stat-tile'

interface StatsOverviewProps {
  stats: StatsDto
}

/** Счётчики предмета: четыре тайла плюс стрик практики во всю ширину. */
export function StatsOverview({ stats }: StatsOverviewProps) {
  const { total, lastMonth, streak } = stats

  // Дельта имеет смысл, только когда есть с чем сравнивать: за месяц и за всё время.
  const accuracyDelta =
    lastMonth.answered > 0 && total.answered > lastMonth.answered
      ? lastMonth.accuracyPercent - total.accuracyPercent
      : 0

  const DeltaIcon = accuracyDelta > 0 ? TrendingUp : TrendingDown

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatTile
        icon={ListChecks}
        label="Решено"
        value={String(total.answered)}
        hint={
          <span className="text-xs text-subtle tabular-nums">
            {lastMonth.answered > 0 ? `+${lastMonth.answered} за месяц` : 'за месяц ничего'}
          </span>
        }
      />

      <StatTile
        icon={Target}
        label="Точность"
        value={`${total.accuracyPercent}%`}
        hint={
          accuracyDelta === 0 ? (
            <span className="text-xs text-subtle">
              {total.answered > 0 ? `верно ${total.correct}` : 'нет ответов'}
            </span>
          ) : (
            <span
              className={`flex items-center gap-1 text-xs tabular-nums ${
                accuracyDelta > 0 ? 'text-success' : 'text-danger'
              }`}
            >
              <DeltaIcon aria-hidden className="size-3.5" />
              {accuracyDelta > 0 ? '+' : '−'}
              {Math.abs(accuracyDelta)} п. п. за месяц
            </span>
          )
        }
      />

      <StatTile
        icon={GraduationCap}
        label="Уроки"
        value={`${stats.lessonsCompleted} / ${stats.lessonsTotal}`}
        hint={
          <div className="mt-1">
            <ProgressBar
              value={stats.lessonsCompleted}
              max={stats.lessonsTotal}
              label="Пройдено уроков"
            />
          </div>
        }
      />

      <StatTile
        icon={Clock}
        label="В приложении"
        value={formatMinutes(stats.timeSpentMinutes)}
        hint={<span className="text-xs text-subtle">по всем предметам</span>}
      />

      <div className="col-span-2 flex items-center gap-3 rounded-card bg-streak-soft p-4">
        <Flame aria-hidden className="size-6 shrink-0 text-streak" />
        <div className="flex flex-col">
          <span className="text-sm text-muted">Стрик в практике</span>
          <span className="text-2xl font-bold text-streak-soft-fg tabular-nums">
            {streak.current}{' '}
            <span className="text-sm font-normal text-muted">
              {pluralize(streak.current, 'ответ', 'ответа', 'ответов')} подряд
            </span>
          </span>
        </div>
        <span className="ml-auto shrink-0 text-xs text-muted tabular-nums">
          рекорд {streak.best}
        </span>
      </div>
    </div>
  )
}
