import { function as F, readonlyRecord as RR, readonlyArray as A } from 'fp-ts'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import { rejectEquals, rejectNil } from './array'
import { mutatePath } from './path'

export type ID = string
// string に限定する理由
// - string でないと使えない Ramda 関数がある（propEq, dissoc, omit 等）
// - ID として string 以外を使用する可能性は低い（？）

export type Key = string // number, symbol は今のところ使わないので除外

export type UniqueRecord<IDKey extends string = 'id', Keys extends Key = Key> = Record<IDKey, ID> &
  Record<Exclude<Keys, IDKey>, any>

type Sample = { id: '0'; a: '1'; b: '2'; c: '3' }

export type IDMap<T> = Record<ID, T>

export type IDMapRecord<R extends Record<Key, any>> = {
  [K in keyof R]: IDMap<R[K]>
}
export type IDMapRecordExceptForID<
  R extends Record<Exclude<Key, IDKey>, any> & Record<IDKey, ID>,
  IDKey extends string = 'id'
> = IDMapRecord<Omit<R, IDKey>>
type _sample_MapIdMapExceptForId = IDMapRecordExceptForID<Sample>

export type IDArrayAndIDMapRecord<IDKey extends string = 'id'> = Record<IDKey, ID[]> &
  Record<Exclude<Key, IDKey>, Record<ID, any>>

export type GetIDArrayAndIDMapRecord<
  R extends Record<Exclude<Key, IDKey>, any> & Record<IDKey, ID>,
  IDKey extends string = 'id'
> = Record<IDKey, ID[]> & IDMapRecordExceptForID<R, IDKey>
type _sample_CreateIDColumns = GetIDArrayAndIDMapRecord<Sample>
type _sample_CreateIDColumns1 = GetIDArrayAndIDMapRecord<Sample, 'a'>

// https://github.com/ramda/ramda/wiki/Cookbook#get-object-by-id
export const findBy = <IDKey extends string = 'id'>(
  idkey?: IDKey
): (<T extends UniqueRecord<IDKey>>(id: ID, rs: T[]) => T) =>
  R.useWith(R.find, [R.propEq(R.defaultTo('id', idkey)), R.identity])

export const changeOrderBy =
  <IDKey extends string = 'id'>(idkey?: IDKey) =>
  (ids: ID[]) =>
  (rows: UniqueRecord<IDKey>[]): typeof rows =>
    F.pipe(
      ids.map((id) => findBy(R.defaultTo('id', idkey) as IDKey)(id, rows)),
      rejectNil
    )

export const getRecordBy =
  (id: ID) =>
  <Keys extends Key>(idMapRecord: Record<Keys, IDMap<any>>): Record<Keys, any> =>
    RR.map(R.prop(id) as (x: IDMap<any>) => any)(idMapRecord)

export const uniqueRecords2IDArrayAndIDMapRecord: {
  // basic
  <IDKey extends string = 'id'>(idkey?: IDKey): <
    Keys extends Exclude<Key, IDKey> = Exclude<Key, IDKey>
  >(
    rs: (Record<IDKey, ID> & Record<Keys, any>)[]
  ) => Record<IDKey, ID[]> & Record<Exclude<Keys, IDKey>, Record<ID, any>>

  // simple use for pipe (determine the type at the first call using default IDKey = 'id')
  <Row extends UniqueRecord = UniqueRecord, IDKey extends string = 'id'>(): (
    rs: Row[]
  ) => GetIDArrayAndIDMapRecord<Row, IDKey>

  // custom use for pipe
  <IDKey extends string = 'id', Row extends UniqueRecord<IDKey> = UniqueRecord<IDKey>>(
    idkey?: IDKey
  ): (idRecordArray: Row[]) => GetIDArrayAndIDMapRecord<Row, IDKey>
} =
  <IDKey extends string = 'id'>(idkey?: IDKey) =>
  <Keys extends Exclude<Key, IDKey> = Exclude<Key, IDKey>>(
    rs: (Record<IDKey, ID> & Record<Keys, any>)[]
  ): Record<IDKey, ID[]> & Record<Keys, Record<ID, any>> => {
    const idkey_ = R.defaultTo('id', idkey) as IDKey
    return rs.reduce(
      (acc, r) => {
        const id = r[idkey_]
        acc[idkey_].push(id)
        R.forEachObjIndexed((x, key) => {
          if (key !== idkey_) {
            mutatePath(acc, [key, id])(x)
          }
        }, r)
        return acc
      },
      { [idkey_]: [] as ID[] } as Record<IDKey, ID[]> & Record<Keys, Record<ID, any>>
    )
  }

export const idArrayAndIDMapRecord2uniqueRecords =
  <IDKey extends string = 'id'>(idkey?: IDKey) =>
  <Keys extends Key = string>(
    arg: Record<IDKey, ID[]> & Record<Exclude<Keys, IDKey>, Record<ID, any>>
  ): UniqueRecord<IDKey, Keys>[] => {
    const idkey_ = R.defaultTo('id', idkey) as IDKey
    const { [idkey_]: ids, ...idMapRecord } = arg
    return ids.map((id) => {
      const record = RR.map(R.prop(id) as (a: Record<ID, any>) => any)(idMapRecord) as Record<
        Exclude<Keys, IDKey>,
        any
      >
      return { id, ...record } as UniqueRecord<IDKey, Keys>
    })
  }

const setID =
  <IDKey extends string>(idkey: IDKey) =>
  <R extends Record<Exclude<Key, IDKey>, any> & Record<IDKey, ID>>(r: R) =>
  (field: string, idRec: Record<ID, any>): Record<ID, any> =>
    R.assoc(r[idkey], r[field as Exclude<Key, IDKey>], idRec)

export const insert =
  <IDKey extends string = 'id'>(idkey?: IDKey) =>
  (index: number) =>
  <R extends Record<Exclude<Key, IDKey>, any> & Record<IDKey, ID>>(idMap: R) =>
  (
    idArrayAndidMapRecord: GetIDArrayAndIDMapRecord<R, IDKey>
  ): GetIDArrayAndIDMapRecord<R, IDKey> => {
    const idkey_ = R.defaultTo('id', idkey) as IDKey
    const { [idkey_]: ids, ...idMapRecord } = idArrayAndidMapRecord

    return {
      [idkey_]: R.insert<ID>(index, idMap[idkey_], ids),
      ...RR.mapWithIndex(setID(idkey_)(idMap))(idMapRecord),
    } as GetIDArrayAndIDMapRecord<R, IDKey>
  }

export const append =
  <IDKey extends string = 'id'>(idkey?: IDKey) =>
  <R extends UniqueRecord<IDKey, string>>(r: R) =>
  (
    idArrayAndidMapRecord: GetIDArrayAndIDMapRecord<R, IDKey>
  ): GetIDArrayAndIDMapRecord<R, IDKey> => {
    const idkey_ = R.defaultTo('id', idkey) as IDKey
    const { [idkey_]: ids, ...idMapRecord } = idArrayAndidMapRecord

    return {
      [idkey_]: R.append<ID>(r[idkey_], ids),
      ...RR.mapWithIndex(setID(idkey_)(r))(idMapRecord),
    } as GetIDArrayAndIDMapRecord<R, IDKey>
  }

export const removeIDs =
  (ids: readonly ID[]) =>
  <R extends IDMap<any>>(idMap: R): R =>
    ids.reduce((acc, id) => RR.deleteAt(id)(acc) as R, idMap)

export const removeID =
  (id: ID | readonly ID[]) =>
  <R extends IDMap<any>>(idRecord: R): R => {
    const idsToRemove = (RA.isArray(id) ? id : [id]) as ID[]
    return removeIDs(idsToRemove)(idRecord)
  }

export const remove =
  <IDKey extends string = 'id'>(idkey?: IDKey) =>
  (id: ID | readonly ID[]) =>
  <R extends UniqueRecord<IDKey, string>>(
    idArrayAndidMapRecord: GetIDArrayAndIDMapRecord<R, IDKey>
  ): GetIDArrayAndIDMapRecord<R, IDKey> => {
    const idkey_ = R.defaultTo('id', idkey) as IDKey
    const { [idkey_]: ids, ...idMapRecord } = idArrayAndidMapRecord

    const idsToRemove = (RA.isArray(id) ? id : [id]) as ID[]

    if (!RA.isArray(ids)) {
      console.error('id field is not Array.', idkey, id, idArrayAndidMapRecord)
    }

    return {
      [idkey_]: R.without(idsToRemove, ids || []),
      ...RR.map(removeIDs(idsToRemove) as (a: Record<string, any>) => Record<string, any>)(
        idMapRecord
      ),
    } as GetIDArrayAndIDMapRecord<R, IDKey>
  }

export const initializeField =
  <IDKey extends string = 'id'>(idkey?: IDKey) =>
  <R extends Record<Exclude<Key, IDKey>, any> & Record<IDKey, ID>>(
    recordExcludingId: Record<keyof R, any>
  ) =>
  (idArrayAndidMapRecord: GetIDArrayAndIDMapRecord<R, IDKey>): typeof idArrayAndidMapRecord => {
    const idkey_ = R.defaultTo('id', idkey) as IDKey
    const keysToInitialize = R.keys(recordExcludingId)
    const keysExcludingId = F.pipe(R.keys(idArrayAndidMapRecord), rejectEquals(idkey_))
    type Acc = IDMapRecord<Pick<R, Exclude<keyof R, IDKey>>>
    return F.pipe(
      keysExcludingId,
      A.reduce({} as Acc, (acc, key) => {
        const willInitial = R.includes(key, keysToInitialize)
        const idMap = willInitial
          ? F.pipe(idArrayAndidMapRecord[key], RR.map(F.constant(recordExcludingId[key])))
          : idArrayAndidMapRecord[key]
        return R.assoc(key as any, idMap, acc)
      }),
      R.assoc(idkey_, idArrayAndidMapRecord[idkey_])
    )
  }

export const toMap =
  <IDKey extends string = 'id'>(idkey?: IDKey) =>
  <R extends Record<Exclude<Key, IDKey>, any> & Record<IDKey, ID>>(
    recordsWithId: readonly R[]
  ): Map<ID, R> => {
    const idkey_ = R.defaultTo('id', idkey) as IDKey
    return new Map(recordsWithId.map((item) => [item[idkey_], item]))
  }

export const idMapOfRecord2recordArray =
  <IDKey extends string = 'id'>(idkey?: IDKey) =>
  <ID extends string, R extends Record<string, any>>(
    as: RR.ReadonlyRecord<ID, R>
  ): readonly (R & Record<IDKey, ID>)[] => {
    const idkey_ = R.defaultTo('id', idkey) as IDKey
    return F.pipe(
      Object.entries(as) as [ID, R][],
      A.map(([k, r]) => RR.upsertAt(idkey_, k)(r) as R & Record<IDKey, ID>)
    )
  }

export const createRecordGetterById =
  <Keys extends string, ID extends number | string>(
    idRecordRecord: Record<Keys, Record<ID, any>>
  ) =>
  (id: ID): Record<Keys, any> => {
    const getCurIdEvolver = RR.map(F.constant((x: Record<ID, any>) => x[id]))(idRecordRecord)
    const getCurIdRecordFrom = R.evolve(getCurIdEvolver) as (
      x: Record<Keys, Record<ID, any>>
    ) => Record<Keys, any>
    return getCurIdRecordFrom(idRecordRecord)
  }
