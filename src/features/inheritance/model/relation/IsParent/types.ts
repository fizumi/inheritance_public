import tb from 'ts-toolbelt'
import * as R from 'ramda'
import { toDict, invertToNumberValueObj } from 'src/utils/types'
import { Dates } from '../shared/types'
import { RelationType } from '../../types'

// export const typeOfPnC = ['実親子', '養親子', '特別養親子', '特別養親子、又は実親子'] as const
export const types = ['実親子', '養親子', '特別養親子'] as const
export const typeDict = toDict(types)
export const typeIndex = invertToNumberValueObj(types)
export type TypeUnion = typeof types[number]
type RelDict = typeof typeDict
const propsOfRel = ['type'] as const
export const propDict = toDict(propsOfRel)
export type PropDict = typeof propDict
export type PropsUnion = typeof propsOfRel[number]

export interface IsParent extends Dates {
  // startDate: 縁組日 ( type === 'biological' なら child の出生日, それ以外なら縁組日)
  // endDate:   離縁日 (特別養子縁組による終了は別途考慮する)
  type: TypeUnion
}

export const isParent = (r: RelationType): r is IsParent => R.has<PropsUnion>('type', r)
;() =>
  tb.Test.checks([
    tb.Test.check<
      tb.Any.Is<keyof IsParent, PropsUnion, '<-extends'>,
      tb.B.True, tb.Test.Pass >(), // prettier-ignore
  ])

// validation 後
export interface ActualPnC extends IsParent {
  // startDate: 縁組日 ( type === 'biological' なら child の出生日, それ以外なら縁組日)
  // endDate:   離縁日 (特別養子縁組による終了は別途考慮する)
  type: RelDict['実親子']
}
export interface LegalPnC extends IsParent {
  startDate: string // compulsory
  type: RelDict['養親子'] | RelDict['特別養親子']
}
