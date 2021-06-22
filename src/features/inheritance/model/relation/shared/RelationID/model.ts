import { function as F, option as O, readonlyTuple as T, either as E } from 'fp-ts'
import { swap } from 'fp-ts/Tuple'
import * as t from 'io-ts'
import * as R from 'ramda'
import { noIntersection } from 'src/utils/fp/common'
import { ID } from '../../../../shared/types'

// -------------------------------------------------------------------------------------------------
// Type / Const
// -------------------------------------------------------------------------------------------------
// https://github.com/gcanti/io-ts/blob/master/index.md#branded-types--refinements
/*
    RelID
*/
interface RelIDBrand {
  readonly RelID: unique symbol // use `unique symbol` here to ensure uniqueness across modules / packages
}
export const RelID = t.brand(
  t.string, // a codec representing the type to be refined
  (n): n is t.Branded<string, RelIDBrand> => F.pipe(n, _split, lengthIsTwo), // a custom type guard using the build-in helper `Branded`
  'RelID' // the name must match the readonly field in the brand
)
export type RelID = t.TypeOf<typeof RelID>

/*
    DirectedRelID
*/
interface Directed {
  readonly Directed: unique symbol
}
export const DirectedRelID = t.brand(
  RelID,
  (n): n is t.Branded<RelID, Directed> => n.includes('->'),
  'Directed'
)
export type DirectedRelID = t.TypeOf<typeof DirectedRelID>

/*
    UndirectedRelID
*/
interface Undirected {
  readonly Undirected: unique symbol
}
export const UndirectedRelID = t.brand(
  RelID,
  (n): n is t.Branded<RelID, Undirected> => n.includes('--'),
  'Undirected'
)
export type UndirectedRelID = t.TypeOf<typeof UndirectedRelID>

/*
    Const
*/
export const separatorRegExp = /[-][->]/
export const directionIndex = {
  src: 0,
  dst: 1,
} as const

/*
    Type
*/
export type Create<R extends RelID = RelID> = (uID: ID) => (vID: ID) => R

// -------------------------------------------------------------------------------------------------
// util
// -------------------------------------------------------------------------------------------------
export const _split = R.split(separatorRegExp)
export const lengthIsTwo = F.flow(R.length, R.equals(2))
export const isStringTuple = lengthIsTwo as F.Predicate<string[]> as F.Refinement<
  string[],
  [string, string]
>
export const splitInto2 = F.flow(_split, O.fromPredicate(isStringTuple))

// -------------------------------------------------------------------------------------------------
// create
// -------------------------------------------------------------------------------------------------
export const createDirected: Create<DirectedRelID> = (u) => (v) => (u + '->' + v) as DirectedRelID
export const createUndirected: Create<UndirectedRelID> = (u) => (v) =>
  [u, v].sort().join('--') as UndirectedRelID

// -------------------------------------------------------------------------------------------------
// read
// -------------------------------------------------------------------------------------------------
export const split: (rID: RelID) => [ID, ID] = (rID) => _split(rID) as [ID, ID]

export const getTheOtherID: (id: ID) => (rID: RelID) => ID = (id) =>
  F.flow(split, R.without([id]), (x) => x[0] as ID)

export const getFst = F.flow(split, T.fst)
export const getSnd = F.flow(split, T.snd)
export const getSrc: (rID: DirectedRelID) => ID = getFst
export const getDst: (rID: DirectedRelID) => ID = getSnd

type GetDirection<R> = (left: ID, right: ID) => (rID: DirectedRelID) => R
export const safeGetDirection: GetDirection<O.Option<'->' | '<-'>> = (l, r) =>
  F.flow(
    split,
    R.cond<[ID, ID], O.Option<'->' | '<-'>>([
      [R.equals([l, r]), F.constant(O.some('->'))],
      [F.flow(swap, R.equals([l, r])), F.constant(O.some('<-'))],
      [R.T, F.constant(O.none)],
    ])
  )

export const getDirection: GetDirection<'->' | '<-' | undefined> = (r, l) =>
  F.flow(safeGetDirection(r, l), O.getOrElseW(F.constUndefined))

// -------------------------------------------------------------------------------------------------
// pred
// -------------------------------------------------------------------------------------------------
export const hasID: (id: ID) => (relID: RelID) => boolean = (id) => F.flow(split, R.includes(id))
export const notHasIDs: (ids: readonly ID[]) => (relID: RelID) => boolean = (ids) =>
  F.flow(split, noIntersection(ids))

export const isValidRelID: (ids: ID[]) => (x: unknown) => boolean = (ids) =>
  F.flow(
    t.string.decode,
    E.chainOptionK(() => false as any)(
      F.flow(
        splitInto2,
        O.map((xs) => xs.every(R.includes(R.__, ids)))
      )
    ),
    E.getOrElse(F.constFalse)
  )
