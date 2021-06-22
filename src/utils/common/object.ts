import { DeepPartial } from 'src/utils/types'

export const reorderProperties = (
  order: readonly string[],
  obj: Record<string, any>
): Record<string, any> =>
  order.reduce<Record<string, any>>((pre, cur) => {
    const value = obj[cur]
    if (value === undefined) {
      throw new Error(`[reorderProperties] ${obj}[${cur}] is undefined`)
    }
    return { ...pre, [cur]: value }
  }, {})

export const mergeable = <T extends Record<string, any> | undefined>(
  objOrUndefined: T
): DeepPartial<NonNullable<T>> => (objOrUndefined === undefined ? {} : objOrUndefined) as any

type Obj = Record<string, any>
/**
 * Pulled from react-window
 * https://github.com/bvaughn/react-window/blob/master/src/shallowDiffers.js
 * https://github.com/preactjs/preact-compat/blob/7c5de00e7c85e2ffd011bf3af02899b63f699d3a/src/index.js
 * @param prev
 * @param next
 * @returns boolean (true: prev and next are different)
 */
export function shallowDiffers(prev: Obj, next: Obj): boolean {
  // do keys differ ?
  for (const attribute in prev) {
    if (!(attribute in next)) {
      return true
    }
  }
  // do values differ ?
  for (const attribute in next) {
    if (prev[attribute] !== next[attribute]) {
      return true
    }
  }
  return false
}
