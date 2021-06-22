// https://ramdajs.com/docs/
import * as R from 'ramda'

// https://gcanti.github.io/fp-ts/modules/
import {
  function as F,
  readonlyArray as A,
  readonlyRecord as RR,
  monoid as M,
  semigroup as S,
} from 'fp-ts'
import { Arrayify } from 'src/utils/types'

type Key = string
export const array2recordBy =
  <A, B>(f: (a: A) => readonly [Key, B]) =>
  (fa: ReadonlyArray<A>): Readonly<Record<Key, B>> =>
    RR.fromFoldableMap(S.last<B>(), A.Foldable)(fa, f)
// S.last<B>() は Key が重複した場合, 新しい方を選ぶことを意味する
// Foldable は reduce 関数 をもつ インスタンス

// https://ramdajs.com/docs/#reduceBy
// https://github.com/ramda/ramda/wiki/Cookbook#make-an-object-from-an-array-using-a-mapper-function
export const strArray2record = <Val>(
  valueFn: (a: string) => Val,
  keyFn?: (a: string) => string
): ((list: readonly string[]) => Readonly<Record<string, Val>>) =>
  array2recordBy((a: string) => [(keyFn || F.identity)(a), valueFn(a)] as const)
// F.flow(
//   R.map((x: X) => [keyFn(x), valueFn(x)] as [Key, Val]),
//   R.fromPairs as (
//     pairs: Array<R.KeyValuePair<number | string, Val>>
//   ) => Record<number | string, Val>
// )

export const arrayify = RR.map(A.of)

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getMonoidArrayRecord = <Rec extends Record<string, unknown>>(shape: Rec) => {
  const mapMonoidTo = RR.map(F.constant(A.getMonoid<unknown>()))
  const evolver = mapMonoidTo(shape)
  return M.getStructMonoid(evolver)
}

export const addRecordToArrayRecord =
  <Rec extends Record<string, unknown>>(shape: Rec) =>
  (record: Rec) =>
  (arrayRecord: Arrayify<Rec>): Arrayify<Rec> => {
    const newArrayRecord = arrayify(record)
    return getMonoidArrayRecord(shape).concat(arrayRecord, newArrayRecord) as Arrayify<Rec>
  }

export const recordArrayToArrayRecord = <Keys extends string = string>(
  recordArray: Record<Keys, any>[]
): Record<Keys, any[]> => {
  const oneRecord = recordArray[0]
  const arrayRecordArray = recordArray.map(arrayify)
  const monoidArrayRecord = getMonoidArrayRecord(oneRecord)
  return M.fold(monoidArrayRecord)(arrayRecordArray) as Record<Keys, any[]>
}

export const createRecordGetter =
  <Keys extends string = string>(arrayRecord: Record<Keys, any[]>) =>
  (curInx: number): Record<Keys, any> => {
    const getCurIdxEvolver = RR.map(F.constant((x: any[]) => x[curInx]))(arrayRecord)
    const getCurIdxFrom = R.evolve(getCurIdxEvolver) as (
      x: Record<Keys, any[]>
    ) => Record<Keys, any>
    return getCurIdxFrom(arrayRecord)
  }

export const arrayRecordToRecordArray =
  <Keys extends string>(key?: Keys) =>
  (arrayRecord: Record<Keys, any[]>): Record<Keys, any>[] => {
    const oneKey = key || R.keys(arrayRecord)[0]
    const getRecordByIndex = createRecordGetter(arrayRecord)
    return R.times(getRecordByIndex, arrayRecord[oneKey].length)
  }
