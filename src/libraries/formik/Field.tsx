import * as React from 'react'
import {
  FormikProps,
  GenericFieldHTMLAttributes,
  FieldMetaProps,
  FieldHelperProps,
  FieldInputProps,
  FieldValidator,
} from './types'
import { useFormikContext } from './FormikContext'
import { isFunction, isEmptyChildren, isObject } from './utils'
import invariant from 'tiny-warning'
import { __DEV__ } from 'src/utils/common'

export interface FieldProps<V = any, FormValues = any> {
  field: FieldInputProps<V>
  form: FormikProps<FormValues> // if ppl want to restrict this for a given form, let them.
  meta: FieldMetaProps<V>
}

export interface FieldConfig<V = any> {
  /**
   * Field component to render. Can either be a string like 'select' or a component.
   */
  component?:
    | string
    | React.ComponentType<FieldProps<V>>
    | React.ComponentType
    | React.ForwardRefExoticComponent<any>

  /**
   * Component to render. Can either be a string e.g. 'select', 'input', or 'textarea', or a component.
   */
  as?:
    | React.ComponentType<FieldProps<V>['field']>
    | string
    | React.ComponentType
    | React.ForwardRefExoticComponent<any>

  /**
   * Render prop (works like React router's <Route render={props =>} />)
   * @deprecated
   */
  render?: (props: FieldProps<V>) => React.ReactNode

  /**
   * Children render function <Field name>{props => ...}</Field>)
   */
  children?: ((props: FieldProps<V>) => React.ReactNode) | React.ReactNode

  /**
   * Validate a single field value independently
   */
  validate?: FieldValidator

  /**
   * Field name
   */
  name: string

  /** HTML input type */
  type?: string

  /** Field value */
  value?: any

  /** Inner ref */
  innerRef?: (instance: any) => void
}

export type FieldAttributes<T> = GenericFieldHTMLAttributes & FieldConfig<T> & T & { name: string }

export type FieldHookConfig<T> = GenericFieldHTMLAttributes & FieldConfig<T>

export function useField<Val = any>(
  propsOrFieldName: string | FieldHookConfig<Val>
): [FieldInputProps<Val>, FieldMetaProps<Val>, FieldHelperProps<Val>] {
  const formik = useFormikContext()
  const { getFieldProps, getFieldMeta, getFieldHelpers, registerField, unregisterField } = formik

  const isAnObject = isObject(propsOrFieldName)

  // Normalize propsOrFieldName to FieldHookConfig<Val>
  const props: FieldHookConfig<Val> = isAnObject
    ? (propsOrFieldName as FieldHookConfig<Val>)
    : { name: propsOrFieldName as string }

  const { name: fieldName, validate: validateFn } = props

  React.useEffect(() => {
    if (fieldName) {
      registerField(fieldName, {
        validate: validateFn,
      })
    }
    return () => {
      if (fieldName) {
        unregisterField(fieldName)
      }
    }
  }, [registerField, unregisterField, fieldName, validateFn])

  if (__DEV__) {
    invariant(
      formik,
      'useField() / <Field /> must be used underneath a <Formik> component or withFormik() higher order component'
    )
  }

  invariant(
    fieldName,
    'Invalid field name. Either pass `useField` a string or an object containing a `name` key.'
  )

  return [getFieldProps(props), getFieldMeta(fieldName), getFieldHelpers(fieldName)]
}
