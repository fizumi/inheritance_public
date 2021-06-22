import { green, lightGreen, grey } from '@material-ui/core/colors'
import { function as F, option as O } from 'fp-ts'
import * as R from 'ramda'
import React from 'react'
import {
  COLS,
  ID,
  IPs,
  Mrrgs,
  RelationKey,
  RID,
  selector,
  WebCol,
} from 'src/features/inheritance/model'
import { memoizeCurriedFn } from 'src/utils/fp/common'
import {
  AutocompleteProps,
  myCreateFilterOptions,
  Pred,
} from 'src/utils/fp/react/components/@material-ui/FreeSoloMultipleAutocomplete'
import { CoreFields } from 'src/features/inheritance/util'
import { useValuesRef } from '../formik'

export type Opt = CoreFields & { display?: string }
export const selectID = (o: Opt) => o.id
export const omitExtra = (o: Opt) => R.omit(['display'], o)

const getOptions = memoizeCurriedFn((cols: WebCol) =>
  cols.id.reduce((acc, id) => R.append({ id, name: cols.name[id] as string }, acc), [] as Opt[])
)

/**
 * option 周りのロジックを整理
 */
export const useOptions = (excludeIDs: ID[] = []) => {
  const valuesRef = useValuesRef()
  const optionsThunk = React.useCallback(() => getOptions(valuesRef.current[COLS]), [valuesRef])

  const notCurId: Pred<Opt> = React.useCallback(
    (option) => !excludeIDs.includes(option.id),
    [excludeIDs]
  )
  const optionsFilter = React.useMemo(() => myCreateFilterOptions([notCurId]), [notCurId])

  const autocompleteOptionProps: Pick<
    AutocompleteProps<Opt>,
    'options' | 'optionSelector' | 'equalOption' | 'idSelector' | 'getOptionLabel'
  > = React.useMemo(
    () => ({
      options: optionsThunk, // ★必須
      optionSelector: (ids) => (option) => R.includes(option.id, ids), // ★必須
      equalOption: (o1) => (o2) => o1.id === o2.id,
      idSelector: (option) => option.id, // ★必須
      getOptionLabel: (option) => option.name,
    }),
    [optionsThunk]
  )

  return { autocompleteOptionProps, optionsFilter }
}

export const useCommonAutocompleteProps = () => {
  return React.useMemo(
    () => ({
      disableClearable: true,
      forcePopupIcon: false,
    }),
    []
  )
}

type CustomizeHook = (id: ID) => {
  getOptionDisabled: undefined | ((o: Opt) => boolean)
  switchColor: (theOtherID: string) => React.CSSProperties
  individualProps: {
    disableResetOnSelect?: boolean
  }
}
export const useCustomizeRelAutocomplete = <K extends RelationKey>(key: K): CustomizeHook => {
  return key === 'isParent' ? useCustomizeForIsParent : useCustomizeForSpouse
}
const useCustomizeForIsParent = (id: ID) => {
  const valuesRef = useValuesRef()
  const getOptionDisabled = React.useMemo(
    () =>
      F.flow(
        selectID,
        (idFromOption) =>
          IPs.safeGetWithIndex(id, idFromOption)(selector.isParent(valuesRef.current)),
        O.map(([relID]) => {
          return RID.getDst(relID) === id // 親を子として設定しないようにする
          // return false // 親を子として設定しないようにする
        }),
        O.getOrElse(() => false)
      ),
    [id, valuesRef]
  )
  const switchColor: (theOtherID: string) => React.CSSProperties = React.useCallback(
    (theOtherID) =>
      F.pipe(
        IPs.safeGet(theOtherID, id)(selector.isParent(valuesRef.current)),
        O.map((r) => {
          return r.type === '養親子'
            ? { backgroundColor: lightGreen['100'] }
            : r.type === '特別養親子'
            ? { backgroundColor: green['100'] }
            : {}
        }),
        O.getOrElse(() => ({}))
      ),
    [id, valuesRef]
  )

  return {
    getOptionDisabled,
    switchColor,
    individualProps: React.useMemo(() => ({ disableResetOnSelect: true }), []),
  }
}
const useCustomizeForSpouse = (id: ID) => {
  const valuesRef = useValuesRef()
  const switchColor: (theOtherID: string) => React.CSSProperties = React.useCallback(
    (theOtherID) =>
      F.pipe(
        Mrrgs.safeGet(theOtherID, id)(selector.marriage(valuesRef.current)),
        O.map((r) => {
          return r.endDate ? { backgroundColor: grey['200'], color: grey['500'] } : {}
        }),
        O.getOrElse(() => ({}))
      ),
    [id, valuesRef]
  )
  return {
    getOptionDisabled: undefined,
    switchColor,
    individualProps: React.useMemo(() => ({ disableResetOnSelect: true }), []),
  }
}
