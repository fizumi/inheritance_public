/* eslint-disable @typescript-eslint/ban-types */
import { function as F, semigroup as S, readonlyArray as A } from 'fp-ts'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

export const nil2emptyStr = R.when(R.isNil, () => '')

export const inclimentUntilNotReserved = (reserved: number[]): ((n: number) => number) =>
  F.flow(R.inc, R.until(R.complement(R.includes(R.__, reserved)), R.inc))

// https://github.com/ramda/ramda/issues/2134#issuecomment-291351644
export const shallowClone: <A extends ReadonlyArray<any> | {}>(a: A) => A = R.cond([
  [RA.isArray, R.concat([])],
  [RA.isObject, R.mergeRight({})],
  [R.T, R.identity],
]) as any
