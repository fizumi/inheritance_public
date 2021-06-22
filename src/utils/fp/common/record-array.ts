import {
  readonlyRecord as RR,
  readonlyArray as A,
  readonlyTuple as T,
  function as F,
  readonlyNonEmptyArray as NEA,
  option as O,
} from 'fp-ts'
import * as R from 'ramda'

// export const record2arrayBy = <A, B>(f: (a: A) => readonly [Key, B]) => (
//   fa: ReadonlyArray<A>
// ): Readonly<Record<Key, B>> => RR.fromFoldableMap(S.last<B>(), A.Foldable)(fa, f)

export const record2arrayBy: <K extends string, A, B>(
  f: (k: K, a: A) => B
) => (fa: Readonly<Record<K, A>>) => readonly B[] = <K extends string, A, B>(
  f: (k: K, a: A) => B
) => RR.foldMapWithIndex(A.getMonoid<B>())(F.flow(f, A.of))

export const record2nonEmptyEntries = F.flow(Object.entries, NEA.fromArray) as <
  K extends string,
  V
>(
  o: RR.ReadonlyRecord<K, V>
) => O.Option<NEA.ReadonlyNonEmptyArray<[K, V]>>

export const getKeysWithoutDuplicate = (objects: Record<string, unknown>[]): string[] =>
  F.pipe(objects, A.map(R.keys), R.reduce<string[], string[]>(R.union, []))
