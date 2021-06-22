import { function as F, option as O, string, readonlyArray as A } from 'fp-ts'
import * as R from 'ramda'

export const addStr =
  (a: string) =>
  (b: string): string =>
    b + a

// useRifm
export const cleanBy = (accept: RegExp): ((str: string) => string) =>
  F.flow(R.match(accept), R.join(''))

// 用途 : font-family(css) の最初だけ除く
export const removeHeadFromCSV: (str: string) => string = F.flow(
  R.split(','),
  R.tail as <T extends any>(list: readonly T[]) => T[],
  R.join(',')
)

export const getNthSeparatedBy =
  (separator: string) =>
  (index: number): ((str: string) => O.Option<string>) =>
    F.flow(R.split(separator), R.nth(index), O.fromNullable)

export const sortStrings = A.sort(string.Ord)
// eslint-disable-next-line react-hooks/rules-of-hooks
export const sameSetOfStrings = R.useWith(R.equals, [sortStrings, sortStrings]) as {
  (a1: readonly string[]): (a2: readonly string[]) => boolean
  (a1: readonly string[], a2: readonly string[]): boolean
}
