import React from 'react'
import { RelationKey, RELS } from 'src/features/inheritance/model'
import { MyFormikValues, useSetRels, useValuesRef } from '.'

export const useRelations = <K extends RelationKey>(key: K) => {
  const setRels = useSetRels(key)
  const valuesRef = useValuesRef()
  const getRelations = React.useCallback<() => MyFormikValues['rels'][K]>(
    () => valuesRef.current[RELS][key],
    [key, valuesRef]
  )
  return {
    setRels,
    valuesRef,
    getRelations,
  }
}

// import React from 'react'
// import { function as F } from 'fp-ts'
// import * as R from 'ramda'
// import { sequenceSRefChange } from 'src/common/utils'
// import {
//   RelationKey,
//   RELS,
//   createParentRel,
//   TypeOfPnC,
//   Parent,
//   ID,
// } from 'src/features/persons/model'
// import { MyFormikValues, useSetRels, useValuesRef } from '../hooks'

// type PnC = Parent
// const memo = sequenceSRefChange()(useRelations)
// export const usePnCRelations = () => {
//   return F.pipe(
//     useRelations('isParent'),
//     memo(({ setRels, getRelations }) => {
//       const insertRel = F.flow(createParentRel, R.append(R.__, getRelations()), setRels)
//       const updateRel = (relUpdater: (rel: PnC) => PnC) => (rel: PnC) => {
//         const relations = getRelations()
//         const index = R.indexOf(rel, relations)
//         setRels(R.adjust(index, relUpdater, relations))
//       }
//       const deleteRel = (rel: PnC) => {
//         F.pipe(R.without([rel], getRelations()), setRels)
//       }
//       return { insertRel, updateRel, deleteRel }
//     })
//   )
// }
