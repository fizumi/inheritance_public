// https://medium.com/javascript-scene/transducers-efficient-data-processing-pipelines-in-javascript-7985330fe73d
import { PredicateWithIndex } from 'fp-ts/FilterableWithIndex'
import { FoldableWithIndex1 } from 'fp-ts/FoldableWithIndex'
import { Foldable1 } from 'fp-ts/Foldable'
import { URIS, Kind } from 'fp-ts/HKT'
import { Monoid } from 'fp-ts/Monoid'
import { Predicate, pipe, flow, identity } from 'fp-ts/function'
import { Option, isSome, isNone, some, none } from 'fp-ts/Option'
import { Either, isLeft, right, left, Left, Right } from 'fp-ts/Either'
import { fst, snd } from 'fp-ts/ReadonlyTuple'
import { option as O, either as E, tuple as T } from 'fp-ts'

type TEEO<E, A, B> = [Either<E, Either<B, Option<A>>>, B]
type Reduced<B> = Either<never, Either<B, never>>
type SkipConcat = Either<never, Either<never, O.None>>
export const reduce =
  <F extends URIS, B>(F: Foldable1<F>, M: Monoid<B>) =>
  <A, E>(f: (mab: TEEO<E, A, B>, a: A, b: B) => TEEO<E, B, B>) =>
  (fa: Kind<F, A>): Either<E, B> => {
    return pipe(
      F.reduce(fa, right(right(M.empty)), (b: Either<E, Either<B, B>>, a: A) => {
        if (isLeft(b)) {
          return b // Error (Left<E>)
        }
        if (isLeft(b.right)) {
          return b as Reduced<B>
        }
        const prevB = b.right.right
        return pipe(
          f([right(right(some(a))), prevB], a, prevB),
          T.mapFst(
            E.map(
              E.map(
                flow(
                  O.map((newB) => M.concat(prevB, newB)),
                  O.getOrElse(() => prevB)
                )
              )
            )
          ),
          fst // -> Either<E, Either<B, B>>
        )
      }),
      E.map(E.getOrElse(identity))
    )
  }

export const map =
  <A, B>(f: (a: A, b: B) => B) =>
  (a: TEEO<any, A, B>): TEEO<any, B, B> =>
    pipe(a, T.mapFst(E.map(E.map(O.map((aa) => f(aa, snd(a)))))))

export const filter =
  <A, B>(f: (a: A, b: B) => boolean) =>
  (a: TEEO<any, A, B>): TEEO<any, A, B> =>
    pipe(a, T.mapFst(E.map(E.map(O.chain(O.fromPredicate((aa) => f(aa, snd(a))))))))

/**
 * Skip any further calculations including concatenation.
 */
export const breakReduce =
  <A, B>(f: (a: A, b: B) => boolean) =>
  (teeo: TEEO<any, A, B>): TEEO<any, A, B> =>
    pipe(
      teeo,
      T.mapFst(
        E.map((eo) => {
          if (isLeft(eo) || isNone(eo.right)) return eo
          const [a, b] = [eo.right.value, snd(teeo)]
          return f(a, b) ? left(b) : eo
        })
      )
    )
export const reduced =
  <A, B>(f: (a: A, b: B) => Option<B>) =>
  (teeo: TEEO<any, A, B>): TEEO<any, A, B> =>
    pipe(
      teeo,
      T.mapFst(
        E.map((eo) => {
          if (isLeft(eo) || isNone(eo.right)) return eo
          const [a, b] = [eo.right.value, snd(teeo)]
          const bb = f(a, b)
          if (isNone(bb)) return eo
          return left(bb.value)
        })
      )
    )

export const chain =
  <E, A, B>(f: (a: A, b: B) => Either<E, B>) =>
  (teeo: TEEO<E, A, B>): TEEO<E, B, B> =>
    pipe(
      teeo,
      T.mapFst((eeo) =>
        pipe(
          eeo,
          E.chain((eo) => {
            if (isLeft(eo) || isNone(eo.right)) return eeo as Reduced<B> | SkipConcat
            const [a, b] = [eo.right.value, snd(teeo)]
            const bb = f(a, b)
            return isLeft(bb) ? bb : right(right(some(bb.right)))
          })
        )
      )
    )
