import { function as F, readonlyRecord as RR, readonlyArray as A } from 'fp-ts'
import * as R from 'ramda'
// import { getRelsBy } from 'src/features/persons/model'
import { memoizeCurriedFn } from 'src/utils/fp/common'
import { ID } from '../../../shared/types'
import { IP, RID, IsParent } from '../../relation'
import * as RStore from '../shared/RelationStore/model'
import { IsParents } from './types'
import { DirectedRelID } from '../../relation/shared'

// -------------------------------------------------------------------------------------------------
// instance / type
// -------------------------------------------------------------------------------------------------
const rstore = RStore.fixType<DirectedRelID, IsParent>(RID.createDirected)
type Endomorphism = F.Endomorphism<IsParents>

// -------------------------------------------------------------------------------------------------
// insert / create
// -------------------------------------------------------------------------------------------------
/**
 * @param parentID
 * @param childID
 * @param isParentRel
 */
export const upsertAt = rstore.upsertAt
export const insertAt = rstore.insertAt

export const createXXsertParentRel: (
  xxsert: RStore.InsertAt<IP.IsParent> | RStore.UpsertAt<IP.IsParent>
) => (parentID: ID, childID: ID, relsOfTheChild: IsParents) => Endomorphism =
  (xxsert) => (parentID, childID, relsOfTheChild) => {
    const actualRels = filterActual(relsOfTheChild)
    const type = parentCountIsLessThanTwo(actualRels) ? '実親子' : '養親子'
    return xxsert(parentID, childID, IP.create({ type }))
  }

export const upsertParentRel = createXXsertParentRel(upsertAt)
export const insertParentRel = createXXsertParentRel(insertAt)
export const insertParentRels: (
  parentIDs: ID[],
  childID: ID,
  relsOfTheChild: IsParents
) => Endomorphism = (parentIDs, childID, relsOfTheChild) => {
  return (ips) => {
    let accIps = ips
    for (const parentID of parentIDs) {
      const endomorphism = insertParentRel(parentID, childID, relsOfTheChild)
      relsOfTheChild = endomorphism(relsOfTheChild)
      accIps = endomorphism(accIps)
    }
    return accIps
  }
}

// -------------------------------------------------------------------------------------------------
// read
// -------------------------------------------------------------------------------------------------
type ReduceTo<ACC> = (idType: 'childID' | 'parentID') => (id: ID) => (as: IsParents) => ACC

export const pluck: ReduceTo<ReadonlyArray<ID>> = (idType) => (id) => {
  return RR.foldMapWithIndex(A.getMonoid<ID>())(
    F.flow(RID.split, ([parent, child]) => {
      const [compare, ret] = idType === 'childID' ? [parent, child] : [child, parent]
      return compare === id ? [ret] : []
    })
  )
}
export const getParentIDs = pluck('parentID')
export const getChildIDs = pluck('childID')

export const filterBy: ReduceTo<IsParents> = memoizeCurriedFn((idType) => (id) => {
  return RR.filterWithIndex(F.flow(IP.get(idType), R.equals(id)))
})

export const filterByChildID = filterBy('childID')
export const filterByParentID = filterBy('parentID')

export const { getWithIndex: safeGetWithIndex, get: safeGet } = rstore

export const filterActual = RR.filter<IsParent>(R.propEq('type', IP.typeDict.実親子))
export const fileterSpectial = RR.filter<IsParent>(R.propEq('type', IP.typeDict.特別養親子))
export const fileterActualOrSpecial = RR.filter<IsParent>(
  R.complement(R.propEq('type', IP.typeDict.養親子))
)

// export const separatePnCRelsToNonActualAndActual = F.flow(
//   RR.partition<IsParent>(R.propEq('type', '実親子')),
//   ({ left, right }) => [left, right] as const
// ) // {right: '実親子'}

// -------------------------------------------------------------------------------------------------
// update
// -------------------------------------------------------------------------------------------------
/**
 * @param parentID
 * @param childID
 * @param prop
 * @param value
 */
export const updateAtAt = rstore.updateAtAt

// -------------------------------------------------------------------------------------------------
// delete
// -------------------------------------------------------------------------------------------------
export const { reject, remove } = rstore

// -------------------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------------------
export const parentCount: (as: IsParents) => number = RR.size

// -------------------------------------------------------------------------------------------------
// preds
// -------------------------------------------------------------------------------------------------
type TypePred = (rID: RID.DirectedRelID) => (id: ID) => boolean
export const isChild: TypePred = (rID) => (parentID) => IP.get('parentID')(rID) === parentID
export const isParent: TypePred = (rID) => (childID) => IP.get('childID')(rID) === childID

export const parentCountIsGreaterThanEqualTwo = F.flow(parentCount, R.lte(2))
export const parentCountIsLessThanEqualTwo = F.flow(parentCount, R.gte(2))
export const parentCountIsLessThanTwo = F.flow(parentCount, R.gt(2))

export const actualParentCountIsLessThanEqualTwo = F.flow(
  filterActual,
  parentCountIsLessThanEqualTwo
)
export const actualParentCountIsGreaterThanEqualTwo = F.flow(
  filterActual,
  parentCountIsGreaterThanEqualTwo
)
