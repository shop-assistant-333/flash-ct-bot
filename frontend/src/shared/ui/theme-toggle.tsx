import { Moon, Smartphone, Sun } from 'lucide-react'

import { setThemePreference, useThemePreference, type ThemePreference } from '@/shared/lib/theme'

const OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: 'system', label: 'Системная', icon: Smartphone },
  { value: 'light', label: 'Светлая', icon: Sun },
  { value: 'dark', label: 'Тёмная', icon: Moon },
]

/** Segmented control that pins the colour theme or hands it back to Telegram/OS. */
export function ThemeToggle() {
  const preference = useThemePreference()

  return (
    <div aria-label="Тема оформления" role="group" className="flex gap-2">
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const isSelected = value === preference

        return (
          <button
            key={value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => setThemePreference(value)}
            className={`flex min-h-11 flex-1 flex-col items-center justify-center gap-1 rounded-control border px-2 py-2 text-xs font-medium transition-colors duration-150 ${
              isSelected
                ? 'border-primary bg-primary-soft text-primary-soft-fg'
                : 'border-border bg-surface text-muted active:bg-surface-sunken'
            }`}
          >
            <Icon aria-hidden className="size-4" />
            {label}
          </button>
        )
      })}
    </div>
  )
}
