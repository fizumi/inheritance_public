import { MapValue } from 'src/utils/types'
import {
  getSpouseIDs,
  getChildIDs,
  getSiblingIDs,
  getParentIDs,
} from 'src/features/inheritance/logic/getRelativeId'
import { COLS, ID } from 'src/features/inheritance/model'
import { MyFormikValues } from '../types'
import { FamilyNode } from 'src/libraries/relatives-tree/types'

export const getFamilyNodeCreator =
  (values: MyFormikValues) =>
  (id: ID): FamilyNode => {
    const node = { id, name: values[COLS].name[id] } as Pick<FamilyNode, 'id' | 'name'>

    type GetterProps = MapValue<{ get: () => any }, Omit<FamilyNode, 'id' | 'name'>>
    Object.defineProperties(node, {
      parentIDs: { get: () => getParentIDs(values)(id), enumerable: true },
      childIDs: { get: () => getChildIDs(values)(id), enumerable: true },
      spouseIDs: { get: () => getSpouseIDs(values)(id), enumerable: true },
      siblingIDs: { get: () => getSiblingIDs(values)(id), enumerable: true },
    } as GetterProps)

    return node as FamilyNode
  }

export const getFamilyNodes = (values: MyFormikValues): FamilyNode[] =>
  values[COLS].id.map(getFamilyNodeCreator(values))

/*
  enumerable: true で for ... in で走査可能にする
  これにより，（内部的に for ... in を使っている）R.assoc を使うことでで getter が property になる
*/
