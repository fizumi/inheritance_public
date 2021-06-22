// import { ID } from '../../../shared/types'
import { Dates } from '../shared/types'
import { toDict, invertToNumberValueObj } from 'src/utils/types'

// eslint-disable-next-line @typescript-eslint/no-empty-interface

export const types = ['共同縁組', '第817条の3第2項但書等'] as const
export const typeDict = toDict(types)
export const typeIndex = invertToNumberValueObj(types)
export type TypeUnion = typeof types[number]
export type RelDict = typeof typeDict
const propsOfRel = ['type'] as const
export const propDict = toDict(propsOfRel)
export type PropDict = typeof propDict
export type PropsUnion = typeof propsOfRel[number]

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface JointAdoption extends Dates {
  // startDate: 共同縁組日 （必須）
  // endDate:   共同離縁日
  type: TypeUnion
}
