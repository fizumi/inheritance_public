/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React from 'react'
import { function as F } from 'fp-ts'
import * as R from 'ramda'
import { COLS, Row, compensateRow } from 'src/features/inheritance/model'
import { useConstRefFunctions } from './formik'
import { useHelperFunctionsForIdRecordColumns as useHelperFunctionsForIdRecordColumns_ } from 'src/libraries/formik/useHelperFunctionsForIdRecordColumns'
import { newPerson } from '../../util'

export function useHelperFunctionsForIdMapColumnsBK() {
  const { setFormikState } = useConstRefFunctions()

  const { push, remove, insert } = useHelperFunctionsForIdRecordColumns_<Row, typeof COLS>(
    COLS,
    setFormikState
  )
  const compensatePush = React.useMemo(() => F.flow(compensateRow, R.tap(push)), [push])
  const pushPerson = React.useCallback(() => push(newPerson()), [push])
  const insertPerson = React.useCallback((index: number) => insert(index, newPerson()), [insert])

  return { push, remove, insert, pushPerson, insertPerson, compensatePush }
}
