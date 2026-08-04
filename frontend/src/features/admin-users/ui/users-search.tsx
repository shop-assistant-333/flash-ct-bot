import { useEffect, useState } from 'react'

import { TextField } from '@/shared/ui/text-field'

interface UsersSearchProps {
  value: string
  /** Writes the query into the URL — keep it stable (`useCallback`). */
  onChange: (value: string) => void
}

const DEBOUNCE_MS = 300

export function UsersSearch({ value, onChange }: UsersSearchProps) {
  const [text, setText] = useState(value)

  // Typing must not rewrite the URL (and refetch the list) on every keystroke,
  // so the query is pushed up only after a pause.
  useEffect(() => {
    if (text === value) return

    const timer = setTimeout(() => onChange(text), DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [text, value, onChange])

  return (
    <TextField
      label="Поиск"
      value={text}
      onChange={setText}
      placeholder="Имя, username или telegram id"
    />
  )
}
