/**
 * `exactOptionalPropertyTypes` forbids handing an explicit `undefined` to an
 * optional prop, so a field without an error gets no `error` key at all.
 */
export function errorProp(message: string | undefined): { error?: string } {
  return message === undefined || message === '' ? {} : { error: message }
}
