/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
// https://github.com/selfrefactor/rambdax#memoize
import * as R from 'ramda'
import { type } from '../../common'

const cache = {} as Record<string, any>

/**
 * key の sort
 */
const normalizeObject = (obj: { [x: string]: any }) => {
  const sortFn = (a: any, b: any) => (a > b ? 1 : -1)
  const willReturn = {} as Record<string, any>
  R.compose(
    R.map((prop: any) => (willReturn[prop] = obj[prop])),
    R.sort(sortFn)
  )(Object.keys(obj))

  return willReturn
}

const compactFn = (a: any) => R.replace(/\s{1,}/g, ' ', a.toString())
export const stringify = (a: any): string => {
  if (type(a) === 'String') {
    return a
  } else if (['Function', 'Async'].includes(type(a))) {
    return R.replace(/\s/g, '_', R.take(15, compactFn(a)))
  } else if (type(a) === 'Object') {
    return JSON.stringify(normalizeObject(a))
  }

  return JSON.stringify(a)
}

const generateProp = (fn: (...inputArguments: any[]) => any, ...inputArguments: any[]) => {
  let propString = ''
  inputArguments.forEach((inputArgument) => {
    propString += `${stringify(inputArgument)}_`
  })

  return `${propString}${stringify(fn)}`
}

// with weakmaps
function memoize(fn: (...inputArguments: any[]) => any, ...inputArguments: any[]): any {
  if (arguments.length === 1) {
    return (...inputArgumentsHolder: any[]) => memoize(fn, ...inputArgumentsHolder)
  }

  const prop = generateProp(fn, ...inputArguments)
  if (prop in cache) return cache[prop]

  if (type(fn) === 'Async') {
    return new Promise((resolve) => {
      fn(...inputArguments).then((result: any) => {
        cache[prop] = result
        resolve(result)
      })
    })
  }

  const result = fn(...inputArguments)
  cache[prop] = result

  return result
}
export default memoize
