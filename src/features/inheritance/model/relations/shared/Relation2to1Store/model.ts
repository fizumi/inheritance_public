import {
  function as F,
  option as O,
  readonlyArray as A,
  readonlyRecord as RR,
  readonlyTuple as T,
} from 'fp-ts'
import * as R from 'ramda'
// import { noIntersection } from 'src/common/utils'
import { ID } from '../../../../shared/types'
import { RelID2to1, RID2 } from '../../../relation'

// -------------------------------------------------------------------------------------------------
// type / const
// -------------------------------------------------------------------------------------------------
export type Rel2Store<A, R extends RelID2to1 = RelID2to1> = RR.ReadonlyRecord<R, A>
type Endomorphism<A> = F.Endomorphism<Rel2Store<A>>
type Atype = RR.ReadonlyRecord<string, any>

// -------------------------------------------------------------------------------------------------
// util
// -------------------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------------
// create
// -------------------------------------------------------------------------------------------------
export type UpsertAt<A = unknown> = (uID1: ID, uID2: ID, vID: ID, a: A) => Endomorphism<A>
type CreateUpsertAt<A = unknown> = <R extends RelID2to1 = RelID2to1>(
  c: RID2.Create<R>
) => UpsertAt<A>
export const createUpsertAt: CreateUpsertAt = (createRID) => (u1, u2, v, a) => (s) =>
  F.pipe(createRID(u1, u2)(v), (rID) => RR.upsertAt(rID, a)(s))

// -------------------------------------------------------------------------------------------------
// read
// -------------------------------------------------------------------------------------------------
export type Has<A = unknown> = (uID1: ID, uID2: ID, vID: ID) => (s: Rel2Store<A>) => boolean
type CreateHas<R extends RelID2to1 = RelID2to1, A = unknown> = (c: RID2.Create<R>) => Has<A>
export const createHas: CreateHas = (createRID) => (u1, u2, v) => (s) =>
  RR.has(createRID(u1, u2)(v), s)

export type FilterByIDs<A = unknown> = (ids: ID[]) => Endomorphism<A>
export const filterByIDs: FilterByIDs = (ids) => RR.filterWithIndex(RID2.hasAllIDs(ids))

export type GetWithIndex<R extends RelID2to1 = RelID2to1, A = unknown> = (
  uID1: ID,
  uID2: ID,
  vID: ID
) => (s: Rel2Store<A>) => O.Option<readonly [R, A]>
type CreateGetEdgeWithIndex<A = unknown> = <R extends RelID2to1 = RelID2to1>(
  c: RID2.Create<R>
) => GetWithIndex<R, A>
export const createGetEdgeWithIndex: CreateGetEdgeWithIndex = (createRID) => (u1, u2, v) => (s) =>
  F.pipe(
    createRID(u1, u2)(v),
    (rID) => [rID, rID] as const,
    T.traverse(O.Applicative)((rID) => RR.lookup(rID)(s)),
    O.map(T.swap)
  )

export type GetEdge<R extends RelID2to1 = RelID2to1, A = unknown> = (
  uID1: ID,
  uID2: ID,
  vID: ID
) => (s: Rel2Store<R>) => O.Option<A>
type CreateGetEdge<A = unknown, R extends RelID2to1 = RelID2to1> = (
  f: GetWithIndex<R, A>
) => GetEdge<R, A>
export const createGetEdge: CreateGetEdge = (getEdgeWithIndex) => (u1, u2, v) =>
  F.flow(getEdgeWithIndex(u1, u2, v), O.map(T.snd))

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
// export const createGetters = <A>() =>

export const getTheOtherIDs: (id: ID, id2: ID) => <A>(s: Rel2Store<A>) => readonly ID[] = (
  id,
  id2
) => RR.foldMapWithIndex(A.getMonoid<ID>())(F.flow(RID2.getTheOtherID(id, id2), A.of))

// -------------------------------------------------------------------------------------------------
// update
// -------------------------------------------------------------------------------------------------
type IDParam<R extends RelID2to1 = RelID2to1> =
  | {
      uID1: ID
      uID2: ID
      vID: ID
    }
  | { rID: R }
export type UpdateAtAt<A extends Atype = Atype> = (
  idParam: IDParam,
  prop: keyof A,
  value: A[typeof prop]
) => Endomorphism<A>
type CreateUpdateAtAt<A extends Atype = Atype> = <R extends RelID2to1 = RelID2to1>(
  c: RID2.Create<R>
) => UpdateAtAt<A>
export const createUpdateAtAt: CreateUpdateAtAt = (createRID) => (idParam, prop, value) => (s) =>
  F.pipe(
    R.has('rID', idParam) ? idParam.rID : createRID(idParam.uID1, idParam.uID2)(idParam.vID),
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
export type Reject<A = unknown> = A extends unknown
  ? (ids: readonly ID[]) => <A>(s: Rel2Store<A>) => Rel2Store<A>
  : (ids: readonly ID[]) => Endomorphism<A>
export const reject: Reject = (ids) => RR.filterWithIndex(RID2.notHasAnyIDs(ids))

export type Remove<A = unknown> = {
  (uID1: ID, uID2: ID, vID: ID): Endomorphism<A>
  (id1: ID, id2: ID): Endomorphism<A>
}
export const remove: Remove = (u1: ID, u2: ID, v?: ID) => {
  if (v !== undefined) return RR.deleteAt(RID2.createDirected(u1, u2)(v))
  return RR.filterWithIndex(R.complement(RID2.hasAllIDs([u1, u2])))
}

// -------------------------------------------------------------------------------------------------
//
// -------------------------------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const fixType = <R extends RelID2to1, A extends Atype>(c: RID2.Create<R>) => {
  return {
    filterByIDs: filterByIDs as FilterByIDs<A>,
    ...F.pipe(createGetEdgeWithIndex(c), (getWithIndex) => {
      return {
        getWithIndex: getWithIndex as GetWithIndex<R, A>,
        get: createGetEdge(getWithIndex) as GetEdge<R, A>,
      }
    }),
    upsertAt: createUpsertAt(c) as UpsertAt<A>,
    updateAtAt: createUpdateAtAt(c) as UpdateAtAt<A>,
    has: createHas(c) as Has<A>,
    reject: reject as Reject<A>,
    remove: remove as Remove<A>,
  }
}
