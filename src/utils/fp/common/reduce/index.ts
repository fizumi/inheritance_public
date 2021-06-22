import { either as E, option as O } from 'fp-ts'
import { Either, right } from 'fp-ts/Either'
import { Foldable1 } from 'fp-ts/Foldable'
import { FoldableWithIndex1 } from 'fp-ts/FoldableWithIndex'
import { flow, pipe } from 'fp-ts/function'
import { Kind, URIS } from 'fp-ts/HKT'
import { Monoid } from 'fp-ts/Monoid'
import { Option } from 'fp-ts/Option'

export * as TEEO from './TEEO'
export * as TEO from './TEO'

/**
 * f が none を返した場合、acc に加えられない
 * filterMapWithIndex との違い:
 *  - monoid を使える
 *  - Endomorphism に限定されない
 */
export const reduceOWithIndex =
  <F extends URIS, I, B>(F: FoldableWithIndex1<F, I>, M: Monoid<B>) =>
  <A>(f: (ma: Option<[I, A]>, i: I, a: A, b: B) => Option<B>) =>
  (fa: Kind<F, A>): B =>
    F.reduceWithIndex(fa, M.empty, (i: I, b: B, a: A) =>
      pipe(
        f(O.of([i, a]), i, a, b),
        O.map((bb) => M.concat(b, bb)),
        O.getOrElse(() => b)
      )
    )

/**
 * f が none を返した場合、acc に加えられない
 */
export const reduceO =
  <F extends URIS, B>(F: Foldable1<F>, M: Monoid<B>) =>
  <A>(f: (ma: Option<A>, a: A, b: B) => Option<B>) =>
  (fa: Kind<F, A>): B =>
    F.reduce(fa, M.empty, (b: B, a: A) =>
      pipe(
        f(O.of(a), a, b),
        O.map((bb) => M.concat(b, bb)),
        O.getOrElse(() => b)
      )
    )

export const reduceEWithIndex =
  <F extends URIS, I, B>(F: FoldableWithIndex1<F, I>, M: Monoid<B>) =>
  <A, E>(f: (i: I, a: A) => Either<E, Option<B>>) =>
  (fa: Kind<F, A>): Either<E, B> => {
    return F.reduceWithIndex(fa, right(M.empty), (i: I, b: Either<E, B>, a: A) => {
      return pipe(
        b,
        E.chain((prevB) =>
          pipe(
            f(i, a),
            E.map(
              flow(
                O.map((newB) => M.concat(prevB, newB)),
                O.getOrElse(() => prevB)
              )
            )
          )
        )
      )
    })
  }
