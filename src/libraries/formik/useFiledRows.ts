import React from 'react'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import { function as F, option as O } from 'fp-ts'
import { setIn, getIn, SetFormikState, FormikState } from 'src/libraries/formik'

const defaultTo = <Fn>(fn: Fn) =>
  R.ifElse(RA.isFunction, R.identity, F.constant(fn)) as (alter: Fn | boolean) => Fn

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useFieldRows = <Row extends Record<string, any>>(
  rowName: string,
  setFormikState: SetFormikState<Record<typeof rowName, Row[]>>
) => {
  type Values = Row[]
  type FormikValues = Record<typeof rowName, Values>

  // helper of ArrayHelpers
  type UpdateFn = (x: Row[]) => Row[]

  const updateArrayField = React.useCallback(
    (fn: UpdateFn, alterTouched: boolean | UpdateFn, alterErrors: boolean | UpdateFn) => {
      setFormikState((prevState) => {
        const updater = (target: UpdateTarget) => fn(getIn(target, rowName))
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
        setIn(target, rowName, updator(target))

      const createSafeUpdater = (alter: boolean | UpdateFn) => {
        const updater = defaultTo(fn)(alter)
        return (target: UpdateTarget) =>
          F.pipe(
            O.fromNullable(getIn(target, rowName) as Row[] | undefined),
            O.chain(O.fromPredicate(Array.isArray)),
            O.map(updater),
            O.chain(O.fromPredicate<Row[]>(RA.isNotEmpty)),
            O.getOrElse<Row[]>(F.constant([]))
          )
      }
      type State = FormikState<FormikValues>
      type UpdateTarget = State['values'] | State['errors'] | State['touched']
    },
    // setFormikState は no deps useCallback を利用。
    // arrayName は通常変化しない。
    [rowName, setFormikState]
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const ucb = (cb: (...args: any[]) => any) => React.useCallback(cb, [cb, updateArrayField])

  // ArrayHelpers
  const push = ucb((x: Values) => updateArrayField(R.append(x), false, false))
  const remove = ucb((index: number) => updateArrayField(R.remove(index, 1), true, true))

  return { push, remove }
}
