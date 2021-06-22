import {
  function as F,
  option as O,
  ord,
  readonlyArray as A,
  readonlyNonEmptyArray as NEA,
  readonlyTuple as T,
  string,
} from 'fp-ts'
import { filterSndIsNotNil, record2nonEmptyEntries } from 'src/utils/fp/common'

export const sortBySndStringOrd = ord.contramap(T.snd)(string.Ord) as ord.Ord<
  readonly [any, string]
>

export const toAscOrderNonEmptyEntries = F.flow(
  record2nonEmptyEntries as <K extends string, V extends string | null>(
    o: Readonly<Record<K, V>>
  ) => O.Option<NEA.ReadonlyNonEmptyArray<[K, V]>>,
  O.map(F.flow(filterSndIsNotNil, (x) => x, A.sort(sortBySndStringOrd)))
)
