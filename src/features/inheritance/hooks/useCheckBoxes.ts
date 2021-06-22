import React from 'react'
import constate from 'src/libraries/constate'
import { IDMap, removeIDs } from 'src/utils/fp/common'
import { invertToNumberValueObj } from 'src/utils/types'
import { ID } from 'src/features/inheritance/model'
import { readonlyRecord as RR, function as F } from 'fp-ts'
import * as R from 'ramda'

export const [CheckBoxesProvider, useCheckBoxes] = constate(() => {
  const [checkedIDandIndex, setCheckBoxes] = React.useState<IDMap<number>>({})
  const uncheckAll = () => setCheckBoxes({})
  const checkAll = (ids: ID[]) => F.pipe(ids, invertToNumberValueObj, setCheckBoxes)

  const createHandleChange = React.useCallback(
    (id: ID, index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
      event.target.checked ? setCheckBoxes(R.assoc(id, index)) : setCheckBoxes(R.dissoc(id))
    },
    []
  )

  const checkedIDs = RR.keys(checkedIDandIndex)
  const checkedIndex = checkedIDs.length === 1 ? checkedIDandIndex[checkedIDs[0]] : null

  const remove = F.flow(removeIDs, R.applyTo(checkedIDandIndex), setCheckBoxes)

  return {
    checkedIDandIndex,
    setCheckBoxes,
    checkAll,
    uncheckAll,
    checkedIDs,
    remove,
    createHandleChange,
    checkedIndex,
  }
})

export const useIsSelected = (id: ID): boolean => {
  const { checkedIDs } = useCheckBoxes()

  return checkedIDs.includes(id)
}
