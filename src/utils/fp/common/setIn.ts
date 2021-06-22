// formik utils
import { toPath, shallowClone } from './index'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

const clone = shallowClone

/**
 * clone は lodash 使ってなくて自作なので, 不安.
 * @param obj
 * @param path
 * @param value
 */
export function setIn(obj: any, path: string, value: any): any {
  const res: any = clone(obj)
  let resVal: any = res
  let i = 0
  const pathArray = toPath(path)

  for (; i < pathArray.length - 1; i++) {
    const currentPath: string = pathArray[i]
    const currentObj: any = R.path(pathArray.slice(0, i + 1), obj)

    if (currentObj && RA.isObject(currentObj) /* RA.isObject は array が来ても true */) {
      resVal = resVal[currentPath] = clone(currentObj)
    } else {
      const nextPath: string = pathArray[i + 1]
      resVal = resVal[currentPath] = RA.isInteger(nextPath) && Number(nextPath) >= 0 ? [] : {}
    }
  }

  // Return original object if new value is the same as current
  if ((i === 0 ? obj : resVal)[pathArray[i]] === value) {
    return obj
  }

  if (value === undefined) {
    delete resVal[pathArray[i]]
  } else {
    resVal[pathArray[i]] = value
  }

  // If the path array has a single element, the loop did not run.
  // Deleting on `resVal` had no effect in this scenario, so we delete on the result instead.
  if (i === 0 && value === undefined) {
    delete res[pathArray[i]]
  }

  return res
}
