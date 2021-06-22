/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { either as E, function as F } from 'fp-ts'
import * as R from 'ramda'
import React from 'react'
import { GetEachReturn, InvertObj, invertToNumberValueObj } from 'src/utils/types'
import {
  AllFieldKeys,
  allFieldKeys,
  COLS,
  compensateRow,
  key,
  RelationKey,
  relationKeys,
  RelationStore,
  RELS,
  Row,
} from 'src/features/inheritance/model'
import constate from 'src/libraries/constate'
import { MyFormikConfig, useMyFormik } from 'src/libraries/formik'
import { useHelperFunctionsForIdRecordColumns as useHelperFunctionsForIdRecordColumns_ } from 'src/libraries/formik/useHelperFunctionsForIdRecordColumns'
import { useHistory } from 'src/utils/react/hooks'
import useLocalStorage from 'src/utils/fp/react/hooks/useLocalStorage'
import tb from 'ts-toolbelt'
import { newPerson } from '../../util'
import { ErrorOfAFieald, MyFormikValues, TouchedOfAFieald } from './types'
import { safeValidateSyncBeforeLoad } from 'src/features/inheritance/validation/beforeLoad'
// -------------------------------------------------------------------------------------------------
// formik wrapper
// -------------------------------------------------------------------------------------------------
function useInheritanceFormik(props: MyFormikConfig<MyFormikValues>) {
  /*
      FORMIK BAG
  */
  const {
    state,
    values,
    errors: errors_,
    touched: touched_,
    status: _s,
    focus,
    initialValues,
    initialErrors,
    initialTouched,
    initialStatus,
    handleBlur,
    handleChange,
    handleReset,
    handleSubmit,
    handleFocus,
    resetForm,
    setErrors,
    setFocus,
    setFormikState,
    setFieldTouched,
    setFieldValue,
    setFieldError,
    setStatus: _ss,
    setSubmitting,
    setTouched,
    setValues,
    submitForm,
    validateForm,
    validateField,
    isValid,
    dirty,
    unregisterField,
    registerField,
    getMyFieldProps,
    getFieldProps,
    getFieldMeta,
    getFieldHelpers,
    validateOnBlur,
    validateOnChange,
    validateOnMount,
    fieldsRef,
    formikStateRef,
    valuesRef,
    createRegisterInputRef,
    unregisterInputRef,
    validateValue,
    createSetFieldAction,
  } = useMyFormik<MyFormikValues>(props)

  /*
      LOCAL STORAGE
  */
  useLocalStorage({
    key: 'useInheritanceFormik',
    value: values,
    validator: safeValidateSyncBeforeLoad,
    setValue: setValues,
    option: {
      removeWhen: (value) => value[COLS].id.length === 0,
      onGetItemError: (e) => {
        e instanceof Error ? 'load error' : console.error('validation error', e)
      },
    },
  })

  /*
      HELPER
  */
  const setStates = React.useMemo(
    () => ({
      setColumns: createSetFieldAction([COLS] as const),
      setRelations: createSetFieldAction([RELS] as const),
      setPnCRels: createSetFieldAction([RELS, key.isParent] as const),
      setMarriageRels: createSetFieldAction([RELS, key.marriage] as const),
      setJointAdoptionRels: createSetFieldAction([RELS, key.jointAdoption] as const),
    }),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  )

  /*
      COLUMNS HELPER
  */
  const { push, remove, insert } = useHelperFunctionsForIdRecordColumns_<Row, typeof COLS>(
    COLS,
    setFormikState
  )
  const compensatePush = React.useMemo(() => F.flow(compensateRow, R.tap(push)), [push])
  const pushPerson = React.useCallback(() => push(newPerson()), [push])
  const insertPerson = React.useCallback((index: number) => insert(index, newPerson()), [insert])
  const columnsHelpers = React.useMemo(() => {
    return { push, remove, insert, pushPerson, insertPerson, compensatePush }
  }, [compensatePush, insert, insertPerson, push, pushPerson, remove])

  // データが 0 の場合, 空行を追加
  const dataIsZero = (s: typeof values) => s[COLS].id.length === 0
  if (dataIsZero(values)) pushPerson()

  /*
      HISTORY
  */
  const { redo, undo } = useHistory(values, setValues, { skipWhen: dataIsZero })

  /*
      MEMO
  */
  const fieldMethods = React.useMemo(
    () => ({
      unregisterField,
      registerField,
      getMyFieldProps,
      getFieldHelpers,
      unregisterInputRef,
      validateValue,
    }),
    [
      getFieldHelpers,
      getMyFieldProps,
      registerField,
      unregisterField,
      unregisterInputRef,
      validateValue,
    ]
  )
  const constRefFunctions = React.useMemo(
    () => ({
      resetForm,
      validateForm,
      validateField,
      setErrors,
      setFocus,
      setFieldError,
      setFieldTouched,
      setFieldValue,
      setSubmitting,
      setTouched,
      setValues,
      ...setStates,
      setFormikState,
      submitForm,
      redo,
      undo,
      createRegisterInputRef,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resetForm] // ref の 変更がない関数のみ使用するため exhaustive-deps を省略
    // resetForm は props.initial~~ 変更時のみ re-render される
    // ※ constRefFunctions は 参照が変わらない関数群なので, constRefFunctions に加えるものをメモ化する必要はない
  )

  // useDependenciesDebugger( {...values[COLS],...values[RELS] }, log('useInheritanceFormik', 'formik.ts'), true) // prettier-ignore
  return {
    state,
    values,
    errors: errors_ as any,
    touched: touched_ as any,
    fieldsRef,
    focus,
    formikStateRef,
    valuesRef,
    fieldMethods,
    columnsHelpers,
    constRefFunctions,
  }
}

// -------------------------------------------------------------------------------------------------
// create context
// -------------------------------------------------------------------------------------------------
export const [
  MyFormikProvider,
  // ref
  useFormikStateRef,
  useValuesRef,
  useFieldsRef,
  // functions
  useConstRefFunctions,
  useFieldMethods,
  useHelperFunctionsForIdMapColumns,
  // state
  useFocusedPath,
  useFormikState,
  useValues,
  useCols,
  ...useFormikStates
] = constate(
  useInheritanceFormik,
  // ref
  (bag) => bag.formikStateRef,
  (bag) => bag.valuesRef,
  (bag) => bag.fieldsRef,
  // functions
  (bag) => bag.constRefFunctions,
  (bag) => bag.fieldMethods,
  (bag) => bag.columnsHelpers,
  // state
  (bag) => bag.focus,
  (bag) => bag.state,
  (bag) => bag.values,
  (bag) => bag.values[COLS],
  //
  // -- useFormikState --
  (bag) => bag.values[RELS].isParent,
  (bag) => bag.values[RELS].marriage,
  (bag) => bag.values[RELS].jointAdoption,
  // -- values
  (bag) => bag.values[COLS].id,
  (bag) => bag.values[COLS].name,
  (bag) => bag.values[COLS].deathDate,
  (bag) => bag.values[COLS].portionOfInheritance,
  (bag) => bag.values[COLS].isAlive,
  (bag) => bag.values[COLS]['pseudoParents'],
  (bag) => bag.values[COLS]['pseudoSpouses'],
  // -- touched
  (bag) => bag.touched[COLS]?.id as (undefined | boolean)[], // 使わない
  (bag) => bag.touched[COLS]?.name as TouchedOfAFieald,
  (bag) => bag.touched[COLS]?.deathDate as TouchedOfAFieald,
  (bag) => bag.touched[COLS]?.portionOfInheritance as TouchedOfAFieald,
  (bag) => bag.touched[COLS]?.isAlive as TouchedOfAFieald, // 使わない
  (bag) => bag.touched[COLS]?.['pseudoParents'] as TouchedOfAFieald,
  (bag) => bag.touched[COLS]?.['pseudoSpouses'] as TouchedOfAFieald,
  // -- errors
  (bag) => bag.errors[COLS]?.id as (undefined | string)[], // 使わない
  (bag) => bag.errors[COLS]?.name as ErrorOfAFieald,
  (bag) => bag.errors[COLS]?.deathDate as ErrorOfAFieald,
  (bag) => bag.errors[COLS]?.portionOfInheritance as ErrorOfAFieald,
  (bag) => bag.errors[COLS]?.isAlive as ErrorOfAFieald, // 使わない
  (bag) => bag.errors[COLS]?.['pseudoParents'] as ErrorOfAFieald,
  (bag) => bag.errors[COLS]?.['pseudoSpouses'] as ErrorOfAFieald
)

// -------------------------------------------------------------------------------------------------
// type utils
// -------------------------------------------------------------------------------------------------
const len = allFieldKeys.length
type Key2idx = InvertObj<typeof allFieldKeys>
const key2idx = invertToNumberValueObj(allFieldKeys)

const relLen = relationKeys.length
type RKey2idx = InvertObj<typeof relationKeys>
const rkey2idx = invertToNumberValueObj(relationKeys)

type UseFormikState = typeof useFormikStates

type Len = tb.N.NumberOf<typeof len>
type RLen = tb.N.NumberOf<typeof relLen>
type Len2 = tb.N.Plus<RLen, Len>
type Len3 = tb.N.Plus<Len2, Len>

type UseFormikStateObj = tb.L.ObjectOf<UseFormikState>
type Idx2RetType = GetEachReturn<UseFormikStateObj>

export type GetRels<Key extends RelationKey> = Idx2RetType[RKey2idx[Key]]
export type GetValue<Key extends AllFieldKeys> = Idx2RetType[tb.N.Plus<Key2idx[Key], RLen>]
type GetTouched<Key extends AllFieldKeys> = Idx2RetType[tb.N.Plus<Key2idx[Key], Len2>]
type GetError<Key extends AllFieldKeys> = Idx2RetType[tb.N.Plus<Key2idx[Key], Len3>]
type _sample_value_pnc = GetRels<'isParent'>
type _sample_value_id = GetValue<'id'>
type _sample_value_name = GetValue<'name'>
type _sample_value_p = GetValue<'pseudoParents'>
type _sample_value_isAlive = GetValue<'isAlive'>
type _sample_touch_id = GetTouched<'id'>
type _sample_touch_pseudoParents = GetTouched<'pseudoParents'>
type _sample_touch_isAlive = GetTouched<'isAlive'>
type _sample_error_isAlive = GetError<'isAlive'>

// -------------------------------------------------------------------------------------------------
// thin wrappers
// -------------------------------------------------------------------------------------------------
export function useRels<Key extends RelationKey>(key: Key) {
  return useFormikStates[rkey2idx[key]]?.() as GetRels<Key>
}

export const useColumn = <Key extends AllFieldKeys>(key: Key): GetValue<Key> => {
  const useHook = useFormikStates[key2idx[key] + relLen]
  return useHook?.() as any
}

/**
 * `Excessive stack depth comparing types` 対策
 */
export const _useColumn = <Key extends AllFieldKeys>(key: Key): any => {
  const useHook = useFormikStates[key2idx[key] + relLen]
  return useHook?.() as any
}

export const useTouched = <Key extends AllFieldKeys>(key: Key): GetTouched<Key> | undefined => {
  return useFormikStates[key2idx[key] + relLen + len]?.() as GetTouched<Key>
}

export const useError = <Key extends AllFieldKeys>(key: Key): GetError<Key> | undefined => {
  return useFormikStates[key2idx[key] + relLen + len + len]?.() as GetError<Key>
}

export function useSetColumn<Key extends AllFieldKeys>(fieldName: Key) {
  const { setFieldValue } = useConstRefFunctions()
  const setColumn = React.useCallback(
    (value: GetValue<Key>, shouldValidate?: boolean) =>
      setFieldValue(`${COLS}.${fieldName}`, value, shouldValidate),
    [fieldName, setFieldValue]
  )
  return setColumn
}

export function useSetRels<Key extends RelationKey>(fieldName: Key) {
  const { setFieldValue } = useConstRefFunctions()
  const setRels = React.useCallback(
    (value: RelationStore[Key], shouldValidate?: boolean) =>
      setFieldValue(`${RELS}.${fieldName}`, value, shouldValidate),
    [fieldName, setFieldValue]
  )
  return setRels
}
