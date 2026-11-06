/** Swaps two positions of an id list — the shape both `.../order` endpoints take. */
export function withSwapped(ids: number[], from: number, to: number): number[] {
  const next = [...ids]
  const moved = next[from]
  const displaced = next[to]

  if (moved === undefined || displaced === undefined) return ids

  next[from] = displaced
  next[to] = moved
  return next
}
