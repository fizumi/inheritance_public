import {
  either as E,
  function as F,
  readonlyNonEmptyArray as NEA,
  readonlyRecord as RR,
} from 'fp-ts'
import { error } from 'src/utils/fp/common'
import tb from 'ts-toolbelt'
import { keyAndHasStartDateOrd, MayHasStartDate } from '../../relation'

/**
 * @deprecated
 */
export const assertStartDateExist = <K extends string, A extends MayHasStartDate>(
  xs: RR.ReadonlyRecord<K, A>
): E.Either<Error, RR.ReadonlyRecord<K, tb.O.Compulsory<A, 'startDate'>>> =>
  F.pipe(
    xs,
    RR.traverse(E.Applicative)((x) =>
      x.startDate == null
        ? E.left(error(`データ不正`))
        : E.right(x as tb.O.Compulsory<A, 'startDate'>)
    )
  )
// export const assertStartDateExist = <X extends MayHasStartDate>(
//   xs: readonly X[]
// ): E.Either<Error, readonly tb.O.Compulsory<X, 'startDate'>[]> =>
//   F.pipe(
//     xs,
//     A.traverse(E.Applicative)((x) =>
//       x.startDate == null
//         ? E.left(error(`データ不正`))
//         : E.right(x as tb.O.Compulsory<X, 'startDate'>)
//     )
//   )

export const getKeyValueTupleThatHasLatestStartDate = NEA.min(keyAndHasStartDateOrd) as <
  A,
  X extends MayHasStartDate
>(
  xs: NEA.ReadonlyNonEmptyArray<readonly [A, X]>
) => [A, X]
