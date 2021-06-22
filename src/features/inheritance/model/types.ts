/*
    各種 model に依存

    各種 model の情報をまとめる
*/
import * as R from 'ramda'
import { toDict } from 'src/utils/types'
import { allFieldKeys, WebCol } from './fields/types'
import { Marriage, IsParent } from './relation'
import { JointAdoptions, Marriages, IsParents } from './relations'

export const relationKeys = ['isParent', 'marriage', 'jointAdoption'] as const
export const rKeyDict = toDict(relationKeys)
export type RKeyDict = typeof rKeyDict
export type RelationKey = typeof relationKeys[number]

export type RelationType = Marriage | IsParent
export type RelationsType = Marriages | IsParents

export const allKeys = [...allFieldKeys, ...relationKeys] as const

export const key = toDict(allKeys)
export type Key = typeof key
export type AllKeys = typeof allKeys[number]

export const COLS = 'cols'
export const RELS = 'rels'
export type Store = { [COLS]: WebCol; [RELS]: RelationStore }
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const isStore = (x: any): x is Store => R.has(COLS, x) && R.has(RELS, x)

export const label: Record<AllKeys, any> = {
  id: 'ID',
  name: '名前',
  pseudoParents: '親',
  pseudoSpouses: '配偶者',
  deathDate: '死亡日',
  portionOfInheritance: '持ち分',
  isAlive: 'isAlive',
  isParent: '親',
  marriage: '配偶者',
  jointAdoption: '共同縁組',
}

// 親, 子, 配偶者等のIDや情報は 自身のID をもとに, ここから取得する
export type RelationStore = {
  [key.isParent]: IsParents
  [key.marriage]: Marriages
  [key.jointAdoption]: JointAdoptions
}

export const initialRels = {
  [key.isParent]: {} as IsParents,
  [key.marriage]: {} as Marriages,
  [key.jointAdoption]: {} as JointAdoptions,
}

export type GetRel<K extends RelationKey> = K extends 'isParent' ? IsParent : Marriage
export type GetRels<K extends RelationKey> = K extends 'isParent' ? IsParents : Marriages
