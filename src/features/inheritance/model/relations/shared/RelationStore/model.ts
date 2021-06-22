import {
  function as F,
  option as O,
  readonlyArray as A,
  readonlyRecord as RR,
  readonlyTuple as T,
} from 'fp-ts'
import { v3 } from 'src/utils/fp/common/fp-ts'
import { ID } from '../../../../shared/types'
import { RelID, RID } from '../../../relation'

// -------------------------------------------------------------------------------------------------
// type / const
// -------------------------------------------------------------------------------------------------
export type RelStore<A, R extends RelID = RelID> = RR.ReadonlyRecord<R, A>
type Endomorphism<A> = F.Endomorphism<RelStore<A>>
type Atype = RR.ReadonlyRecord<string, any>

// -------------------------------------------------------------------------------------------------
// util
// -------------------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------------
// create / insert
// -------------------------------------------------------------------------------------------------
export type UpsertAt<A = unknown> = (uID: ID, vID: ID, a: A) => Endomorphism<A>
type CreateUpsertAt<A = unknown> = <R extends RelID = RelID>(c: RID.Create<R>) => UpsertAt<A>
export const createUpsertAt: CreateUpsertAt = (createRID) => (u, v, a) => (s) =>
  u === v ? s : F.pipe(createRID(u)(v), (rID) => RR.upsertAt(rID, a)(s))

export type InsertAt<A = unknown> = (uID: ID, vID: ID, a: A) => Endomorphism<A>
type CreateInsertAt<A = unknown> = <R extends RelID = RelID>(c: RID.Create<R>) => InsertAt<A>
export const createInsertAt: CreateInsertAt = (createRID) => (u, v, a) => (s) =>
  u === v
    ? s
    : F.pipe(
        createRID(u)(v),
        (rID) => v3.RR.insertAt(rID, a)(s),
        O.getOrElse(() => s)
      )

// -------------------------------------------------------------------------------------------------
// read
// -------------------------------------------------------------------------------------------------
export type FilterByID<A = unknown> = (id: ID) => Endomorphism<A>
export const filterByID: FilterByID = (id) => RR.filterWithIndex(RID.hasID(id))

export type GetWithIndex<R extends RelID = RelID, _A = unknown> = (
  uID: ID,
  vID: ID
) => <A extends _A = _A>(s: RelStore<A>) => O.Option<readonly [R, A]>
type CreateGetEdgeWithIndex<A = unknown> = <R extends RelID = RelID>(
  c: RID.Create<R>
) => GetWithIndex<R, A>
export const createGetEdgeWithIndex: CreateGetEdgeWithIndex = (createRID) => (u, v) => (s) =>
  F.pipe(
    createRID(u)(v),
    (rID) => [rID, rID] as const,
    T.traverse(O.Applicative)((rID) => RR.lookup(rID)(s)),
    O.map(T.swap)
  )

export type GetEdge<R extends RelID = RelID, A = unknown> = (
  uID: ID,
  vID: ID
) => (s: RelStore<A, R>) => O.Option<A>
type CreateGetEdge<A = unknown, R extends RelID = RelID> = (f: GetWithIndex<R, A>) => GetEdge<R, A>
export const createGetEdge: CreateGetEdge = (getEdgeWithIndex) => (u, v) =>
  F.flow(getEdgeWithIndex(u, v), O.map(T.snd))

export const getTheOtherIDs: (id: ID) => <A>(s: RelStore<A>) => readonly ID[] = (id) =>
  RR.foldMapWithIndex(A.getMonoid<ID>())(F.flow(RID.getTheOtherID(id), A.of))

// -------------------------------------------------------------------------------------------------
// update
// -------------------------------------------------------------------------------------------------
export type UpdateAtAt<A extends Atype = Atype> = (
  uID: ID,
  vID: ID,
  prop: keyof A,
  value: A[typeof prop]
) => Endomorphism<A>
type CreateUpdateAtAt<A extends Atype = Atype> = <R extends RelID = RelID>(
  c: RID.Create<R>
) => UpdateAtAt<A>
export const createUpdateAtAt: CreateUpdateAtAt = (createRID) => (u, v, prop, value) => (s) =>
  F.pipe(
    createRID(u)(v),
    F.flow((rID) =>
      F.pipe(
        RR.lookup(rID)(s),
        O.map(RR.upsertAt(prop, value)),
        O.chain((a) => RR.updateAt(rID, a)(s))
      )
    ),
    O.getOrElse(() => s)
  )

// -------------------------------------------------------------------------------------------------
// delete
// -------------------------------------------------------------------------------------------------
export type Reject<A = unknown> = (ids: readonly ID[]) => Endomorphism<A>
export const reject: Reject = (ids) => RR.filterWithIndex(RID.notHasIDs(ids))

export type Remove<A = unknown> = (uID: ID, vID: ID) => Endomorphism<A>
type CreateRemove<A = unknown> = <R extends RelID = RelID>(c: RID.Create<R>) => Remove<A>
export const createRemove: CreateRemove = (createRID) => (u, v) => (s) =>
  F.pipe(createRID(u)(v), (rID) => RR.deleteAt(rID)(s))

// -------------------------------------------------------------------------------------------------
// fix type
// -------------------------------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const fixType = <R extends RelID, A extends Atype>(c: RID.Create<R>) => {
  return {
    filterByID: filterByID as FilterByID<A>,
    ...F.pipe(createGetEdgeWithIndex(c), (getWithIndex) => {
      return {
        getWithIndex: getWithIndex as GetWithIndex<R, A>,
        get: createGetEdge(getWithIndex) as GetEdge<R, A>,
      }
    }),
    upsertAt: createUpsertAt(c) as UpsertAt<A>,
    insertAt: createInsertAt(c) as InsertAt<A>,
    updateAtAt: createUpdateAtAt(c) as UpdateAtAt<A>,
    remove: createRemove(c) as Remove<A>,
    reject: reject as Reject<A>,
  }
}
