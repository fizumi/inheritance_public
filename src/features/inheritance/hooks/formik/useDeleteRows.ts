import { function as F } from 'fp-ts'
import * as R from 'ramda'
import { COLS, initialRels, RELS, defaultWebRow, key, Row } from 'src/features/inheritance/model'
import { Mrrgs, IPs, JAs } from 'src/features/inheritance/model/relations'
import { initializeField } from 'src/utils/fp/common/idMap'
import { useValuesRef, useConstRefFunctions, useHelperFunctionsForIdMapColumns } from './formik'

export const useDeleteRows = () => {
  const { remove: removeRow } = useHelperFunctionsForIdMapColumns()
  const { setRelations } = useConstRefFunctions()

  const reject = (ids: readonly string[]) => {
    setRelations(
      R.evolve({
        [key.marriage]: Mrrgs.reject(ids),
        [key.isParent]: IPs.reject(ids),
        [key.jointAdoption]: JAs.reject(ids),
      })
    )
  }

  const deleteRows = F.flow(R.tap(reject), removeRow)

  return deleteRows
}

// 不要かもしれない
const emptyRow = defaultWebRow()
export const useDeleteData = () => {
  const { setValues } = useConstRefFunctions()
  const valuesRef = useValuesRef()

  const getInitialCols = () => initializeField(key.id)<Row>(emptyRow)(valuesRef.current[COLS])
  const deleteData = () => setValues({ [COLS]: getInitialCols(), [RELS]: initialRels })

  return deleteData
}
