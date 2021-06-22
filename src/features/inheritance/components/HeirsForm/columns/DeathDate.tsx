import * as R from 'ramda'
import React from 'react'
import { date2string, label } from 'src/features/inheritance/model'
import { useSequenceMemo } from 'src/utils/react/hooks'
import { useDateUtils } from 'src/app'
import {
  useDebugInfo,
  useEnterKeyForChangingFocus,
  useField,
  useFieldInfoMaker,
  useStatus,
} from '../../../hooks/formik'
import { MyTextField } from '../../shared/TextField'
import DatePicker from '../../../../../app/components/DatePicker'
import { ColumnProp } from './types'

// console.setKey('date picker')
const DeathDate: React.FC<ColumnProp> = ({ id }) => {
  const pathTo = useFieldInfoMaker(id)
  const path = pathTo('deathDate')
  const [{ value, onChange: _, ref: inputRef, ...otherInputProps_ }, { error }, { setValue }] =
    useField(path)
  const otherInputProps = useSequenceMemo(otherInputProps_)
  const [status] = useStatus()
  const curStatus = status[id]
  const { onKeyDown } = useEnterKeyForChangingFocus(path)

  const { myDateUtils } = useDateUtils()

  const { index } = useDebugInfo(id)
  // useDependenciesDebugger( {index, rootRef, inputRef, value, curStatus, myDateUtils.placeholder, otherInputProps, updateFieldAndUpdateDeathOrder, setValue, onKeyDown}, log('DeathDate', index), true) // prettier-ignore
  return React.useMemo(
    () => {
      console.condlog('component', `DeathDate[${index}] in memo`)
      const handleChange = (d: Date | null | undefined, keyboardInputValue?: string) => {
        // valid Date | null
        if (d !== undefined) {
          setValue(d === null ? null : date2string(d))
        }
        // INvalid Date: "_" などの, 未入力を示す文字列がある場合
        if (d === undefined && keyboardInputValue) {
          setValue(keyboardInputValue)
        }
      }

      return (
        <DatePicker
          inputRef={inputRef}
          value={value}
          onChange={handleChange}
          renderInput={(props) => {
            const newProps = {
              ...props,
              inputProps: { ...props.inputProps },
              onKeyDown,
            }
            return <MyTextField {...newProps} />
          }}
          label={label.deathDate}
          disabled={R.includes(curStatus, ['亡'])}
          InputProps={{ placeholder: myDateUtils.placeholder, ...otherInputProps }}
          validationError={!!error}
        />
      )
    },
    [index, inputRef, value, curStatus, myDateUtils.placeholder, otherInputProps, error, setValue, onKeyDown] // prettier-ignore
  )
}
export default DeathDate
