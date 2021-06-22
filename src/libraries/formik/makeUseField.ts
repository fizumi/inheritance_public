import * as React from 'react'
// import tb from 'ts-toolbelt'
import { __DEV__ } from 'src/utils/common'
import invariant from 'tiny-warning'
import { FieldHookConfig } from './Field'
import { FieldHelperProps, FieldInputProps, FieldMetaProps } from './types'
import { isObject } from './utils'
import { FormikBag } from 'src/libraries/formik'

export const makeUseField = <Values, Other = any>(
  context: React.Context<{ formik?: FormikBag<Values>; [x: string]: any }>
) => {
  const useField = <Val = any>(
    propsOrFieldName: string | FieldHookConfig<Val>
  ): [FieldInputProps<Val>, FieldMetaProps<Val>, FieldHelperProps<Val>, FormikBag<Values>] => {
    const { formik } = React.useContext(context)
    if (formik === undefined) throw Error('formik is must')
    const { getFieldProps, getFieldMeta, getFieldHelpers, registerField, unregisterField } = formik

    const isAnObject = isObject(propsOrFieldName)

    // Normalize propsOrFieldName to FieldHookConfig<Val>
    const props: FieldHookConfig<Val> = isAnObject
      ? (propsOrFieldName as FieldHookConfig<Val>)
      : { name: propsOrFieldName as string }

    const { name: fieldName, validate: validateFn } = props

    React.useEffect(() => {
      if (!validateFn || !fieldName) return

      registerField(fieldName, {
        validate: validateFn,
      })
      return () => {
        unregisterField(fieldName)
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

    return [getFieldProps(props), getFieldMeta(fieldName), getFieldHelpers(fieldName), formik]
  }
  const useOther = <T = Omit<Other, 'formik'>>() => {
    const { formik: _, ...other } = React.useContext(context)
    return other as T
  }

  return [useField, useOther] as const
}
