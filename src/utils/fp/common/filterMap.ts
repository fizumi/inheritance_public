// https://medium.com/javascript-scene/transducers-efficient-data-processing-pipelines-in-javascript-7985330fe73d
import { PredicateWithIndex } from 'fp-ts/FilterableWithIndex'
import { FoldableWithIndex1 } from 'fp-ts/FoldableWithIndex'
import { Foldable1 } from 'fp-ts/Foldable'
import { URIS, Kind } from 'fp-ts/HKT'
import { Monoid } from 'fp-ts/Monoid'
import { Predicate } from 'fp-ts/function'

export const composeReducerWithIndex =
  <B>(M: Monoid<B>) =>
  <I, A>(
    filter: PredicateWithIndex<I, A>,
    map: (i: I, a: A) => B
  ): [B, (i: I, b: B, a: A) => B] => {
    const reducer = (i: I, acc: B, a: A) => {
      return filter(i, a) ? M.concat(acc, map(i, a)) : acc
    }
    return [M.empty, reducer]
  }

export const composeReducer =
  <B>(M: Monoid<B>) =>
  <A>(filter: Predicate<A>, map: (a: A) => B): [B, (b: B, a: A) => B] => {
    const reducer = (acc: B, cur: A) => {
      return filter(cur) ? M.concat(acc, map(cur)) : acc
    }
    return [M.empty, reducer]
  }

/**
 * composeReducer では, pipe 内で(filter, map)を定義する際に, 型A を推測できないが,
 * filterMapWithIndex なら推測できる.
 */
export const filterMapWithIndex =
  <F extends URIS, I, B>(F: FoldableWithIndex1<F, I>, M: Monoid<B>) =>
  <A>(filter: PredicateWithIndex<I, A>, map: (i: I, a: A) => B) =>
  (fa: Kind<F, A>): B => {
    return F.reduceWithIndex(fa, M.empty, (i: I, b: B, a: A) => {
      return filter(i, a) ? M.concat(b, map(i, a)) : b
    })
  }
export const filterMap =
  <F extends URIS, B>(F: Foldable1<F>, M: Monoid<B>) =>
  <A>(filter: Predicate<A>, map: (a: A) => B) =>
  (fa: Kind<F, A>): B => {
    return F.reduce(fa, M.empty, (b: B, a: A) => {
      return filter(a) ? M.concat(b, map(a)) : b
    })
  }
