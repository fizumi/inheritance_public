import {
  readonlyRecord as RR,
  function as F,
  ord,
  string,
  readonlyNonEmptyArray as NEA,
  option as O,
} from 'fp-ts'
import tb from 'ts-toolbelt'
import { record2nonEmptyEntries } from 'src/utils/fp/common'
import { Dates } from './types'

export type MayHasStartDate = Pick<Dates, 'startDate'>
export type HasStartDate = tb.O.Compulsory<MayHasStartDate>

/**
 * string は 昇順
 * null は 最後
 */
const reversedStringNullOrd: ord.Ord<string | null> = ord.fromCompare((first, second) => {
  if (first === second) return 0
  if (first === null) return 1
  if (second === null) return -1
  return ord.reverse(string.Ord).compare(first, second)
})

export const startDateOrd = ord.contramap(
  (hasStartDate: MayHasStartDate) => hasStartDate.startDate
)(reversedStringNullOrd)

export const keyAndHasStartDateOrd = ord.contramap(
  <K extends string, T extends MayHasStartDate>(keyAndHasStartDate: [K, T]) => keyAndHasStartDate[1]
)(startDateOrd)

type NEAMax = <K, V>(x: NEA.ReadonlyNonEmptyArray<[K, V]>) => [K, V]
export const getLatestStartDateKVTuple: <K extends string, V extends MayHasStartDate>(
  as: RR.ReadonlyRecord<K, V>
) => O.Option<[K, V]> = F.flow(
  record2nonEmptyEntries,
  O.map(NEA.min(keyAndHasStartDateOrd) as NEAMax)
)
