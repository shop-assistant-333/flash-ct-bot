/**
 * `exactOptionalPropertyTypes` forbids passing an explicit `undefined`, so a
 * field without a message gets no `error` prop at all.
 */
export function errorProp(message: string | undefined): { error?: string } {
  return message === undefined ? {} : { error: message }
}
