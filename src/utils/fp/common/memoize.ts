/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
// https://github.com/ramda/ramda/blob/v0.27.0/source/memoizeWith.js
import * as R from 'ramda'
// import tb from 'ts-toolbelt'
import { readonlyRecord as RR, boolean } from 'fp-ts'
import { type } from 'src/utils/common'
import { isUnaryFunction } from './function'

export const memoizeWith =
  (cache = {} as Record<string, any>) =>
  <T extends (...args: readonly any[]) => any>(keyFn: (...v: Parameters<T>) => string, fn: T) =>
  (...args: Parameters<T>): ReturnType<T> => {
    const key = keyFn(...args)
    if (!R.has(key, cache)) {
      ;(cache as any)[key] = fn(...args)
    }
    return cache[key] as any
  }

/**
 * React にて, 関数の計算結果の referential equality を維持し, 不要な rendering を回避する目的で作成
 * 関数の return が Object型 の場合（常に異なる reference を返却する場合）に有用
 */
export const memoizeReturn =
  (cache = new WeakMap()) =>
  <Ret extends any>(compareRetFn: (ret1: Ret, ret2: Ret) => boolean) =>
  <Fn extends (...args: any[]) => Ret>(fn: Fn) =>
  (...args: Parameters<Fn>): Ret => {
    const newRet = fn(...args) as Ret
    const beforeRet = cache.get(fn) as Ret | undefined
    console.log('compare', {
      beforeRet,
      newRet,
    })
    if (beforeRet && compareRetFn(beforeRet, newRet)) {
      console.log('use beforeRet')
      return beforeRet
    }
    cache.set(fn, newRet)
    return newRet
  }

/**
 * React にて, 関数の計算結果の referential equality を維持し, 不要な rendering を回避する目的で作成
 * 関数の return が Object型 の場合（常に異なる reference を返却する場合）に有用
 * @param keyObj memo化された値を使う
 */
export const memoizeReturnWithObjKey =
  (cache = new WeakMap()) =>
  <Ret extends any>(compareRetFn: (ret1: Ret | undefined, ret2: Ret) => boolean) =>
  (keyObj: object) =>
  <Fn extends (...args: any[]) => Ret>(fn: Fn) =>
  (...args: Parameters<Fn>): Ret => {
    const newRet = fn(...args) as Ret
    const beforeRet = cache.get(keyObj) as Ret | undefined
    // console.log('compare', { beforeRet, newRet })
    if (beforeRet && compareRetFn(beforeRet, newRet)) {
      // console.log('use beforeRet')
      return beforeRet
    }
    cache.set(keyObj, newRet)
    return newRet
  }

/*
keyObj は 個々の React Component を区別するための Key.
<=> keyObj に React Component 内の memo化 された obj を渡すことで, ｺﾝﾎﾟｰﾈﾝﾄ間の cache の共有を回避する.
<=> 一つのｺﾝﾎﾟｰﾈﾝﾄにたいして, 一つの cache を用意するために, keyObj が必要.
*/
/**
 * React にて, 関数の計算結果の referential equality を維持し, 不要な rendering を回避する目的で作成
 * 関数の return が 異なる参照の Array であるが, 個々の要素の参照は変化しない可能性がある場合に有用.
 * @param keyObj memo化された値を使う
 */
export const sequenceTRefChange =
  (cache = new WeakMap<object, readonly any[]>()) =>
  (keyObj: object) =>
  <X extends readonly any[]>(xs: X): X => {
    const before = cache.get(keyObj)
    if (before === undefined) {
      cache.set(keyObj, xs)
      return xs
    }
    if (before.length === xs.length && before.every((x, i) => x === xs[i])) {
      return before as X
    }
    cache.set(keyObj, xs)
    return xs
  }

export const sequenceSRefChange =
  (cache = new WeakMap<object, Record<string, any>>()) =>
  (keyObj: object) =>
  <X extends Record<string, any>>(xs: X): X => {
    const before = cache.get(keyObj)
    if (before === undefined) {
      cache.set(keyObj, xs)
      return xs
    }
    if (
      RR.size(before) === RR.size(xs) &&
      RR.foldMapWithIndex(boolean.MonoidAll)((k, x) => x === xs[k])(before)
    ) {
      return before as X
    }
    cache.set(keyObj, xs)
    return xs
  }

type Unary = (a: any) => any
type Cache<Cached = any> = WeakMap<any, Cached> | Map<any, Cached>
const globalCache = new WeakMap<Unary, Cache>()
/**
 * 引数の参照比較による memoize
 * TODO 用検討：引数が object になったり primitive になったりする場合をどうするか
 * @param fn global or memoized function (otherwise, memoize doesn't work)
 */
export const memoizeCurriedFn = <Fn extends Unary>(fn: Fn): Fn => {
  return ((arg) => {
    const cache = use(globalCache)({
      key: fn,
      defaultTo: () => (typeof arg === 'object' ? new WeakMap() : new Map()),
    })
    const result = use(cache)({
      key: arg,
      defaultTo: () => fn(arg),
    })

    return isUnaryFunction(result) ? memoizeCurriedFn(result) : result
  }) as Fn
}

// ※ defaultTo は cache.has(key) === false の時のみ必要とされる値なので, Lazy であるべき
const use =
  <Cached>(cache: Cache<Cached>) =>
  <A extends Cached>({ key, defaultTo }: { key: any; defaultTo: () => A /*※*/ }): A => {
    let result: A
    if (cache.has(key)) {
      result = cache.get(key) as A
      // log(key, result)
      return result
    }
    result = defaultTo()
    try {
      cache.set(key, result)
    } catch (e) {
      console.warn(cache, {
        key,
        result,
      })
    }
    return result
  }

const toString = R.invoker(0, 'toString') as (a: any) => string
const compactFn = R.pipe(toString, R.split(/\s{1,}/g), R.take(5), R.join('_'))
const stringify = (a: any): string => {
  switch (typeof a) {
    case 'string':
      return a
    case 'function':
      return compactFn(a)
    case 'object':
      return a.toString()

    default:
      break
  }

  return JSON.stringify(a)
}
const log = (key: any, result: any) => {
  if (type(key) !== 'Function' && type(result) !== 'Function') {
    console.log(`use cached value -> key: ${stringify(key)}, val: ${stringify(result)} `)
  }
}
