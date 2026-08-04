import type { SubjectItem } from './subjects-api'

interface SubjectTabsProps {
  subjects: SubjectItem[]
  selectedId: number
  onSelect: (subjectId: number) => void
}

/** Switcher between the student's subjects. Hidden when there is only one. */
export function SubjectTabs({ subjects, selectedId, onSelect }: SubjectTabsProps) {
  if (subjects.length < 2) return null

  return (
    <div aria-label="Предмет" role="group" className="flex gap-2 overflow-x-auto">
      {subjects.map((subject) => {
        const isSelected = subject.id === selectedId

        return (
          <button
            key={subject.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(subject.id)}
            className={`min-h-11 shrink-0 rounded-control border px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-150 ${
              isSelected
                ? 'border-primary bg-primary-soft text-primary-soft-fg'
                : 'border-border bg-surface text-muted active:bg-surface-sunken'
            } ${subject.active ? '' : 'opacity-60'}`}
          >
            {subject.name}
          </button>
        )
      })}
    </div>
  )
}
