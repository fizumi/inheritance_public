export type SingleOrArray<A> = A | A[]
// yup/util
export const toArray = <A>(value?: null | A | A[]): A[] =>
  value == null ? [] : ([] as A[]).concat(value)

export const hasDupulicate = (xs: readonly any[]): boolean => {
  const [head, ...tail] = xs

  if (tail.length === 0) return false
  return tail.includes(head) || hasDupulicate(tail)
}

export const getNewIndexes =
  <ID>(ids: ID[]) =>
  (newIds: ID[]): number[] =>
    ids.reduce((acc, cur) => [...acc, newIds.findIndex((v) => v === cur)], [] as number[])

export const reorderArray =
  (array: any[]) =>
  (newIndexes: number[]): any[] =>
    array.reduce((acc, val, idx) => ((acc[newIndexes[idx]] = val), acc), [] as any)
