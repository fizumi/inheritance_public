import isPlainObject from 'lodash/isPlainObject'
import { FormikErrors, FormikValues } from './types'
import { getIn, setIn } from './utils'
import * as yup from 'yup'

/**
 * Transform Yup ValidationError to a more usable object
 */
export function yupToFormErrors<Values>(yupError: unknown): FormikErrors<Values> {
  let errors: FormikErrors<Values> = {}
  if (!(yupError instanceof yup.ValidationError)) {
    console.error('not yup.ValidationError', yupError)
    return errors
  }
  if (yupError?.inner) {
    if (yupError.inner.length === 0 && yupError.path) {
      return setIn(errors, yupError.path, yupError.message)
    }
    for (const err of yupError.inner) {
      if (err.path && !getIn(errors, err.path)) {
        errors = setIn(errors, err.path, err.message)
      }
    }
  }
  return errors
}

/**
 * Validate a yup schema.
 */
export function validateYupSchema<T extends FormikValues>(
  values: T,
  schema: any,
  context: any = {},
  sync = false
): Promise<Partial<T>> {
  const validateData: FormikValues = prepareDataForValidation(values)
  return schema[sync ? 'validateSync' : 'validate'](validateData, {
    abortEarly: false,
    context: context,
  })
}

/**
 * Recursively prepare values.
 *
 * 値が 空文字列「''」だったら undefined にする ?
 */
export function prepareDataForValidation<T extends FormikValues>(values: T): FormikValues {
  const data: FormikValues = Array.isArray(values) ? [] : {}
  for (const k in values) {
    if (Object.prototype.hasOwnProperty.call(values, k)) {
      const key = String(k)
      if (Array.isArray(values[key]) === true) {
        data[key] = values[key].map((value: any) => {
          if (Array.isArray(value) === true || isPlainObject(value)) {
            return prepareDataForValidation(value)
          } else {
            return value !== '' ? value : undefined
          }
        })
      } else if (isPlainObject(values[key])) {
        data[key] = prepareDataForValidation(values[key])
      } else {
        data[key] = values[key] !== '' ? values[key] : undefined
      }
    }
  }
  return data
}
