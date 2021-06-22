/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  function as F,
  option as O,
  either as E,
  readonlyRecord as RR,
  task,
  taskOption as TO,
  taskEither as TE,
  io,
} from 'fp-ts'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import { GetEachReturn } from 'src/utils/types'

export const nilHole = R.when(R.isNil, F.hole) as <A>(a: A) => NonNullable<A>

export const isThunk = (x: any): x is () => any => RA.isFunction(x) && R.propEq('length', 0, x)
export const isUnaryFunction = (x: any): x is (a: any) => any =>
  RA.isFunction(x) && R.propEq('length', 1, x)

export type ValueOrThunk<A> = A | (() => A)
export const fromValueOrThunk = <A>() => getValueIfThunk as (x: ValueOrThunk<A>) => A
export const getValueIfThunk: <A>(x: ValueOrThunk<A>) => A = (x) => (isThunk(x) ? x() : x)

/**
 * try get A that is R.allPass([RA.isNotNil, pred_you_provide]).
 */
export const repetitiveGet = <A>(
  fn: io.IO<A>,
  tryCount = 3,
  intervalMs = 0,
  pred?: (a: A) => boolean
): TO.TaskOption<A> =>
  tryCount > 0
    ? F.pipe(
        task.delay(intervalMs)(task.fromIO(fn)),
        TO.fromTask,
        TO.filter(R.allPass([RA.isNotNil, ...(pred ? [pred] : [])])),
        TO.alt(() => repetitiveGet(fn, tryCount - 1, intervalMs, pred))
      )
    : TO.none

export const runRepetitiveGet = F.flow(repetitiveGet, (to) =>
  to().then(O.getOrElseW(F.constUndefined))
)

/**
 *
 * @param fn true: success, false: retry, string: cancel retry
 * @param tryCount
 * @param intervalMs
 * @returns
 */
export const repetitiveTry = (
  fn: io.IO<boolean | string>,
  tryCount = 3,
  intervalMs = 100
): task.Task<string> =>
  tryCount > 0
    ? F.pipe(
        task.delay(intervalMs)(task.fromIO(fn)),
        task.chain((msgOrisSuccess) =>
          typeof msgOrisSuccess === 'string'
            ? task.of(msgOrisSuccess)
            : msgOrisSuccess
            ? task.of('')
            : repetitiveTry(fn, tryCount - 1, intervalMs)
        )
      )
    : task.of('tried')

/**
 *
 * @param fn true: success, false: retry, string: cancel retry
 * @param tryCount
 * @param intervalMs
 * @returns 'tried': tried tryCount times, ''(empty string): success, other: fail
 */
export const doRepetitiveTry = (
  fn: io.IO<boolean | string>,
  tryCount = 3,
  intervalMs = 100
): Promise<string> =>
  repetitiveTry(fn, tryCount, intervalMs)().then((x) => (x !== '' ? Promise.reject(x) : x))

const SUCCESS = 'success'
const CANCEL = 'cancel'
const RETRY = 'retry'
const TRIED = 'tried'
export const rGet = {
  retry: <T>(msg: T) => ({ [RETRY]: msg }),
  cancel: <T>(msg: T) => ({ [CANCEL]: msg }),
  success: <V>(value: V) => ({ [SUCCESS]: value }),
}
const createRepetitiveGetTask = <A>(
  fn: () => { [SUCCESS]: A } | { [CANCEL]: any } | { [RETRY]: any },
  tryCount = 3,
  intervalMs = 0,
  prevRet?: { [RETRY]: any }
  // eslint-disable-next-line @typescript-eslint/ban-types
): TE.TaskEither<{ [CANCEL]: any } | { [TRIED]?: any }, A> => {
  if (tryCount <= 0) return () => Promise.resolve(E.left({ [TRIED]: prevRet?.[RETRY] }))
  return () =>
    new Promise<E.Either<{ [CANCEL]: any } | { [TRIED]?: any }, A>>((resolve) => {
      setTimeout(() => {
        const ret = fn()
        if (R.has(SUCCESS, ret)) {
          resolve(E.right(ret[SUCCESS]))
        } else if (R.has(CANCEL, ret)) {
          resolve(E.left(ret))
        } else if (R.has(RETRY, ret)) {
          resolve(createRepetitiveGetTask(fn, tryCount - 1, intervalMs, ret)())
        }
        resolve(E.left({ [TRIED]: 'wrong return' }))
      }, intervalMs)
    })
}
export const doRGetTask = <A>(
  fn: () => { [SUCCESS]: A } | { [CANCEL]: any } | { [RETRY]: any },
  onSuccess: (a: A) => void,
  onFail: (b: { [CANCEL]: any } | { [TRIED]?: any }) => void,
  tryCount = 3,
  intervalMs = 0
) => {
  createRepetitiveGetTask(fn, tryCount, intervalMs)()
    .then(F.flow(E.fold(onFail, onSuccess)))
    .catch(console.error)
}
export const flip = <A, B, C>(f: (a: A) => (b: B) => C): ((b: B) => (a: A) => C) => {
  return (b) => (a) => f(a)(b)
}

// prettier-ignore
export const sefeCall: {
  <A,       R>(fn: undefined | null | ((...args: readonly [A      ]) => R), ...arg: readonly [A]): O.Option<R>
  <A, B,    R>(fn: undefined | null | ((...args: readonly [A, B   ]) => R), ...args: readonly [A, B]): O.Option<R>
  <A, B, C, R>(fn: undefined | null | ((...args: readonly [A, B, C]) => R), ...args: readonly [A, B, C]): O.Option<R>
} = <R>(fn: ((...args: any[]) => R) | undefined | null, ...args: any[]): O.Option<R> =>
  F.pipe(O.fromNullable(fn), O.map((fn) => fn(args)))

export const DEBUG = process.env.NODE_ENV === 'test'
export const tapWhenDebug = <T>(fn: (arg: T) => void | never): ((value: T) => T) =>
  R.tap<T>(R.when(() => DEBUG, fn))

// https://github.com/ramda/ramda/wiki/Cookbook#applyeach
export const applyEach: {
  <X, R>(fns: ((x: X) => R)[]): (x: X) => R[]
  <T extends Record<string, (x: any) => any>>(fns: T): <X>(x: X) => GetEachReturn<T>
} =
  (fns: any) =>
  (x: any): any =>
    R.map(R.applyTo(x), fns)

// https://github.com/ramda/ramda/wiki/Cookbook#apply-a-list-of-functions-in-a-specific-order-into-a-list-of-values
export const applySameIndex =
  <X, R>(fns: ((x: X) => R)[]) =>
  (x: X[]): R[] => {
    return fns.map((fn, idx) => fn(x[idx]))
  }

export const applyFnToEachField =
  <T extends Record<string, any>>(recordShape: T) =>
  <Fn extends (...x: any[]) => any>(
    fn: Fn
  ): ((record: T) => { [K in keyof T]: ReturnType<Fn> }) => {
    const evolver = RR.map(F.constant(fn))(recordShape)
    return R.evolve(evolver) as (record: T) => { [K in keyof T]: ReturnType<Fn> }
  }
