import React from 'react'
// import tb from 'ts-toolbelt'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import { function as F, option as O } from 'fp-ts'
import { Arrayify } from 'src/utils/types'
import { setIn, getIn, SetFormikState, FormikState } from 'src/libraries/formik'
import { addRecordToArrayRecord, applyFnToEachField } from 'src/utils/fp/common'

const defaultTo = <Fn>(defaultFanction: Fn): ((fn: Fn | any) => Fn) =>
  R.ifElse(RA.isFunction, R.identity, F.constant(defaultFanction))

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useHelperFunctionsForArrayColumns<
  Row extends Record<string, any>,
  Name extends string
>(
  colName: Name,
  rowShape: Row,
  setFormikState: SetFormikState<Record<Name, Arrayify<Row>>> // 引数にすれば、コンテキストに依存せずに済む
) {
  type Values = Arrayify<Row>
  type FormikValues = Record<Name, Values>

  // helper of ArrayHelpers
  type UpdateFn = (cols: Values) => Values

  const updateArrayField = React.useCallback(
    (fn: UpdateFn, alterTouched: boolean | UpdateFn, alterErrors: boolean | UpdateFn) => {
      setFormikState((prevState) => {
        return {
          ...prevState,
          values: update(prevState.values, updater),
          errors: alterErrors
            ? update(prevState.errors, createSafeUpdater(alterErrors))
            : prevState.errors,
          touched: alterTouched
            ? update(prevState.touched, createSafeUpdater(alterTouched))
            : prevState.touched,
        }
      })

      // helper of helper of ArrayHelpers
      const update = (target: UpdateTarget, updator: (target: UpdateTarget) => any) =>
        setIn(target, colName, updator(target))
      // setIn(target, colName, R.tap((x) => console.log('aaa', x))(updator(target)))

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
    [colName, setFormikState]
  )
  // setFormikState は no deps useCallback を利用。
  // arrayName は通常変化しない。

  const ucb = <T extends (...args: any[]) => any>(cb: T) =>
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useCallback(cb, [cb, updateArrayField])

  const applyToEach = applyFnToEachField(rowShape as Values)

  // ArrayHelpers
  const push = ucb((x: Row) => updateArrayField(addRecordToArrayRecord(rowShape)(x), false, false))
  const remove = ucb((index: number) =>
    updateArrayField(applyToEach(R.remove<any>(index, 1)), true, true)
  )

  return { push, remove }
}
