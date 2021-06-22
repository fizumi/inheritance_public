/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
/* eslint-disable no-extra-semi */
import deepmerge from 'deepmerge'
import * as React from 'react'
import isEqual from 'react-fast-compare'
import { FormikErrors, FormikState, FormikTouched } from './types'
import { setIn, setNestedObjectValues } from './utils'

export type FormikMessage<Values> =
  | { type: 'SUBMIT_ATTEMPT' }
  | { type: 'SUBMIT_FAILURE' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SET_ISVALIDATING'; payload: boolean }
  | { type: 'SET_ISSUBMITTING'; payload: boolean }
  | { type: 'SET_VALUES'; payload: Values }
  | { type: 'SET_FIELD_VALUE'; payload: { field: string; value?: any } }
  | { type: 'SET_FIELD_TOUCHED'; payload: { field: string; value?: boolean } }
  | { type: 'SET_FIELD_ERROR'; payload: { field: string; value?: string } }
  | { type: 'SET_TOUCHED'; payload: FormikTouched<Values> }
  | { type: 'SET_ERRORS'; payload: FormikErrors<Values> }
  | { type: 'SET_STATUS'; payload: any }
  | { type: 'SET_FOCUS'; payload?: string }
  | {
      type: 'SET_FORMIK_STATE'
      payload: (s: FormikState<Values>) => FormikState<Values>
    }
  | {
      type: 'RESET_FORM'
      payload: FormikState<Values>
    }

// State reducer
export function formikReducer<Values>(state: FormikState<Values>, msg: FormikMessage<Values>) {
  // console.log('formikReducer', msg)
  switch (msg.type) {
    case 'SET_VALUES':
      return { ...state, values: msg.payload }
    case 'SET_TOUCHED':
      return { ...state, touched: msg.payload }
    case 'SET_ERRORS':
      if (isEqual(state.errors, msg.payload)) {
        return state
      }

      return { ...state, errors: msg.payload }
    case 'SET_STATUS':
      return { ...state, status: msg.payload }
    case 'SET_FOCUS':
      return { ...state, focus: msg.payload }
    case 'SET_ISSUBMITTING':
      return { ...state, isSubmitting: msg.payload }
    case 'SET_ISVALIDATING':
      return { ...state, isValidating: msg.payload }
    case 'SET_FIELD_VALUE':
      // console.log('SET_FIELD_VALUE', state, msg)
      return {
        ...state,
        values: setIn(state.values, msg.payload.field, msg.payload.value),
      }
    case 'SET_FIELD_TOUCHED':
      return {
        ...state,
        focus: undefined,
        touched: setIn(state.touched, msg.payload.field, msg.payload.value),
      }
    case 'SET_FIELD_ERROR':
      return {
        ...state,
        errors: setIn(state.errors, msg.payload.field, msg.payload.value),
      }
    case 'RESET_FORM':
      return { ...state, ...msg.payload }
    case 'SET_FORMIK_STATE':
      return msg.payload(state)
    case 'SUBMIT_ATTEMPT':
      return {
        ...state,
        touched: setNestedObjectValues<FormikTouched<Values>>(state.values, true),
        isSubmitting: true,
        submitCount: state.submitCount + 1,
      }
    case 'SUBMIT_FAILURE':
      return {
        ...state,
        isSubmitting: false,
      }
    case 'SUBMIT_SUCCESS':
      return {
        ...state,
        isSubmitting: false,
      }
    default:
      return state
  }
}

// Initial empty states // objects
export const emptyErrors: FormikErrors<unknown> = {}
export const emptyTouched: FormikTouched<unknown> = {}

export const fieldCache = Symbol('field value cache')
// This is an object that contains a map of all registered fields
// and their validate functions
export interface FieldRegistry {
  [field: string]: {
    validate: (value: any) => string | Promise<string> | undefined
  }
  [fieldCache]: {
    [field: string]: any
  }
}

export function warnAboutMissingIdentifier({
  htmlContent,
  documentationAnchorLink,
  handlerName,
}: {
  htmlContent: string
  documentationAnchorLink: string
  handlerName: string
}) {
  console.warn(
    `Warning: Formik called \`${handlerName}\`, but you forgot to pass an \`id\` or \`name\` attribute to your input:
    ${htmlContent}
    Formik cannot determine which value to update. For more info see https://github.com/jaredpalmer/formik#${documentationAnchorLink}
  `
  )
}

/**
 * deepmerge array merging algorithm
 * https://github.com/KyleAMathews/deepmerge#combine-array
 */
export function arrayMerge(target: any[], source: any[], options: any): any[] {
  const destination = target.slice()

  source.forEach(function merge(e: any, i: number) {
    if (typeof destination[i] === 'undefined') {
      const cloneRequested = options.clone !== false
      const shouldClone = cloneRequested && options.isMergeableObject(e)
      destination[i] = shouldClone ? deepmerge((Array.isArray(e) ? [] : {}) as any, e, options) : e
    } else if (options.isMergeableObject(e)) {
      destination[i] = deepmerge(target[i], e, options)
    } else if (target.indexOf(e) === -1) {
      destination.push(e)
    }
  })
  return destination
}

/** Return multi select values based on an array of options */
export function getSelectedValues(options: any[]) {
  return Array.from(options)
    .filter((el) => el.selected)
    .map((el) => el.value)
}

/** Return the next value for a checkbox */
export function getValueForCheckbox(
  currentValue: string | any[],
  checked: boolean,
  valueProp: any
) {
  // If the current value was a boolean, return a boolean
  if (typeof currentValue === 'boolean') {
    return Boolean(checked)
  }

  // If the currentValue was not a boolean we want to return an array
  let currentArrayOfValues = []
  let isValueInArray = false
  let index = -1

  if (!Array.isArray(currentValue)) {
    // eslint-disable-next-line eqeqeq
    if (!valueProp || valueProp == 'true' || valueProp == 'false') {
      return Boolean(checked)
    }
  } else {
    // If the current value is already an array, use it
    currentArrayOfValues = currentValue
    index = currentValue.indexOf(valueProp)
    isValueInArray = index >= 0
  }

  // If the checkbox was checked and the value is not already present in the aray we want to add the new value to the array of values
  if (checked && valueProp && !isValueInArray) {
    return currentArrayOfValues.concat(valueProp)
  }

  // If the checkbox was unchecked and the value is not in the array, simply return the already existing array of values
  if (!isValueInArray) {
    return currentArrayOfValues
  }

  // If the checkbox was unchecked and the value is in the array, remove the value and return the array
  return currentArrayOfValues.slice(0, index).concat(currentArrayOfValues.slice(index + 1))
}

// React currently throws a warning when using useLayoutEffect on the server.
// To get around it, we can conditionally useEffect on the server (no-op) and
// useLayoutEffect in the browser.
// @see https://gist.github.com/gaearon/e7d97cdf38a2907924ea12e4ebdf3c85
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof window.document.createElement !== 'undefined'
    ? React.useLayoutEffect
    : React.useEffect
