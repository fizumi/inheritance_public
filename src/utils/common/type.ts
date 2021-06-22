// https://github.com/selfrefactor/rambda/blob/master/src/type.js
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as R from 'ramda'
import tb from 'ts-toolbelt'

type RambdaTypes =
  | 'Object'
  | 'Number'
  | 'Boolean'
  | 'String'
  | 'Null'
  | 'Array'
  | 'RegExp'
  | 'NaN'
  | 'Function'
  | 'Undefined'
  | 'Async'
  | 'Promise'
  | 'Symbol'
type Types = RambdaTypes | 'Map' | 'Set' | 'Date' | 'WeakMap'
export function type(input: any): Types {
  const typeOf = typeof input

  if (input === null) {
    return 'Null'
  } else if (input === undefined) {
    return 'Undefined'
  } else if (typeOf === 'boolean') {
    return 'Boolean'
  } else if (typeOf === 'number') {
    return Number.isNaN(input) ? 'NaN' : 'Number'
  } else if (typeOf === 'string') {
    return 'String'
  } else if (Array.isArray(input)) {
    return 'Array'
  } else if (typeOf === 'symbol') {
    return 'Symbol'
  } else if (input instanceof RegExp) {
    return 'RegExp'
  }

  const asStr = input && input.toString ? input.toString() : ''

  if (['true', 'false'].includes(asStr)) return 'Boolean'
  if (!Number.isNaN(Number(asStr))) return 'Number'
  if (asStr.startsWith('async')) return 'Async'
  if (asStr === '[object Map]') return 'Map'
  if (asStr === '[object WeakMap]') return 'WeakMap'
  if (asStr === '[object Set]') return 'Set'
  if (asStr === '[object Date]') return 'Date'
  if (asStr === '[object Promise]') return 'Promise'
  if (typeOf === 'function') return 'Function'
  if (input instanceof String) return 'String'

  return 'Object'
}

type RamdaType = ReturnType<typeof R.type>

type Diff = tb.Union.Diff<RambdaTypes, RamdaType>
;() =>
  // prettier-ignore
  tb.Test.checks([
  tb.Test.check<Diff, 'NaN' | 'Async' | 'Promise', tb.Test.Pass >(),
])
