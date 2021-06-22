/* eslint-disable @typescript-eslint/ban-types */
// import tb from 'ts-toolbelt'
import * as tb from 'ts-toolbelt/out' // 最新の ts-toolbelt を使う
import * as R from 'ramda'
import { RemoveUnknown, Uncury2, Uncury3 } from '../../types'

type SafePred<ArgTuple extends any[]> = (...a: ArgTuple) => boolean
type Pred<A extends any> = (a: A) => boolean

declare module 'ramda' {
  // function anyPass<Arg extends any>(preds: Array<Pred<Arg>>): Pred<Arg>
  // function anyPass<ArgTuple extends any[]>(preds: Array<SafePred<ArgTuple>>): SafePred<ArgTuple>

  function append<T>(__: R.Placeholder, list: readonly T[]): (el: T) => T[]

  function assocPath<P extends tb.L.List<string | number>, T, U>(path: P, val: T, obj: U): U

  function call<A, R>(fn: (...arg: readonly [A]) => R, ...arg: readonly [A]): R
  function call<A, B, R>(fn: (...args: readonly [A, B]) => R, ...args: readonly [A, B]): R
  function call<A, B, C, R>(fn: (...args: readonly [A, B, C]) => R, ...args: readonly [A, B, C]): R

  function cond<Arg, B>(fns: Array<[Pred<Arg>, (a: Arg) => B]>): (a: Arg) => B
  function cond<ArgTuple extends any[], B>(
    fns: Array<[SafePred<ArgTuple>, (...a: ArgTuple[]) => B]>
  ): (...a: ArgTuple[]) => B

  function dissoc<T extends string>(
    prop: T
  ): <U extends Record<string, unknown>>(obj: U) => tb.O.Omit<U, T>

  // to avoid this error -> TS2589: Type instantiation is excessively deep and possibly infinite.
  function mergeDeepRight<A extends object, B extends object>(a: A, b: B): tb.O.Merge<B, A, 'deep'>
  function mergeDeepLeft<A extends object, B extends object>(a: A, b: B): tb.O.Merge<A, B, 'deep'>

  function head<T extends any>(list: T[]): T | undefined // 頑張っても上手くいかない．nth(0) だと上手くいく．

  function ifElse<Pred extends R.Pred, Fn1 extends R.Arity1Fn, Fn2 extends R.Arity1Fn>(
    fn: Pred,
    onTrue: Fn1,
    onFalse: Fn2
  ): (
    a:
      | RemoveUnknown<tb.L.Head<Parameters<Pred>>>
      | RemoveUnknown<tb.L.Head<Parameters<Fn1>>>
      | RemoveUnknown<tb.L.Head<Parameters<Fn2>>>
  ) => RemoveUnknown<ReturnType<Fn1>> | RemoveUnknown<ReturnType<Fn2>>

  function join<X extends string, XS extends ReadonlyArray<any>>(
    x: X,
    xs: XS
  ): tb.String.Join<tb.L.Writable<XS>, X>

  // ↓ ちゃんと求まるが計算が重くなりすぎるので tb.O.Path は別途利用した方がよい
  // function path<P extends tb.L.List<string | number>, O extends tb.O.Object>( path: P, obj: O): tb.O.Path<O, P>
  function path<P extends tb.L.List<string | number>, T>(path: P, obj: any): T | undefined

  function prop<P extends string>(p: P): <T extends { [K in P]: any }>(obj: T) => T[P]
  function prop<P extends string, T extends { [K in P]: any }>(p: P, obj: T): T[P]

  function propEq<O extends Record<string, any>, K extends keyof O>(
    prop: K,
    val: O[K]
  ): (obj: O) => boolean

  function set<S, A>(lens: R.Lens<S, A>): (a: A) => (obj: S) => S

  function uncurryN(len: 2): <T extends (...a: any[]) => any>(fn: T) => Uncury2<T>
  function uncurryN(len: 3): <T extends (...a: any[]) => any>(fn: T) => Uncury3<T>

  function union(as: readonly string[], bs: readonly string[]): string[]

  function when<T, U>(
    predicate: (x: T) => boolean
  ): tb.F.Curry<(whenTrueFn: (a: T) => U, input: T) => T | U>
  function when<T, U>(
    predicate: (x: T) => boolean,
    whenTrueFn: (a: T) => U
  ): <V extends T>(input: V) => V | U
}
