import React from 'react'
import { useFieldMethods } from './formik'
import { MessageEmitterWithOptions } from 'src/utils/fp/common/validation'
// import { isPseudoField } from 'src/features/persons/model'

/**
 * SingleFieldLevelValidation
 */
export const useFieldValidator = (
  validateFn: MessageEmitterWithOptions<any>,
  value: any,
  path: string,
  options?: any
) => {
  const { validateValue } = useFieldMethods()

  const noValidate = !validateFn

  React.useEffect(() => {
    if (noValidate) return
    validateValue(path, value, validateFn, options)
  }, [noValidate, options, path, validateFn, validateValue, value])
}

/*
const makeUseFieldValidator = (validatorRecord: Readonly<Record<string, MessageEmitter>>) => {
  return (path: string, fieldName: string, deps?: any[]) => {
    const { registerField, unregisterField } = useFieldMethods()
    const { validateField } = useConstRefFunctions()

    const validateFn = validatorRecord[fieldName]

    const noValidate = !validateFn

    useLifecycles({
      onDidMount: () => {
        if (noValidate) return
        registerField(path, {
          validate: validateFn,
        })
      },
      onWillUnmount: () => {
        unregisterField(path)
      },
    })

    React.useEffect(() => {
      if (noValidate) return
      validateField(path)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps)
  }
}

*/
