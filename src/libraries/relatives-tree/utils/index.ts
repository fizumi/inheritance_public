import * as R from 'ramda'
import Store from '../store'
import { ID, ArrangedNode } from '../types'
import { eq } from 'fp-ts'

export const equalId =
  <I extends number | ID>(idA: ID) =>
  <T extends I | { id: I }>(idB: T) =>
    R.has('id', idB) ? idA === (idB as any).id : idA === idB
export const withType =
  <T extends { type: string }>(...types: string[]) =>
  (item: T) =>
    types.includes(item.type)
export const unique = <T>(item: T, index: number, arr: T[]): boolean => arr.indexOf(item) === index
export const inAscOrder = (v1: number, v2: number) => v1 - v2
export const idToNode = (store: Store) => (id: ID) => store.getNode(id)

export const eqArrangedNode = eq.contramap((a: ArrangedNode) => a.id)(eq.eqString)
