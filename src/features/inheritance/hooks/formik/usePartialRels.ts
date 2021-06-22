import React from 'react'
import { sequenceSRefChange } from 'src/utils/fp/common'
import {
  ID,
  IPs,
  JAs,
  Mrrgs,
  R2Store,
  RelationKey,
  RKeyDict,
  RStore,
} from 'src/features/inheritance/model'
import { GetRels, useRels } from './formik'
const memoizeWith = sequenceSRefChange()

type Props<K extends RelationKey> =
  | {
      rKey: K
      id: ID
      childID?: any
    }
  | {
      rKey: RKeyDict['isParent'] | RKeyDict['marriage']
      id: ID
      childID?: never
    }
  | {
      rKey: RKeyDict['jointAdoption']
      id: ID
      id2: ID
      childID: ID
    }

export const usePartialRels = <K extends RelationKey>(props: Props<K>) => {
  const rels = useRels(props.rKey)
  const [curRels, setCurRels] = React.useState<GetRels<K>>({})
  React.useMemo(() => {
    const memo = memoizeWith(setCurRels) // 各要素の参照を記憶する
    switch (props.rKey) {
      case 'isParent':
        setCurRels(memo(IPs.filterByChildID(props.id)(rels as any)) as any)
        break
      case 'marriage':
        setCurRels(memo(Mrrgs.filterByID(props.id)(rels as any)) as any)
        break
      case 'jointAdoption':
        setCurRels(memo(JAs.filterByIDs([props.id, props.childID])(rels as any)) as any)
        break

      default:
        break
    }
  }, [props.childID, props.id, props.rKey, rels])

  const value = React.useMemo(() => {
    switch (props.rKey) {
      case 'isParent':
      case 'marriage':
        return RStore.getTheOtherIDs(props.id)(curRels)
      case 'jointAdoption':
        return R2Store.getTheOtherIDs(props.id, props.childID)(curRels)
    }
    throw new Error('logic error')
  }, [curRels, props.childID, props.id, props.rKey])

  return {
    curRels,
    value,
  }
}
