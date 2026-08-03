import { LoaderCircle } from 'lucide-react'

export function Spinner() {
  return (
    <output aria-label="Загрузка" className="my-6 flex justify-center text-accent">
      <LoaderCircle aria-hidden className="size-6 animate-spin" />
    </output>
  )
}
