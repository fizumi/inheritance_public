/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/*
    model/index に依存
*/

// import { view } from 'ramda'
// import * as lens from './lens'
import { Store } from './index'
import { RELS } from './types'

// export const marriage = view(lens.marriage) // これだとエラーになってしまう
// export const marriage = (s: Store) => view(lens.marriage, s) // これをするくらいなら以下の方がシンプルで良い
export const marriage = (s: Store) => s[RELS].marriage
export const jointAdoption = (s: Store) => s[RELS].jointAdoption
export const isParent = (s: Store) => s[RELS].isParent
// export const jointAdoption = view(lens.jointAdoption)
// export const isParent = view(lens.isParent)
