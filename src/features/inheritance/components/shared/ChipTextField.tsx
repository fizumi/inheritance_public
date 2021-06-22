import * as React from 'react'
import { DraggableChip } from 'src/features/inheritance/components/shared/DraggableChip'
import { useFieldsRef, useFocusedID, colsPath } from 'src/features/inheritance/hooks/formik'
import { ID } from 'src/features/inheritance/model'
import { MyTextField, MyTextFieldProps } from './TextField'
import * as R from 'ramda'

export type ChipTextFieldProps = MyTextFieldProps & {
  id: ID
}

const transparentCaret = { caretColor: 'transparent' } // moveCursor で caret がチラつくのを隠したい
const defaultCaret = { caretColor: 'initial' }

export const ChipTextField = React.forwardRef<HTMLDivElement, ChipTextFieldProps>(
  ({ id, value, InputProps, ...other }, ref) => {
    const [inputStyle, setInputStyle] = React.useState(transparentCaret)
    const isFocued = useFocusedID('name') === id
    const startAdornment =
      isFocued || value === '' ? undefined : <DraggableChip id={id} label={value as string} />

    const fieldsRef = useFieldsRef()

    React.useEffect(
      function moveCaret() {
        setTimeout(() => {
          if (!isFocued) {
            setInputStyle(transparentCaret)
            return
          }
          fieldsRef.current?.[colsPath('name')(id)]?.setSelectionRange(-1, -1) // https://stackoverflow.com/a/56719955/16119952
          setInputStyle(defaultCaret)
        })
      },
      [isFocued] // eslint-disable-line react-hooks/exhaustive-deps
    )

    return (
      <MyTextField
        ref={ref}
        value={isFocued ? value : ''}
        {...other}
        InputProps={{
          ...InputProps,
          startAdornment,
          style: R.mergeLeft(inputStyle, InputProps?.style || {}),
        }}
      />
    )
  }
)

/*
memo
  onFocue で moveCaret は上手くいかなかった
*/
