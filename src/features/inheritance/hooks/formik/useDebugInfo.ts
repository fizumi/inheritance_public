import React from 'react'
import { ID, COLS } from 'src/features/inheritance/model'
import { useValuesRef } from '.'
import { useColumn } from './formik'

/**
 * デバッグ用を想定
 * これを使うと,  name の更新ごとに user componente が render されるので注意
 */
export const useDebugInfo_bk = (id: ID) => {
  const ids = useColumn('id')
  const name = useColumn('name')[id]

  const index = ids.findIndex((v) => v === id)

  return {
    name,
    index,
    debug: React.useMemo(() => `index: ${index}, name: ${name}`, [index, name]),
  }
}

/**
 * デバッグ用を想定
 */
export const useDebugInfo = (id: ID) => {
  const valuesRef = useValuesRef()
  const ids = valuesRef.current[COLS].id
  const name = valuesRef.current[COLS].name[id]

  const index = ids.findIndex((v) => v === id)

  return {
    name,
    index,
    debug: React.useMemo(() => `index: ${index}, name: ${name}`, [index, name]),
  }
}
