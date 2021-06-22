import { function as F, readonlyArray as A, readonlyTuple as T } from 'fp-ts'
import * as RA from 'ramda-adjunct'

export const filterSndIsNotNil = A.filter(F.flow(T.snd, RA.isNotNil)) as <K extends string, V>(
  fa: readonly (readonly [K, V])[]
) => readonly (readonly [K, NonNullable<V>])[]
