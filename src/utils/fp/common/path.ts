// https://ramdajs.com/docs/
import * as R from 'ramda'
import { rejectEmpty } from './array'

// https://char0n.github.io/ramda-adjunct/
import * as RA from 'ramda-adjunct'

// https://gcanti.github.io/fp-ts/modules/
import { function as F } from 'fp-ts'

import { has } from 'src/utils/common'

export const toPath = F.flow(R.split(/[^\w\d]+/g), rejectEmpty) // https://github.com/ramda/ramda/issues/1965

// https://github.com/ramda/ramda/wiki/Cookbook#derivative-of-rprops-for-deep-fields
export const dotPath = F.flow(R.split('.'), R.path) as (
  str: string
) => <T>(obj: any) => T | undefined

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const propOrPath = (propOrPath: string) => (obj: Record<string, any>) => {
  const valueOfKey = R.propOr('', propOrPath, obj)
  return R.pathOr(valueOfKey, toPath(propOrPath), obj)
}

// https://github.com/ramda/ramda/blob/v0.27.0/source/assocPath.js
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const mutatePath =
  <Val = any>(obj: any, path: string | R.Path) =>
  (val: Val) => {
    const path_ = RA.isArray(path)
      ? path
      : (toPath(path).map((x) => {
          const xx = Number(x)
          return RA.isInteger(xx) ? xx : x
        }) as R.Path)

    const assocPath = (path: R.Path, val: any, obj: any) => {
      if (path.length === 0) {
        return val
      }
      const idx = path[0]
      if (path.length > 1) {
        const nextObj =
          RA.isNotNil(obj) && has(idx, obj) ? obj[idx] : RA.isInteger(path[1]) ? [] : {}
        val = assocPath(R.tail(path), val, nextObj)
      }
      obj[idx] = val
      return obj
    }

    return assocPath(path_, val, obj)
  }
