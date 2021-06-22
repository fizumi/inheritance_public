import tb from 'ts-toolbelt'
import { function as F, option as O, array as A } from 'fp-ts'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import { ValueOrReadonlyArray } from 'src/utils/types'
import { isEmptyRecursive } from './predicate'
import { boolean } from 'mathjs'

export const rejectDuplicates = R.symmetricDifference([])
export const rejectEquals = <A>(a: A): (<B>(abs: readonly (A | B)[]) => B[]) =>
  R.reject(R.equals(a)) as <B>(abs: readonly (A | B)[]) => B[]
export const rejectNil = R.reject(R.isNil) as <A>(xs: readonly A[]) => tb.Union.NonNullable<A>[]
export const rejectEmpty = R.reject(R.isEmpty) as <A>(xs: readonly A[]) => A[]

type AS_AS_Boolean = <A>(as: readonly A[]) => (as2: readonly A[]) => boolean
export const noIntersection: AS_AS_Boolean = (as) =>
  F.flow(R.intersection(as), R.length, R.equals(0))
export const hasIntersection: AS_AS_Boolean = (as) => R.complement(noIntersection(as))

export const includsAll: AS_AS_Boolean = (as) => (as2) => as.every(R.includes(R.__, as2))

export const adjust =
  <A>(a: A) =>
  (fn: (a: A) => A) =>
  (as: readonly A[]): A[] =>
    R.adjust(R.indexOf(a, as), fn, as)
// export const adjust = <A>(a: A, fn: (a: A) => A, as: A[]): A[] => R.adjust(R.indexOf(a, as), fn, as)
// export const adjust = R.curry(_adjust)

export const getArrayArg = <T>(...as: T[]): T[] => {
  const head = as[0]
  if (Array.isArray(head)) return head
  return as
}

export const allPass = <A>(pred: (a: A) => boolean): ((...a: A[]) => boolean) =>
  F.flow(
    getArrayArg,
    A.reduce(true as boolean, (acc, x) => {
      if (acc === false) R.reduced(acc)
      return acc && pred(x)
    })
  )

export const anyPass = <A>(pred: (a: A) => boolean): ((...a: A[]) => boolean) =>
  F.flow(
    getArrayArg,
    A.reduce(false as boolean, (acc, x) => {
      if (acc === true) R.reduced(acc)
      return acc || pred(x)
    })
  )

export const isNoNil = allPass(R.complement(R.isNil))

const get =
  (direction: 'next' | 'prev') =>
  <A>(as: A[]) =>
  (a: A): A =>
    F.pipe(
      R.findIndex(R.equals(a), as),
      direction === 'next' ? R.inc : R.dec,
      R.clamp(0, as.length - 1),
      (i: number) => as[i]
    )
export const [getNext, getPrev] = [get('next'), get('prev')]

export const deleteEmptyRecursively = <T>(
  strAry: readonly ValueOrReadonlyArray<T>[]
): readonly ValueOrReadonlyArray<T>[] =>
  strAry.reduce<ValueOrReadonlyArray<T>[]>((acc, curVal) => {
    if (R.isEmpty(curVal)) {
      return acc
    }
    if (!R.is(Array, curVal)) {
      return [...acc, curVal]
    }
    if (isEmptyRecursive(curVal as ValueOrReadonlyArray<T>[])) {
      return acc
    }
    return [...acc, deleteEmptyRecursively(curVal as ValueOrReadonlyArray<T>[])]
  }, [])

// https://github.com/ramda/ramda/wiki/Cookbook#ziplongest-zip-lists-to-the-longest-lists-length
export const zipWithLongest = <X, Y, TResult>(
  fn: (x: X | undefined, y: Y | undefined) => TResult,
  xs: readonly X[],
  ys: readonly Y[]
): TResult[] => {
  const concat = <Z extends X | Y>(z1: readonly (Z | undefined)[], z2: undefined[]) => z1.concat(z2)
  if (xs.length < ys.length) {
    const xxs = concat(xs, R.repeat(undefined, ys.length - xs.length))
    return R.zipWith(fn, xxs, ys)
  } else if (ys.length < xs.length) {
    const yys = concat(ys, R.repeat(undefined, xs.length - ys.length))
    return R.zipWith(fn, xs, yys)
  }
  return R.zipWith(fn, xs, ys)
}
