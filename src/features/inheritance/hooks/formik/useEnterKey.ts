/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React from 'react'
import * as R from 'ramda'
import { runKeyHandler, useDependenciesDebugger, log } from 'src/utils/react/hooks'
import { COLS } from 'src/features/inheritance/model'
import { useFieldsRef, useHelperFunctionsForIdMapColumns, useValuesRef } from './formik'
import { Paths } from './useFieldInfoMaker'
import { function as F } from 'fp-ts'
import { setMyDebugMethodToConsole } from 'src/utils/common'
import { doRepetitiveTry } from 'src/utils/fp/common'

setMyDebugMethodToConsole()
console.setKey('useEnterKeyForChangingFocus')

export function useEnterKeyForChangingFocus(path: Paths) {
  const changeFocus = useChangeFocus(path)

  useDependenciesDebugger( { path}, log('useEnterKeyForChangingFocus',''), true) // prettier-ignore
  const handleKeyDown = React.useMemo(
    () =>
      runKeyHandler({
        Enter: F.flow(changeFocus, F.constVoid),
      }),
    [changeFocus]
  )
  return React.useMemo(() => ({ onKeyDown: handleKeyDown }), [handleKeyDown])
}

export function useEnterKeyForChangingFocusAndAddingRow(path: Paths) {
  const changeFocus = useChangeFocus(path)
  const whenLastRowThenAddPerson = useAddAddPersonWhenLastRow(path)

  const handleKeyDown = React.useMemo(
    () =>
      runKeyHandler({
        Enter: F.flow(changeFocus, whenLastRowThenAddPerson),
      }),
    [changeFocus, whenLastRowThenAddPerson]
  )
  return React.useMemo(() => ({ onKeyDown: handleKeyDown }), [handleKeyDown])
}

const useChangeFocus = (path: Paths) => {
  const fieldsRef = useFieldsRef()

  return React.useCallback(
    (event: React.KeyboardEvent) => {
      doRepetitiveTry(() => {
        if (event.shiftKey) {
          fieldsRef.current[path.prev()]?.focus()
          return true
        }
        if (path.next() === path.name) return false
        fieldsRef.current[path.next()]?.focus()
        return true
      })
      return event
    },
    [fieldsRef, path]
  )
}

const useAddAddPersonWhenLastRow = (path: Paths) => {
  const { pushPerson } = useHelperFunctionsForIdMapColumns()
  const valuesRef = useValuesRef()
  const getLastID = React.useCallback(() => R.last(valuesRef.current[COLS].id), [valuesRef])
  return React.useCallback(
    (event: React.KeyboardEvent) => {
      const lastID = getLastID()
      if (lastID && lastID === path?.id && !event.shiftKey) {
        pushPerson()
      }
      return event
    },
    [getLastID, path?.id, pushPerson]
  )
}

// c.f. https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
