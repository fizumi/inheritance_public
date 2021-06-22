/*
    model/index に依存
*/
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as R from 'ramda'
import { IDMap, createPropLensDict } from 'src/utils/fp/common'
import { Store, RELS, COLS, WebCol, RelationStore, allFieldKeys, relationKeys, ID } from './index'

export const storePLens = createPropLensDict<Store>([COLS, RELS])
export const webcolPLens = createPropLensDict<WebCol>(allFieldKeys)
export const relsPLens = createPropLensDict<RelationStore>(relationKeys)

export const cols = storePLens[COLS]
export const rels = storePLens[RELS]

const createIDLens =
  <T>(t: R.Lens<WebCol, IDMap<T>>) =>
  (id: ID) =>
    R.compose(storePLens[COLS], t, R.lensProp(id))

export const deathDate = createIDLens(webcolPLens.deathDate)
export const portionOfInheritance = createIDLens(webcolPLens.portionOfInheritance)
export const isAlive = createIDLens(webcolPLens.isAlive)
// export const isAlive = (id: ID) => R.compose(storePLens[COLS], webcolPLens.isAlive, R.lensProp(id))

export const marriage = R.compose(storePLens[RELS], relsPLens.marriage)
export const jointAdoption = R.compose(storePLens[RELS], relsPLens.jointAdoption)
export const isParent = R.compose(storePLens[RELS], relsPLens.isParent)
