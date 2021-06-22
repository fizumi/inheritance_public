/* eslint-disable @typescript-eslint/ban-types */
import React from 'react'
import tb from 'ts-toolbelt'
import { readonlyRecord as RR } from 'fp-ts'
import * as R from 'ramda'

export type GetInnerOfMutableRefObjectOrIdentity<T> = T extends React.MutableRefObject<infer U>
  ? U
  : T

export type GetCurrentsOrIdentity<O extends tb.O.Object> = {
  [K in keyof O]: GetInnerOfMutableRefObjectOrIdentity<O[K]>
}

export const getCurrentsOrIdentity = <T extends Record<keyof T, any>>(
  refsOrNot: T
): GetCurrentsOrIdentity<T> => RR.Functor.map(refsOrNot, (a) => R.propOr(a, 'current', a)) as any

export type MapMutableRefObject<O extends tb.O.Object> = {
  [K in keyof O]: React.MutableRefObject<O[K]>
}

type _sample_object = {
  rejects: ((value: unknown) => void)[]
  timeoutIds: number[]
}
type _sample_refs = MapMutableRefObject<_sample_object>

type _sample_return = GetCurrentsOrIdentity<
  {
    values: number
  } & _sample_refs
>
