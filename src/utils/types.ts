import tb from 'ts-toolbelt'
import { readonlyRecord as RR } from 'fp-ts'
import * as R from 'ramda'

export const toDict = <T extends readonly string[]>(
  keys: T
): {
  [K in T[number]]: K
} => R.zipObj(keys, keys) as any

export type InvertObj<T extends tb.L.List> = tb.O.Invert<tb.L.ObjectOf<T>>

export const invertToNumberValueObj = <T extends readonly string[]>(
  keys: T
): MapToNumber<InvertObj<T>> => RR.map(Number)(R.invertObj(keys)) as any
type ToNumber<StrNum extends string> = tb.N.Format<StrNum, 'n'>
type MapToNumber<T extends Record<string, string>> = {
  [K in keyof T]: ToNumber<T[K]>
}

export const tag = '_tag' as const
export type Tagged = Record<typeof tag, unknown>
export type OmitTag<T> = Omit<T, typeof tag>

// https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/src/rules/ban-types.ts
// If you want a type meaning "empty object", you probably want `Record<string, never>` instead.
export type EmptyObj = Record<tb.Any.Key, never>

// https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/src/rules/ban-types.ts
// If you want a type meaning "any object", you probably want `Record<string, unknown>` instead.
export type AnyObj = Record<tb.Any.Key, unknown>
// ↑ class は含まれない

export type MapValue<V, A extends tb.O.Object> = { [K in keyof A]: V }
export type Class2Record<O extends tb.O.Object> = { [K in keyof O]: O[K] }

export type RemoveUnknown<T> = tb.A.Equals<T, unknown> extends tb.B.True ? never : T

// https://github.com/microsoft/TypeScript/pull/33050#issue-310402773
// Recursive type references
export type ValueOrArray<T> = T | Array<ValueOrArray<T>>

export type ValueOrReadonlyArray<T> = T | ReadonlyArray<ValueOrReadonlyArray<T>>

export type Arrayify<O extends tb.O.Object> = {
  [K in keyof O]: Array<O[K]>
}

// ts-toolbelt: https://millsp.github.io/ts-toolbelt/modules/_object_omit_.html
export type MapOmit<T, U extends string> = T extends { [K in U]: unknown } ? Omit<T, U> : T

export type Nullable<T extends Record<string, unknown>> = Partial<{ [K in keyof T]: T[K] | null }>

export type GuardType<Type> = Type extends (x: any) => x is infer U ? U : never

export type GetEachReturn<T extends Record<string, (...x: any[]) => any>> = {
  [K in keyof T]: T[K] extends (...x: any[]) => infer R ? R : never
}

// https://www.peterstuart.org/posts/2020-03-07-writing-type-level-switch-statement-typescript/
export type Switch<T, Conditions extends Array<[any, any]>> = {
  hasCondition: T extends tb.L.Head<Conditions>[0]
    ? tb.L.Head<Conditions>[1]
    : Switch<T, tb.L.Tail<Conditions>>
  hasNoConditions: never
}[tb.L.Head<Conditions> extends never ? 'hasNoConditions' : 'hasCondition']

export type Uncury2<T> = T extends (x: infer X) => (y: infer Y) => infer R
  ? (...args: [X, Y]) => R
  : never
export type Uncury3<T> = T extends (x: infer X) => (y: infer Y) => (z: infer Z) => infer R
  ? (...args: [X, Y, Z]) => R
  : never

// react-hook-form
export type DeepPartial<T> = T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends { [key in keyof T]: T[key] }
  ? {
      [K in keyof T]?: DeepPartial<T[K]>
    }
  : T
