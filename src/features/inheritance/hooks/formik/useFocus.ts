import { AllFieldKeys, ID } from 'src/features/inheritance/model'
import { runRepetitiveGet } from 'src/utils/fp/common'
import { useReactWindowInstance } from '../useListRef'
import { useFieldsRef } from './formik'
import { colsPath } from './useFieldInfoMaker'
import { useGetIndex } from './useIndex'

export const useFocus = (field: AllFieldKeys) => {
  const fieldsRef = useFieldsRef()
  const rwRef = useReactWindowInstance()
  const getIndex = useGetIndex()
  const focus = (id: ID) => {
    rwRef.current?.scrollToItem(getIndex(id), 'smart')
    return runRepetitiveGet(() => {
      return fieldsRef.current?.[colsPath(field)(id)] as HTMLElement
    }).then((element) => element?.focus())
  }
  return focus
}
