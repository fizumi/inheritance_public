import { ID, COLS } from 'src/features/inheritance/model'
import { useColumn } from './formik'
import { useValuesRef } from '.'
import { useEventCallback } from 'src/utils/react/hooks'

export const useIndex = (id: ID) => {
  const ids = useColumn('id')
  const index = ids.findIndex((v) => v === id)

  return index
}

export const useGetIndex = () => {
  const valuesRef = useValuesRef()
  return useEventCallback((id: ID) => valuesRef.current[COLS].id.findIndex((v) => v === id))
}
