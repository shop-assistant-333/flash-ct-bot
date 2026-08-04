import { Flame } from 'lucide-react'
import { useState } from 'react'

import type { StreakDto } from '@/shared/api'

interface StreakBadgeProps {
  streak: StreakDto
}

/** Shakes when the streak drops back down — never turns red, per style guide §6. */
export function StreakBadge({ streak }: StreakBadgeProps) {
  const [prevCurrent, setPrevCurrent] = useState(streak.current)
  const [shake, setShake] = useState(false)

  if (streak.current !== prevCurrent) {
    setShake(streak.current < prevCurrent)
    setPrevCurrent(streak.current)
  }

  return (
    <div
      role="status"
      aria-live="polite"
      onAnimationEnd={() => setShake(false)}
      className={`flex items-center gap-1 self-start rounded-control bg-streak-soft px-4 py-2 ${
        shake ? 'animate-shake' : ''
      }`}
    >
      <Flame aria-hidden className="size-6 text-streak" />
      <span className="text-2xl font-bold text-streak-soft-fg tabular-nums">{streak.current}</span>
    </div>
  )
}
