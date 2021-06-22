import { option as O, readonlyArray as A } from 'fp-ts'
import { pipe } from 'fp-ts/lib/function'
import { COLS, Store, toAscOrderNonEmptyEntries } from '../../model'
import { die } from '../../model/utils'
import { ID } from '../../shared/types'
import { InheritanceTuple } from '../shared/types'

declare const distributeHeritage: (inheriteeID: ID, inheritanceDate: string) => (s: Store) => Store

export const inheritance = (s: Store, [inheriteeId, inheritanceDate]: InheritanceTuple): Store =>
  pipe(s, die(inheriteeId), distributeHeritage(inheriteeId, inheritanceDate))

export const calcInheritance: (s: Store) => Store = (s) =>
  pipe(
    toAscOrderNonEmptyEntries(s[COLS].deathDate),
    O.map(A.reduce(s, inheritance)),
    O.getOrElse(() => s)
  )
