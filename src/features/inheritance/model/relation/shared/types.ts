import tb from 'ts-toolbelt'
import * as R from 'ramda'
import { toDict } from 'src/utils/types'

export const dateKeys = ['startDate', 'endDate'] as const
export const dateKeyDict = toDict(dateKeys)
export type DateKeyDict = typeof dateKeyDict
export type DateKeys = typeof dateKeys[number]

export type Dates = Record<DateKeys, string | null>
export const defaultDates = (): Dates => ({ startDate: '', endDate: '' })
export const compensateDates = <T extends Partial<Dates>>(
  ds: T
): tb.O.Compulsory<T, tb.O.Keys<Dates>> => R.mergeRight(defaultDates(), ds) as any
