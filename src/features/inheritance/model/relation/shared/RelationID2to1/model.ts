import { function as F, option as O, readonlyTuple as T, either as E } from 'fp-ts'
import * as t from 'io-ts'
import * as R from 'ramda'
import { hasIntersection, includsAll, OtoBoolean } from 'src/utils/fp/common'
import { ID } from '../../../../shared/types'
import { _split, splitInto2, isStringTuple } from '../RelationID'

// -------------------------------------------------------------------------------------------------
// Type / Const
// -------------------------------------------------------------------------------------------------
// https://github.com/gcanti/io-ts/blob/master/index.md#branded-types--refinements
/*
    RelID2to1
*/
interface RelID2to1Brand {
  readonly RelID2to1: unique symbol // use `unique symbol` here to ensure uniqueness across modules / packages
}
export const RelID2to1 = t.brand(
  t.string, // a codec representing the type to be refined
  (n): n is t.Branded<string, RelID2to1Brand> => F.pipe(n, splitString, OtoBoolean), // a custom type guard using the build-in helper `Branded`
  'RelID2to1' // the name must match the readonly field in the brand
)
export type RelID2to1 = t.TypeOf<typeof RelID2to1>

/*
    DirectedRelID2to1
*/
interface Directed {
  readonly DirectedRelID2to1: unique symbol
}
export const DirectedRelID2to1 = t.brand(
  RelID2to1,
  (n): n is t.Branded<RelID2to1, Directed> => n.includes('->'),
  'DirectedRelID2to1'
)
export type DirectedRelID2to1 = t.TypeOf<typeof DirectedRelID2to1>

/*
    UndirectedRelID2to1
*/
// interface UndirectedRelID2to1Brand {
//   readonly UndirectedRelID2to1: unique symbol
// }
// export const UndirectedRelID2to1 = t.brand(
//   RelID2to1,
//   (n): n is t.Branded<RelID2to1, UndirectedRelID2to1Brand> => n.includes('--'),
//   'UndirectedRelID2to1'
// )
// export type UndirectedRelID2to1 = t.TypeOf<typeof UndirectedRelID2to1>

/*
    Const
*/
const secondSepRegExp = /[-]/

// -------------------------------------------------------------------------------------------------
// util
// -------------------------------------------------------------------------------------------------
type Splitted = readonly [[string, string], string]
const _sndSplit = R.split(secondSepRegExp)
export const sndSplitInto2 = F.flow(_sndSplit, O.fromPredicate(isStringTuple))
export const splitString: (s: string) => O.Option<Splitted> = (s) =>
  F.pipe(s, splitInto2, O.chain(T.traverse(O.Applicative)(sndSplitInto2)))
const flatten = ([a, b]: Splitted) => [...a, b] as [string, string, string]

// -------------------------------------------------------------------------------------------------
// create
// -------------------------------------------------------------------------------------------------
export type Create<R extends RelID2to1 = RelID2to1> = (uID1: ID, uID2: ID) => (vID: ID) => R
/**
 * u1, u2 は 順不同で良い
 */
export const createDirected: Create<DirectedRelID2to1> = (u1, u2) => (v) =>
  ([u1, u2].sort().join('-') + '->' + v) as DirectedRelID2to1

// -------------------------------------------------------------------------------------------------
// read
// -------------------------------------------------------------------------------------------------
export const split: (rID: RelID2to1) => [[ID, ID], ID] = F.flow(_split, T.mapFst(_sndSplit) as any)
export const flatSplit = F.flow(split, flatten)

export const getTheOtherID: (id: ID, id2: ID) => (rID: RelID2to1) => ID = (id, id2) =>
  F.flow(flatSplit, R.without([id, id2]), (x) => x[0] as ID)

export const getFst = F.flow(split, T.fst)
export const getSnd = F.flow(split, T.snd)
export const getSrc: (rID: DirectedRelID2to1) => [ID, ID] = getFst
export const getDst: (rID: DirectedRelID2to1) => ID = getSnd

// -------------------------------------------------------------------------------------------------
// pred
// -------------------------------------------------------------------------------------------------
type CheckIDs = (ids: readonly ID[]) => (relID: RelID2to1) => boolean
export const hasSomeIDs: CheckIDs = (ids) => F.flow(flatSplit, hasIntersection(ids))
export const hasAllIDs: CheckIDs = (ids) => F.flow(flatSplit, includsAll(ids))
export const notHasAnyIDs: CheckIDs = (ids) => R.complement(hasSomeIDs(ids))

export const isValidRelID2to1: (ids: ID[]) => (x: unknown) => boolean = (ids) =>
  F.flow(
    t.string.decode,
    E.chainOptionK(() => false as any)(
      F.flow(
        splitString,
        O.map((xs) => flatten(xs).every(R.includes(R.__, ids)))
      )
    ),
    E.getOrElse(F.constFalse)
  )
