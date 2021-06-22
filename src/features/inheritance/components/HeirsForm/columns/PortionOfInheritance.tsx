// https://github.com/realadvisor/rifm
// https://codesandbox.io/s/h2djc?file=/index.js
import React from 'react'
import {
  useDebugInfo,
  useEnterKeyForChangingFocus,
  useField,
  useFieldInfoMaker,
} from 'src/features/inheritance/hooks/formik'
import { label } from 'src/features/inheritance/model'
import { useRifm, useSequenceMemo } from 'src/utils/react/hooks'
import { fractionFormatter } from 'src/utils/react/hooks/useRifm'
import { MyTextField } from '../../shared/TextField'
import { ColumnProp } from './types'

const PortionOfInheritance: React.FC<ColumnProp> = ({ id }) => {
  const pathTo = useFieldInfoMaker(id)
  const path = pathTo('portionOfInheritance')
  const [{ value: value_, onChange: onChange_, ref: inputRef, ...otherInputProps_ }] =
    useField(path)
  const otherInputProps = useSequenceMemo(otherInputProps_)
  const { value, onChange } = useRifm({
    value: value_,
    onChange: onChange_,
    format: fractionFormatter,
  })
  const { onKeyDown } = useEnterKeyForChangingFocus(path)

  const [{ value: isAlive }] = useField(pathTo('isAlive'))

  const { index } = useDebugInfo(id)
  // useDependenciesDebugger( { index, otherInputProps, rootRef, inputRef, onKeyDown, value, onChange, isAlive }, log('portionOfInheritance', index), true) // prettier-ignore
  return React.useMemo(() => {
    console.condlog('component', `PortionOfInheritance[${index}] in memo`, value)
    const textFieldProps = {
      label: label.name,
      InputProps: otherInputProps,
      inputRef: inputRef,
    }
    return (
      <MyTextField
        {...textFieldProps}
        label={label.portionOfInheritance}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        type="tel"
        disabled={!isAlive}
      />
    )
  }, [index, otherInputProps, inputRef, onKeyDown, value, onChange, isAlive])
}

export default PortionOfInheritance
