import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const isObjectArray = (data: any): data is Record<string, any>[] =>
  RA.isArray(data) && data.every(R.allPass([RA.isObjLike, RA.isNotArray]))

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const isArrayArray = (data: any): data is any[][] =>
  RA.isArray(data) && data.every(RA.isArray)

export const isEmptyRecursive = R.pipe(R.flatten as (arg: any[]) => any[], R.isEmpty)
