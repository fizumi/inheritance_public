import { either as E, function as F, readonlyArray as A } from 'fp-ts'
import * as R from 'ramda'
import { noIntersection } from './array'
import { getValueIfThunk, ValueOrThunk } from './function'
import { ID } from './idMap'

type AS_ID_ID_AS<A> = (rels: ValueOrThunk<readonly A[]>) => (id: ID) => (id2: ID) => readonly A[]

type AS_ID_ID_Ret<A, Ret> = (rels: ValueOrThunk<readonly A[]>) => (id: ID) => (id2: ID) => Ret

export const getJustOne = <A>(narrower: AS_ID_ID_AS<A>): AS_ID_ID_Ret<A, E.Either<Error, A>> => {
  return (as) => (id) => (id2) =>
    F.pipe(
      narrower(as)(id)(id2),
      E.fromPredicate(
        (as) => as.length === 1,
        (as) =>
          new Error(
            `Can't narrow down to just one. The length is ${as.length}. the IDs are ${id}, ${id2}`
          )
      ),
      E.map((as) => as[0])
    )
}

// getRelSafely を F.flow の第一引数として利用しようとしたが, どう頑張っても Generic Type を上手く反映できなかった
export const getJustOneWithIndex = <A>(
  narrower: AS_ID_ID_AS<A>
): AS_ID_ID_Ret<A, E.Either<Error, [number, A]>> => {
  return (as) => (id) => (id2) => {
    return F.pipe(
      getJustOne(narrower)(as)(id)(id2),
      E.map((value) =>
        F.pipe(
          getValueIfThunk(as),
          R.findIndex((a) => a === value),
          (index) => [index, value]
        )
      )
    )
  }
}

export const reject: (
  ids: readonly string[]
) => <A>(getIDs: (a: A) => ID[]) => (s: readonly A[]) => readonly A[] = (ids) => (getIDs) =>
  A.filter(F.flow(getIDs, noIntersection(ids)))
