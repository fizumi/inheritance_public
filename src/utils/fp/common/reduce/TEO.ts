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

type TEO<A, B> = [Either<B, Option<A>>, B]
type Reduced<B> = Either<B, never>
export const reduce =
  <F extends URIS, B>(F: Foldable1<F>, M: Monoid<B>) =>
  <A, E>(f: (mab: TEO<A, B>, a: A, b: B) => TEO<B, B>) =>
  (fa: Kind<F, A>): B => {
    return pipe(
      F.reduce(fa, right(M.empty), (b: Either<B, B>, a: A) => {
        if (isLeft(b)) {
          return b as Reduced<B>
        }
        const prevB = b.right
        return pipe(
          f([right(some(a)), prevB], a, prevB),
          T.mapFst(
            E.map(
              flow(
                O.map((newB) => M.concat(prevB, newB)),
                O.getOrElse(() => prevB)
              )
            )
          ),
          fst // ->  Either<B, B>
        )
      }),
      E.getOrElse(identity)
    )
  }

export const map =
  <A, B>(f: (a: A, b: B) => B) =>
  (a: TEO<A, B>): TEO<B, B> =>
    pipe(a, T.mapFst(E.map(O.map((aa) => f(aa, snd(a))))))

export const filter =
  <A, B>(f: (a: A, b: B) => boolean) =>
  (a: TEO<A, B>): TEO<A, B> =>
    pipe(a, T.mapFst(E.map(O.chain(O.fromPredicate((aa) => f(aa, snd(a)))))))

/**
 * Skip any further calculations including concatenation.
 */
export const breakReduce =
  <A, B>(f: (a: A, b: B) => boolean) =>
  (teo: TEO<A, B>): TEO<A, B> =>
    pipe(
      teo,
      T.mapFst((eo) => {
        if (isLeft(eo) || isNone(eo.right)) return eo
        const [a, b] = [eo.right.value, snd(teo)]
        return f(a, b) ? left(b) : eo
      })
    )

export const reduced =
  <A, B>(f: (a: A, b: B) => Option<B>) =>
  (teo: TEO<A, B>): TEO<A, B> =>
    pipe(
      teo,
      T.mapFst((eo) => {
        if (isLeft(eo) || isNone(eo.right)) return eo
        const [a, b] = [eo.right.value, snd(teo)]
        const bb = f(a, b)
        if (isNone(bb)) return eo
        return left(bb.value)
      })
    )
