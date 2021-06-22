// https://github.com/formium/formik/blob/master/packages/formik/src/Field.tsx
import { useSelector } from 'react-redux'
import { colsSelector } from 'src/app/redux/slices/inheritance/cols/selector'
import { AllFieldKeys, ID } from 'src/features/inheritance/model'
import { messageEmitterRecord } from 'src/features/inheritance/validation/afterLoad'
import { useLifecycles } from 'src/utils/react/hooks'
import {
  FieldHelperProps,
  FieldHookConfig,
  FieldInputProps,
  FieldMetaProps,
} from 'src/libraries/formik'
import tb from 'ts-toolbelt'
import { GetValue, useError, useFieldMethods, useTouched, _useColumn } from './formik'
import { PathInfo } from './useFieldInfoMaker'
import { useFieldValidator } from './useFieldValidator'

export type MyFieldHookConfig<
  Key extends Exclude<AllFieldKeys, 'id'>,
  Val = GetValue<Key>
> = FieldHookConfig<Val> & tb.O.Optional<PathInfo<Key>, 'id'>

export function useField<Key extends Exclude<AllFieldKeys, 'id'>, Val = GetValue<Key>[ID]>(
  props: MyFieldHookConfig<Key>,
  externalValue?: any
): [
  FieldInputProps<Val>,
  tb.O.Required<FieldMetaProps<Val, GetValue<Key>>, 'values'>,
  FieldHelperProps<Val>
] {
  const {
    /*
      本家の getFieldProps を 使用すると re-rendering が多発するので、
      本家 useFormik の getFieldProps を value を返却しないように修正。
      value は下記のように useColumn を使って分割されたコンテキストから取得する。
     */
    getMyFieldProps,
    // getFieldMeta, // getFieldMeta を使用すると re-rendering が多発するので、 useColumn を使う。
    getFieldHelpers, // getFieldHelpers は不変
    unregisterInputRef,
  } = useFieldMethods()

  const { name: path, fieldName, id } = props

  // useColumn を使えば, Context 分離による 最適化が可能になり, ある列に変更があっても, 別の列で re-render が発生しない
  const maybeValues = _useColumn(fieldName) as GetValue<typeof fieldName>
  const value: any = maybeValues !== undefined && id !== undefined ? maybeValues[id] : undefined

  const maybeTouched = useTouched(fieldName)
  const touched = maybeTouched !== undefined && id !== undefined ? maybeTouched[id] || false : false

  const maybeError = useError(fieldName)
  const error = maybeError !== undefined && id !== undefined ? maybeError[id] : undefined

  const validateFn =
    messageEmitterRecord[
      fieldName as 'deathDate' | 'portionOfInheritance' | 'pseudoParents' | 'pseudoSpouses'
    ]
  const option = useSelector(colsSelector[fieldName as 'pseudoSpouses'] || (() => undefined))

  useFieldValidator(validateFn, externalValue || value, path, option)

  useLifecycles({
    onWillUnmount: () => {
      unregisterInputRef(path)
    },
  })

  return [
    { ...getMyFieldProps(props), value: value as Val },
    { value: value as Val, values: maybeValues, touched, error },
    getFieldHelpers(path),
  ]
}
