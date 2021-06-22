/* eslint-disable @typescript-eslint/ban-types */
import { function as F, option as O } from 'fp-ts'
// import tb from 'ts-toolbelt'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import React from 'react'
import { FormikState, getIn, SetFormikState, setIn } from 'src/libraries/formik'
import {
  UniqueRecord,
  GetIDArrayAndIDMapRecord,
  append,
  remove as remove_,
  insert as insert_,
  ID,
} from 'src/utils/fp/common/idMap'

const defaultTo = <Fn>(defaultFanction: Fn): ((fn: Fn | any) => Fn) =>
  R.ifElse(RA.isFunction, R.identity, F.constant(defaultFanction))

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useHelperFunctionsForIdRecordColumns<
  Row extends UniqueRecord<IDKey, string>,
  Name extends string,
  IDKey extends string = 'id'
>(
  colName: Name,
  setFormikState: any, // 引数にすれば、 React Context に依存せずに済む
  idKey?: IDKey
) {
  const idkey = R.defaultTo('id', idKey) as IDKey
  const setFormikState_ = setFormikState as SetFormikState<
    { [K in Name]: GetIDArrayAndIDMapRecord<Row, IDKey> }
  >

  type Values = GetIDArrayAndIDMapRecord<Row, IDKey>
  type FormikValues = Record<Name, Values>

  // helper of HelperFunctions
  type UpdateFn = (cols: Values) => Values

  const updateArrayField = React.useCallback(
    (fn: UpdateFn, alterTouched: boolean | UpdateFn, alterErrors: boolean | UpdateFn) => {
      setFormikState_((prevState) => {
        return {
          ...prevState,
          values: update(prevState.values, updater),
          errors: alterErrors
            ? update(prevState.errors, createSafeUpdater(alterErrors))
            : prevState.errors,
          touched: alterTouched
            ? update(prevState.touched, createSafeUpdater(alterTouched))
            : prevState.touched,
          // TODO fieldsRef にも同様の仕組みを与える (+ unmount で削除するのは辞める) fieldsRef は 引数で受け取る
        }
      })

      // helper of helper of HelperFunctions
      const update = (target: UpdateTarget, updator: (target: UpdateTarget) => any) =>
        setIn(target, colName, updator(target))

      const updater = (target: UpdateTarget) => fn(getIn(target, colName) as Values)

      const createSafeUpdater = (alterFn: boolean | UpdateFn) => {
        const updater = defaultTo(fn)(alterFn)
        return (target: UpdateTarget) =>
          F.pipe(
            O.fromNullable(getIn(target, colName) as Values | undefined),
            O.map(updater),
            O.getOrElse<undefined | Values>(F.constant(undefined))
          )
      }
      type State = FormikState<FormikValues>
      type UpdateTarget = State['values'] | State['errors'] | State['touched']
    },
    [colName, setFormikState_]
  )
  // setFormikState は no deps useCallback を利用。
  // arrayName は通常変化しない。

  // HelperFunctions
  const push = React.useCallback(
    (x: Row) => updateArrayField(append(idkey)(x), false, false),
    [idkey, updateArrayField]
  )

  const insert = React.useCallback(
    (i: number, x: Row) => updateArrayField(insert_(idkey)(i)(x), false, false),
    [idkey, updateArrayField]
  )

  const remove = React.useCallback(
    (id: ID | readonly ID[]) => updateArrayField(remove_(idkey)(id) as any, true, true),
    [idkey, updateArrayField]
  )

  return { push, remove, remove_, insert }
}
