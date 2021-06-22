import React from 'react'
import isEqual from 'react-fast-compare'
import { emptyErrors, emptyTouched } from './Formik'
import { FormikErrors, FormikTouched } from './types'

export function useReInitialize(
  enableReinitialize: any,
  isMounted: { current: boolean },
  props: {
    initialErrors?: FormikErrors<any>
    initialTouched?: FormikTouched<any>
    initialStatus?: any
  },
  initialErrors: { current: any },
  initialTouched: { current: any },
  initialStatus: { current: any },
  dispatch: (arg0: { type: any; payload: any }) => void
) {
  React.useEffect(() => {
    if (
      enableReinitialize &&
      isMounted.current === true &&
      !isEqual(initialErrors.current, props.initialErrors)
    ) {
      initialErrors.current = props.initialErrors || emptyErrors
      dispatch({
        type: 'SET_ERRORS',
        payload: props.initialErrors || emptyErrors,
      })
    }
  }, [enableReinitialize, props.initialErrors]) // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (
      enableReinitialize &&
      isMounted.current === true &&
      !isEqual(initialTouched.current, props.initialTouched)
    ) {
      initialTouched.current = props.initialTouched || emptyTouched
      dispatch({
        type: 'SET_TOUCHED',
        payload: props.initialTouched || emptyTouched,
      })
    }
  }, [enableReinitialize, props.initialTouched]) // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (
      enableReinitialize &&
      isMounted.current === true &&
      !isEqual(initialStatus.current, props.initialStatus)
    ) {
      initialStatus.current = props.initialStatus
      dispatch({
        type: 'SET_STATUS',
        payload: props.initialStatus,
      })
    }
  }, [enableReinitialize, props.initialStatus, props.initialTouched]) // eslint-disable-line react-hooks/exhaustive-deps
}
