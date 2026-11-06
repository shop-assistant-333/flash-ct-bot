const PREFIX = 'question-'

/**
 * Element id of a question row in the lesson editor. Lives in `shared` because
 * two layers agree on it: the route builder writes it into the URL hash and the
 * lesson feature puts it on the row.
 */
export function questionAnchorId(questionId: number): string {
  return `${PREFIX}${questionId}`
}

/** `#question-12` → 12; anything else → undefined. */
export function parseQuestionAnchor(hash: string): number | undefined {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash
  if (!raw.startsWith(PREFIX)) return undefined

  const id = Number(raw.slice(PREFIX.length))
  return Number.isInteger(id) && id > 0 ? id : undefined
}
