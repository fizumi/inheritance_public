import React from 'react'
import { ID, RelationKey } from 'src/features/inheritance/model'
import { useSequenceMemo } from 'src/utils/react/hooks'
import { useField, useFieldInfoMaker } from 'src/features/inheritance/hooks/formik'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useFieldPartially = <K extends RelationKey>(id: ID, rKey: K, curRels: any[]) => {
  const field = rKey === 'marriage' ? 'pseudoSpouses' : 'pseudoParents'
  const path = useFieldInfoMaker(id)(field)

  // RELS に格納されているデータを使うので, COLS の value は使用しない.
  // しかし, input 要素用の機能（フォーカス情報等を扱えるようにするなど）を利用するために useField の一部を使用する.
  const [{ value: _v, onChange: _o, ref, ...otherInputProps_ }, { error }] = useField(
    path as any,
    curRels
  )
  const otherInputProps = useSequenceMemo(otherInputProps_)

  return {
    textFieldProps: React.useMemo(
      () => ({ InputProps: otherInputProps, inputRef: ref }),
      [otherInputProps, ref]
    ),
    path,
    error,
  }
}
