/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
/* eslint-disable no-extra-semi */
import * as React from 'react'
import isEqual from 'react-fast-compare'
import deepmerge from 'deepmerge'
import {
  FormikConfig,
  FormikErrors,
  FormikState,
  FormikTouched,
  FormikValues,
  FieldMetaProps,
  FieldHelperProps,
  FieldInputProps,
  FormikHelpers,
  FormikHandlers,
  FormikProps,
} from './types'
import { isFunction, isString, setIn, isPromise, getActiveElement, getIn, isObject } from './utils'
import invariant from 'tiny-warning'
import {
  arrayMerge,
  emptyErrors,
  emptyTouched,
  FieldRegistry,
  FormikMessage,
  formikReducer,
  getSelectedValues,
  getValueForCheckbox,
  warnAboutMissingIdentifier,
  fieldCache,
} from './Formik'
import { validateYupSchema, yupToFormErrors } from './yup'
import { useEventCallback } from '@material-ui/core'
import { FieldElement } from '../react-hook-form/types/fields'
import { FieldHookConfig } from './Field'
import { __DEV__, setMyDebugMethodToConsole } from 'src/utils/common'
import { memoizeCurriedFn } from 'src/utils/fp/common'
import { useReInitialize } from './useReInitialize'
import useMemoize, { identity } from 'src/utils/fp/react/hooks/useMemoize'

import tb from 'ts-toolbelt'
import * as R from 'ramda'

setMyDebugMethodToConsole()
const _debug = 'useMyFormik.tsx'
// console.setKey(_debug)

type WhatIadded<Values> = {
  fieldsRef: React.MutableRefObject<FormikValues>
  valuesRef: React.MutableRefObject<Values>
  formikStateRef: React.MutableRefObject<Values>
}
type MyAdditionalProps = {
  contextThunk?: () => any
  // sync?: boolean // sync は error を throw するので, try catch を実装する必要がある
  disableIsValidating?: boolean
}

export type MyFormikContextType<Values> = FormikProps<Values> &
  Pick<FormikConfig<Values>, 'validate' | 'validationSchema'> &
  WhatIadded<Values>

export type MyFormikConfig<Values> = FormikConfig<Values> & MyAdditionalProps

export type { FieldHookConfig }

export type SetFormikState<Values = FormikValues> = (
  stateOrCb: FormikState<Values> | ((state: FormikState<Values>) => FormikState<Values>)
) => void

export function useMyFormik<Values extends FormikValues = FormikValues>({
  validateOnChange = true,
  validateOnBlur = true,
  validateOnMount = false,
  enableReinitialize = false,
  disableIsValidating = false,
  onSubmit,
  ...rest
}: MyFormikConfig<Values>) {
  const props = {
    validateOnChange,
    validateOnBlur,
    validateOnMount,
    onSubmit,
    ...rest,
  }
  const initialValues = React.useRef(props.initialValues)
  const initialErrors = React.useRef(props.initialErrors || emptyErrors)
  const initialTouched = React.useRef(props.initialTouched || emptyTouched)
  const initialStatus = React.useRef(props.initialStatus)
  const isMounted = React.useRef<boolean>(false)
  const fieldRegistry = React.useRef<FieldRegistry>({ [fieldCache]: {} })
  const fieldsRef = React.useRef<FormikValues>({})
  const valuesRef = React.useRef<Values>(props.initialValues)

  React.useEffect(() => {
    isMounted.current = true

    return () => {
      isMounted.current = false
    }
  }, [])

  const [state, dispatch] = React.useReducer<
    React.Reducer<FormikState<Values>, FormikMessage<Values>>
  >(formikReducer, {
    values: props.initialValues,
    errors: props.initialErrors || emptyErrors,
    touched: props.initialTouched || emptyTouched,
    status: props.initialStatus,
    isSubmitting: false,
    isValidating: false,
    submitCount: 0,
  })
  const formikStateRef = React.useRef<FormikState<Values>>(state)
  formikStateRef.current = state
  valuesRef.current = state.values

  const runValidateHandler = React.useCallback(
    (values: Values, field?: string): Promise<FormikErrors<Values>> => {
      return new Promise((resolve, reject) => {
        const maybePromisedErrors = (props.validate as any)(values, field)
        if (maybePromisedErrors == null) {
          // use loose null check here on purpose
          resolve(emptyErrors)
        } else if (isPromise(maybePromisedErrors)) {
          ;(maybePromisedErrors as Promise<any>).then(
            (errors) => {
              resolve(errors || emptyErrors)
            },
            (actualException) => {
              if (process.env.NODE_ENV !== 'production') {
                console.warn(
                  `Warning: An unhandled error was caught during validation in <Formik validate />`,
                  actualException
                )
              }

              reject(actualException)
            }
          )
        } else {
          resolve(maybePromisedErrors)
        }
      })
    },
    [props.validate]
  )

  /**
   * Run validation against a Yup schema and optionally run a function if successful
   */
  const runValidationSchema = React.useCallback(
    //                ↓ 渡されるのは, validateField の場合だけ
    (values: Values, field?: string): Promise<FormikErrors<Values>> => {
      const validationSchema = props.validationSchema
      const schema = isFunction(validationSchema) ? validationSchema(field) : validationSchema
      const promise =
        field && schema.validateAt
          ? schema.validateAt(field, values)
          : validateYupSchema(values, schema, props.contextThunk?.())
      return new Promise((resolve, reject) => {
        promise.then(
          () => {
            resolve(emptyErrors)
          },
          (err: any) => {
            // Yup will throw a validation error if validation fails. We catch those and
            // resolve them into Formik errors. We can sniff if something is a Yup error
            // by checking error.name.
            // @see https://github.com/jquense/yup#validationerrorerrors-string--arraystring-value-any-path-string
            if (err.name === 'ValidationError') {
              resolve(yupToFormErrors(err))
            } else {
              // We throw any other errors
              if (process.env.NODE_ENV !== 'production') {
                console.warn(
                  `Warning: An unhandled error was caught during validation in <Formik validationSchema />`,
                  err
                )
              }

              reject(err)
            }
          }
        )
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.validationSchema]
  )

  const runSingleFieldLevelValidation = React.useCallback(
    (field: string, value: void | string): Promise<string> => {
      return new Promise((resolve) =>
        resolve(fieldRegistry.current[field].validate(value) as string)
      )
    },
    []
  )

  const runFieldLevelValidations = React.useCallback(
    (values: Values): Promise<FormikErrors<Values>> => {
      const fieldKeysWithValidation: string[] = Object.keys(fieldRegistry.current).filter((f) =>
        isFunction(fieldRegistry.current[f].validate)
      )

      // Construct an array with all of the field validation functions
      const fieldValidations: Promise<string>[] =
        fieldKeysWithValidation.length > 0
          ? fieldKeysWithValidation.map((f) => runSingleFieldLevelValidation(f, getIn(values, f)))
          : [Promise.resolve('DO_NOT_DELETE_YOU_WILL_BE_FIRED')] // use special case ;)

      return Promise.all(fieldValidations).then((fieldErrorsList: string[]) =>
        fieldErrorsList.reduce((prev, curr, index) => {
          if (curr === 'DO_NOT_DELETE_YOU_WILL_BE_FIRED') {
            return prev
          }
          if (curr) {
            prev = setIn(prev, fieldKeysWithValidation[index], curr)
          }
          return prev
        }, {})
      )
    },
    [runSingleFieldLevelValidation]
  )

  // Run all validations and return the result
  const runAllValidations = React.useCallback(
    (values: Values) => {
      return Promise.all([
        runFieldLevelValidations(values),
        props.validationSchema ? runValidationSchema(values) : {},
        props.validate ? runValidateHandler(values) : {},
      ]).then(([fieldErrors, schemaErrors, validateErrors]) => {
        const combinedErrors = deepmerge.all<FormikErrors<Values>>(
          [fieldErrors, schemaErrors, validateErrors],
          { arrayMerge }
        )
        return combinedErrors
      })
    },
    [
      props.validate,
      props.validationSchema,
      runFieldLevelValidations,
      runValidateHandler,
      runValidationSchema,
    ]
  )

  /**
   * Run all validations methods and update state accordingly
   * validateOnXXX で動作するのはこの関数
   */
  const validateFormWithHighPriority = useEventCallback((values: Values = state.values) => {
    if (!disableIsValidating) {
      dispatch({ type: 'SET_ISVALIDATING', payload: true })
    }
    return runAllValidations(values).then((combinedErrors) => {
      if (isMounted.current) {
        if (!disableIsValidating) {
          dispatch({ type: 'SET_ISVALIDATING', payload: false })
        }
        if (!isEqual(state.errors, combinedErrors)) {
          dispatch({ type: 'SET_ERRORS', payload: combinedErrors })
        }
      }
      return combinedErrors
    })
  })

  React.useEffect(() => {
    if (
      validateOnMount &&
      isMounted.current === true &&
      isEqual(initialValues.current, props.initialValues)
    ) {
      validateFormWithHighPriority(initialValues.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validateOnMount, validateFormWithHighPriority])

  const resetForm = React.useCallback(
    (nextState?: Partial<FormikState<Values>>) => {
      const values = nextState && nextState.values ? nextState.values : initialValues.current
      const errors =
        nextState && nextState.errors
          ? nextState.errors
          : initialErrors.current
          ? initialErrors.current
          : props.initialErrors || {}
      const touched =
        nextState && nextState.touched
          ? nextState.touched
          : initialTouched.current
          ? initialTouched.current
          : props.initialTouched || {}
      const status =
        nextState && nextState.status
          ? nextState.status
          : initialStatus.current
          ? initialStatus.current
          : props.initialStatus
      initialValues.current = values
      initialErrors.current = errors
      initialTouched.current = touched
      initialStatus.current = status

      const dispatchFn = () => {
        dispatch({
          type: 'RESET_FORM',
          payload: {
            isSubmitting: !!nextState && !!nextState.isSubmitting,
            errors,
            touched,
            status,
            values,
            isValidating: !!nextState && !!nextState.isValidating,
            submitCount:
              !!nextState && !!nextState.submitCount && typeof nextState.submitCount === 'number'
                ? nextState.submitCount
                : 0,
          },
        })
      }

      if (props.onReset) {
        const maybePromisedOnReset = (props.onReset as any)(state.values, imperativeMethods)

        if (isPromise(maybePromisedOnReset)) {
          ;(maybePromisedOnReset as Promise<any>).then(dispatchFn)
        } else {
          dispatchFn()
        }
      } else {
        dispatchFn()
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.initialErrors, props.initialStatus, props.initialTouched]
  )

  // validateOnMount
  React.useEffect(() => {
    if (isMounted.current === true && !isEqual(initialValues.current, props.initialValues)) {
      if (enableReinitialize) {
        initialValues.current = props.initialValues
        resetForm()
      }

      if (validateOnMount) {
        validateFormWithHighPriority(initialValues.current)
      }
    }
  }, [
    enableReinitialize,
    props.initialValues,
    resetForm,
    validateOnMount,
    validateFormWithHighPriority,
  ])

  useReInitialize(
    enableReinitialize,
    isMounted,
    props,
    initialErrors,
    initialTouched,
    initialStatus,
    dispatch
  )

  /**
   * 自動的には実行されない
   *
   * fieldRegistry に validation fn が登録されている場合, その登録された fn のみ実行され,
   * schema.validateAt は使用されない.
   * そうでない場合, schema が利用される.
   */
  const validateField = useEventCallback((name: string) => {
    // This will efficiently validate a single field by avoiding state
    // changes if the validation function is synchronous. It's different from
    // what is called when using validateForm.

    if (fieldRegistry.current[name] && isFunction(fieldRegistry.current[name].validate)) {
      const value = getIn(state.values, name)
      console.log('validateField', { value, name })

      // 前回と同じ value の場合, validate しない
      const befVal = fieldRegistry.current[fieldCache][name]
      if (befVal === value) {
        return
      } else {
        fieldRegistry.current[fieldCache][name] = value
      }

      const maybePromise = fieldRegistry.current[name].validate(value)
      if (isPromise(maybePromise)) {
        // Only flip isValidating if the function is async.
        dispatch({ type: 'SET_ISVALIDATING', payload: true })
        return (
          maybePromise
            // .then((x: any) => x) // なぜこれがあるのか分からない
            .then((error: string) => {
              dispatch({
                type: 'SET_FIELD_ERROR',
                payload: { field: name, value: error },
              })
              dispatch({ type: 'SET_ISVALIDATING', payload: false })
            })
        )
      } else {
        dispatch({
          type: 'SET_FIELD_ERROR',
          payload: {
            field: name,
            value: maybePromise as string | undefined,
          },
        })
        return Promise.resolve(maybePromise as string | undefined)
      }
    } else if (props.validationSchema) {
      dispatch({ type: 'SET_ISVALIDATING', payload: true })
      return runValidationSchema(state.values, name).then((error: any) => {
        dispatch({
          type: 'SET_FIELD_ERROR',
          payload: { field: name, value: error[name] },
        })
        dispatch({ type: 'SET_ISVALIDATING', payload: false })
      })
    }

    return Promise.resolve()
  })

  const validateValue = useEventCallback(
    (
      name: string,
      value: any,
      msgEmitter: (x: any, options?: any) => void | string,
      options?: any
    ) => {
      const msgOrUndefined = msgEmitter(value, options)

      dispatch({
        type: 'SET_FIELD_ERROR',
        payload: {
          field: name,
          value: msgOrUndefined as string | undefined,
        },
      })
      return Promise.resolve(msgOrUndefined as string | undefined)
    }
  )

  const registerField = React.useCallback((name: string, validate: { validate: any }) => {
    fieldRegistry.current[name] = validate
  }, [])

  const unregisterField = React.useCallback((name: string) => {
    delete fieldRegistry.current[name]
    delete fieldRegistry.current[fieldCache][name]
  }, [])

  const setTouched = useEventCallback(
    (touched: FormikTouched<Values>, shouldValidate?: boolean) => {
      dispatch({ type: 'SET_TOUCHED', payload: touched })
      const willValidate = shouldValidate === undefined ? validateOnBlur : shouldValidate
      return willValidate ? validateFormWithHighPriority(state.values) : Promise.resolve()
    }
  )

  const setErrors = React.useCallback((errors: FormikErrors<Values>) => {
    dispatch({ type: 'SET_ERRORS', payload: errors })
  }, [])

  const setValues = useEventCallback(
    (values: React.SetStateAction<Values>, shouldValidate?: boolean) => {
      const resolvedValues = isFunction(values) ? values(state.values) : values

      dispatch({ type: 'SET_VALUES', payload: resolvedValues })
      const willValidate = shouldValidate === undefined ? validateOnChange : shouldValidate
      return willValidate ? validateFormWithHighPriority(resolvedValues) : Promise.resolve()
    }
  )

  const createSetFieldAction = React.useCallback(
    <P extends tb.L.List<string | number>>(path: P) => {
      return (value: React.SetStateAction<tb.O.Path<Values, P>>, shouldValidate?: boolean) => {
        const lens = R.lensPath(path as any) as any
        setValues(isFunction(value) ? R.over(lens, value) : R.set(lens, value), shouldValidate)
      }
    },
    [setValues]
  )

  const setFieldError = React.useCallback((field: string, value: string | undefined) => {
    dispatch({
      type: 'SET_FIELD_ERROR',
      payload: { field, value },
    })
  }, [])

  const setFieldValue = useEventCallback((field: string, value: any, shouldValidate?: boolean) => {
    console.condlog(_debug, 'setFieldValue', field, value)
    dispatch({
      type: 'SET_FIELD_VALUE',
      payload: {
        field,
        value,
      },
    })
    const willValidate = shouldValidate === undefined ? validateOnChange : shouldValidate
    return willValidate
      ? validateFormWithHighPriority(setIn(state.values, field, value))
      : Promise.resolve()
  })

  const executeChange = React.useCallback(
    (eventOrTextValue: string | React.ChangeEvent<any>, maybePath?: string) => {
      // By default, assume that the first argument is a string. This allows us to use
      // handleChange with React Native and React Native Web's onChangeText prop which
      // provides just the value of the input.
      console.condlog(_debug, 'executeChange', eventOrTextValue, maybePath)
      let field = maybePath
      let val = eventOrTextValue
      let parsed
      // If the first argument is not a string though, it has to be a synthetic React Event (or a fake one),
      // so we handle like we would a normal HTML change event.
      if (!isString(eventOrTextValue)) {
        // If we can, persist the event
        // @see https://reactjs.org/docs/events.html#event-pooling
        if ((eventOrTextValue as any).persist) {
          ;(eventOrTextValue as React.ChangeEvent<any>).persist()
        }
        const target = eventOrTextValue.target
          ? (eventOrTextValue as React.ChangeEvent<any>).target
          : (eventOrTextValue as React.ChangeEvent<any>).currentTarget

        const { type, name, id, value, checked, outerHTML, options, multiple } = target

        field = maybePath ? maybePath : name ? name : id
        if (!field && __DEV__) {
          warnAboutMissingIdentifier({
            htmlContent: outerHTML,
            documentationAnchorLink: 'handlechange-e-reactchangeeventany--void',
            handlerName: 'handleChange',
          })
        }
        val = /number|range/.test(type)
          ? ((parsed = parseFloat(value)), isNaN(parsed) ? '' : parsed)
          : /checkbox/.test(type) // checkboxes
          ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            getValueForCheckbox(getIn(state.values, field!), checked, value)
          : options && multiple // <select multiple>
          ? getSelectedValues(options)
          : value
      }

      if (field) {
        // Set form fields by name
        setFieldValue(field, val)
      }
    },
    [setFieldValue, state.values]
  )

  const handleChange: FormikHandlers['handleChange'] = useEventCallback(
    (
      eventOrPath: string | React.ChangeEvent<any>
    ): void | ((eventOrTextValue: string | React.ChangeEvent<any>) => void) => {
      console.condlog(_debug, 'handleChange', eventOrPath)
      if (isString(eventOrPath)) {
        return (event) => executeChange(event, eventOrPath)
      } else {
        executeChange(eventOrPath)
      }
    }
  )

  const setFieldTouched = useEventCallback(
    (field: string, touched = true, shouldValidate?: boolean) => {
      console.condlog(_debug, 'setFieldTouched', { field })
      dispatch({
        type: 'SET_FIELD_TOUCHED',
        payload: {
          field,
          value: touched as boolean, // なぜか unknown になる謎
        },
      })
      const willValidate = shouldValidate === undefined ? validateOnBlur : shouldValidate
      return willValidate ? validateFormWithHighPriority(state.values) : Promise.resolve()
    }
  )

  const executeBlur = React.useCallback(
    (e: any, path?: string) => {
      if (e.persist) {
        e.persist()
      }
      const { name, id, outerHTML } = e.target
      const field = path ? path : name ? name : id

      if (!field && __DEV__) {
        warnAboutMissingIdentifier({
          htmlContent: outerHTML,
          documentationAnchorLink: 'handleblur-e-any--void',
          handlerName: 'handleBlur',
        })
      }

      console.condlog(_debug, 'executeBlur setFieldTouched', { field })
      setFieldTouched(field, true)
    },
    [setFieldTouched]
  )

  const handleBlur: FormikHandlers['handleBlur'] = useEventCallback(
    (eventOrString: any): void | ((e: any) => void) => {
      console.condlog(_debug, 'handleBlur', { eventOrString })
      if (isString(eventOrString)) {
        return (event) => executeBlur(event, eventOrString)
      } else {
        executeBlur(eventOrString)
      }
    }
  )
  const executeFocus = React.useCallback(
    (e: any, path?: string) => {
      if (e.persist) {
        e.persist()
      }
      const { name, id, outerHTML } = e.target
      const field = path ? path : name ? name : id

      if (!field && __DEV__) {
        warnAboutMissingIdentifier({
          htmlContent: outerHTML,
          documentationAnchorLink: 'handleblur-e-any--void',
          handlerName: 'handleBlur',
        })
      }

      console.condlog(_debug, 'setFocus', { field })
      setFocus(field)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setFieldTouched]
  )

  const handleFocus: FormikHandlers['handleFocus'] = useEventCallback(
    (eventOrString: any): void | ((e: any) => void) => {
      console.condlog(_debug, 'handleFocus', { eventOrString })
      if (isString(eventOrString)) {
        return (event) => executeFocus(event, eventOrString)
      } else {
        executeFocus(eventOrString)
      }
    }
  )
  const setFormikState = React.useCallback(
    (
      stateOrCb: FormikState<Values> | ((state: FormikState<Values>) => FormikState<Values>)
    ): void => {
      if (isFunction(stateOrCb)) {
        dispatch({ type: 'SET_FORMIK_STATE', payload: stateOrCb })
      } else {
        dispatch({ type: 'SET_FORMIK_STATE', payload: () => stateOrCb })
      }
    },
    []
  )

  const setStatus = React.useCallback((status: any) => {
    dispatch({ type: 'SET_STATUS', payload: status })
  }, [])

  const setSubmitting = React.useCallback((isSubmitting: boolean) => {
    dispatch({ type: 'SET_ISSUBMITTING', payload: isSubmitting })
  }, [])

  const submitForm = useEventCallback(() => {
    dispatch({ type: 'SUBMIT_ATTEMPT' })
    return validateFormWithHighPriority().then((combinedErrors: FormikErrors<Values>) => {
      // In case an error was thrown and passed to the resolved Promise,
      // `combinedErrors` can be an instance of an Error. We need to check
      // that and abort the submit.
      // If we don't do that, calling `Object.keys(new Error())` yields an
      // empty array, which causes the validation to pass and the form
      // to be submitted.

      const isInstanceOfError = combinedErrors instanceof Error
      const isActuallyValid = !isInstanceOfError && Object.keys(combinedErrors).length === 0
      if (isActuallyValid) {
        // Proceed with submit...
        //
        // To respect sync submit fns, we can't simply wrap executeSubmit in a promise and
        // _always_ dispatch SUBMIT_SUCCESS because isSubmitting would then always be false.
        // This would be fine in simple cases, but make it impossible to disable submit
        // buttons where people use callbacks or promises as side effects (which is basically
        // all of v1 Formik code). Instead, recall that we are inside of a promise chain already,
        //  so we can try/catch executeSubmit(), if it returns undefined, then just bail.
        // If there are errors, throw em. Otherwise, wrap executeSubmit in a promise and handle
        // cleanup of isSubmitting on behalf of the consumer.
        let promiseOrUndefined
        // eslint-disable-next-line no-useless-catch
        try {
          promiseOrUndefined = executeSubmit()
          // Bail if it's sync, consumer is responsible for cleaning up
          // via setSubmitting(false)
          if (promiseOrUndefined === undefined) {
            return
          }
        } catch (error) {
          throw error
        }

        // eslint-disable-next-line promise/no-nesting
        return promiseOrUndefined
          .then(() => {
            if (isMounted.current) {
              dispatch({ type: 'SUBMIT_SUCCESS' })
            }
          })
          .catch((_errors) => {
            if (isMounted.current) {
              dispatch({ type: 'SUBMIT_FAILURE' })
              // This is a legit error rejected by the onSubmit fn
              // so we don't want to break the promise chain
              throw _errors
            }
          })
      } else if (isMounted.current) {
        // ^^^ Make sure Formik is still mounted before updating state
        dispatch({ type: 'SUBMIT_FAILURE' })
        // throw combinedErrors;
        if (isInstanceOfError) {
          throw combinedErrors
        }
      }
      return
    })
  })

  const handleSubmit = useEventCallback((e?: React.FormEvent<HTMLFormElement>) => {
    if (e && e.preventDefault && isFunction(e.preventDefault)) {
      e.preventDefault()
    }

    if (e && e.stopPropagation && isFunction(e.stopPropagation)) {
      e.stopPropagation()
    }

    // Warn if form submission is triggered by a <button> without a
    // specified `type` attribute during development. This mitigates
    // a common gotcha in forms with both reset and submit buttons,
    // where the dev forgets to add type="button" to the reset button.
    if (__DEV__ && typeof document !== 'undefined') {
      // Safely get the active element (works with IE)
      const activeElement = getActiveElement()
      if (activeElement !== null && activeElement instanceof HTMLButtonElement) {
        invariant(
          activeElement.attributes && activeElement.attributes.getNamedItem('type'),
          'You submitted a Formik form using a button with an unspecified `type` attribute.  Most browsers default button elements to `type="submit"`. If this is not a submit button, please add `type="button"`.'
        )
      }
    }

    submitForm().catch((reason: unknown) => {
      console.warn(`Warning: An unhandled error was caught from submitForm()`, reason)
    })
  })

  const setFocus = React.useCallback(
    (field?: string) => {
      dispatch({ type: 'SET_FOCUS', payload: field })
    },
    [dispatch]
  )

  const imperativeMethods: FormikHelpers<Values> = {
    resetForm,
    validateForm: validateFormWithHighPriority,
    validateField,
    setErrors,
    setFocus,
    setFieldError,
    setFieldTouched,
    setFieldValue,
    setStatus,
    setSubmitting,
    setTouched,
    setValues,
    setFormikState,
    submitForm,
  }

  const executeSubmit = useEventCallback(() => {
    return onSubmit(state.values, imperativeMethods)
  })

  const handleReset = useEventCallback((e: any) => {
    if (e && e.preventDefault && isFunction(e.preventDefault)) {
      e.preventDefault()
    }

    if (e && e.stopPropagation && isFunction(e.stopPropagation)) {
      e.stopPropagation()
    }

    resetForm()
  })

  const getFieldMeta = React.useCallback(
    (name: string): FieldMetaProps<any> => {
      return {
        value: getIn(state.values, name),
        error: getIn(state.errors, name),
        touched: !!getIn(state.touched, name),
        initialValue: getIn(initialValues.current, name),
        initialTouched: !!getIn(initialTouched.current, name),
        initialError: getIn(initialErrors.current, name),
        focus: state.focus,
      }
    },
    [state.errors, state.touched, state.values, state.focus]
  )

  const getFieldHelpers = memoizeCurriedFn(
    React.useCallback(
      (name: string): FieldHelperProps<any> => {
        return {
          setValue: (value: any, shouldValidate?: boolean) =>
            setFieldValue(name, value, shouldValidate),
          setTouched: (value: boolean, shouldValidate?: boolean) =>
            setFieldTouched(name, value, shouldValidate),
          setError: (value: any) => setFieldError(name, value),
          setFocus: () => setFocus(name),
        }
      },
      [setFieldValue, setFieldTouched, setFieldError, setFocus]
    )
  )

  const createRegisterInputRef = useMemoize(
    identity,
    React.useCallback(
      (path: string) => (instance: FieldElement | null) => {
        setTimeout(function afterOnWillMountOfEachField() {
          fieldsRef.current[path] = instance
        })
      },
      []
    )
  )

  const unregisterInputRef = React.useCallback((path: string) => {
    delete fieldsRef.current[path]
  }, [])

  // 分かりにくいので一旦没
  // const focusFirstErrorField = React.useCallback(
  //   (preventFocus: boolean) => {
  //     const errorPath = getFirstErrorFieldPath(state.errors)
  //     if (errorPath !== '' && !preventFocus) {
  //       fieldsRef.current[errorPath]?.focus()
  //       return true
  //     }
  //     return false
  //   },
  //   [state.errors]
  // )

  const getMyFieldProps = React.useCallback(
    (nameOrOptions: any): Omit<FieldInputProps<Values>, 'value'> => {
      const isAnObject = isObject(nameOrOptions)
      const name = isAnObject ? nameOrOptions.name : nameOrOptions
      // const valueState = getIn(state.values, name)

      const field: Omit<FieldInputProps<Values>, 'value'> = {
        name,
        // value: valueState,
        onChange: handleChange,
        onBlur: handleBlur,
        onFocus: handleFocus,
        ref: createRegisterInputRef(name),
      }
      // if (isAnObject) {
      //   const {
      //     type,
      //     value: valueProp, // value is special for checkboxes
      //     as: is,
      //     multiple,
      //   } = nameOrOptions

      //   if (type === 'checkbox') {
      //     if (valueProp === undefined) {
      //       field.checked = !!valueState
      //     } else {
      //       field.checked = !!(Array.isArray(valueState) && ~valueState.indexOf(valueProp))
      //       field.value = valueProp
      //     }
      //   } else if (type === 'radio') {
      //     field.checked = valueState === valueProp
      //     field.value = valueProp
      //   } else if (is === 'select' && multiple) {
      //     field.value = field.value || []
      //     field.multiple = true
      //   }
      // }
      return field
    },
    [createRegisterInputRef, handleBlur, handleChange, handleFocus]
  )
  // useField
  const getFieldProps = React.useCallback(
    (nameOrOptions): FieldInputProps<any> => {
      const isAnObject = isObject(nameOrOptions)
      const name = isAnObject ? nameOrOptions.name : nameOrOptions
      const valueState = getIn(state.values, name)

      const field: FieldInputProps<any> = {
        name,
        value: valueState,
        onChange: handleChange,
        onBlur: handleBlur,
        onFocus: handleFocus,
        ref: createRegisterInputRef(name),
      }
      if (isAnObject) {
        const {
          type,
          value: valueProp, // value is special for checkboxes
          as: is,
          multiple,
        } = nameOrOptions

        if (type === 'checkbox') {
          if (valueProp === undefined) {
            field.checked = !!valueState
          } else {
            field.checked = !!(Array.isArray(valueState) && ~valueState.indexOf(valueProp))
            field.value = valueProp
          }
        } else if (type === 'radio') {
          field.checked = valueState === valueProp
          field.value = valueProp
        } else if (is === 'select' && multiple) {
          field.value = field.value || []
          field.multiple = true
        }
      }
      return field
    },
    [createRegisterInputRef, handleBlur, handleChange, handleFocus, state.values]
  )

  // dirty とは 初期値と現在値が異なる状態
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const dirty = React.useMemo(
    () => !isEqual(initialValues.current, state.values),
    [initialValues.current, state.values]
  )

  const isValid = React.useMemo(
    () => state.errors && Object.keys(state.errors).length === 0,
    [state.errors]
  )

  const ctx = {
    ...state,
    initialValues: initialValues.current,
    initialErrors: initialErrors.current,
    initialTouched: initialTouched.current,
    initialStatus: initialStatus.current,
    handleBlur,
    handleChange,
    handleReset,
    handleSubmit,
    handleFocus,
    // --- imperativeMethods --- //
    resetForm, // almost immutable: [props.initialErrors, props.initialStatus, props.initialTouched] // props.initial~~ は実際変更されることはないので、実質 immutable
    setErrors, // immutable: []
    setFocus, // immutable: [dispatch]
    setFormikState, // immutable: []
    setFieldTouched, // immutable: [] (useEventCallback)
    setFieldValue, // immutable: [] (useEventCallback)
    setFieldError, // immutable: []
    setStatus, // immutable
    setSubmitting, // immutable: []
    setTouched, // immutable: [] (useEventCallback)
    setValues, // immutable: [] (useEventCallback)
    submitForm, // immutable: [] (useEventCallback)
    validateForm: validateFormWithHighPriority, // immutable: [] (useEventCallback)
    validateField, // immutable: [] (useEventCallback)
    // --- imperativeMethods --- //
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
    // 以下, 独自
    state,
    fieldsRef,
    formikStateRef,
    valuesRef,
    createRegisterInputRef,
    createSetFieldAction,
    unregisterInputRef,
    // focusFirstErrorField,
    validateValue,
  }

  return ctx
}

interface _FormikBag<Values extends FormikValues> extends ReturnType<typeof useMyFormik> {
  state: FormikState<Values>
  valuesRef: React.MutableRefObject<Values>
}
export type FormikBag<Values extends FormikValues> = _FormikBag<Values> & FormikState<Values>
