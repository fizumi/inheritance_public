import React from 'react'
import {
  COLS,
  RELS,
  AllFieldKeys,
  ID,
  // PseudoFieldKeys,
  // key,
} from 'src/features/inheritance/model'
import { useValuesRef } from './formik'
// import { useMemoizeWith } from 'src/hooks'
import { getNext, getPrev, memoizeCurriedFn } from 'src/utils/fp/common'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types

const pathMaker = (rootField: typeof COLS | typeof RELS) => (field: AllFieldKeys) => (id: ID) =>
  `${rootField}.${field}.${id}`
export const colsPath = pathMaker(COLS)
export const relsPath = pathMaker(RELS)

/**
 * useField(formik) の args を作成する
 *
 * ここで作成される name (= path) を元に, setIn で単一の object である fromik values が編集される
 * つまり, name の記述によって, fromik values の shape が決まる
 */
export const useFieldInfoMaker = (id: ID) => {
  // const ids = useColumn('id') // これだと, id が変更される度に path を使う全てのコンポーネントにレンダリングを引き起こす
  const valuesRef = useValuesRef()
  const getIDs = React.useCallback(() => valuesRef.current[COLS].id, [valuesRef])

  const getFieldInfo = React.useCallback(
    <Key extends Exclude<AllFieldKeys, 'id'>>(fieldName: Key): Paths<Key> => {
      const pathTo = colsPath(fieldName)

      return {
        name: pathTo(id), // input element の name 属性 に使用されるので name
        id,
        fieldName,
        next: () => pathTo(getNext(getIDs())(id)),
        prev: () => pathTo(getPrev(getIDs())(id)),
      }
    },
    [getIDs, id]
  )

  return React.useMemo(() => memoizeCurriedFn(getFieldInfo), [getFieldInfo])
}
export type Paths<Key extends Exclude<AllFieldKeys, 'id'> = any> = PathInfo<Key> &
  Record<'next' | 'prev', () => ID>

export interface PathInfo<Key extends Exclude<AllFieldKeys, 'id'> = any> {
  name: string
  fieldName: Key
  id: ID
}

// export const getActualPath = (field: PseudoFieldKeys) => {
//   switch (field) {
//     case 'pseudoParents':
//       return `${RELS}.${key.isParent}`
//     case 'pseudoSpouses':
//       return `${RELS}.${key.marriage}`
//     default:
//       throw new Error()
//   }
// }
