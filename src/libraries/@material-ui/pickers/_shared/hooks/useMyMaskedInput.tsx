import * as React from 'react'
import { useUtils } from './useUtils'
import { DateInputProps, MuiTextFieldProps } from '../PureDateInput'
import {
  // maskedDateFormatter,
  getDisplayDate,
  // checkMaskIsValidForCurrentFormat,
} from '../../_helpers/text-field-helper'
import { useRifm } from 'src/utils/react/hooks'

type MaskedInputProps = Omit<
  DateInputProps,
  | 'open'
  | 'adornmentPosition'
  | 'renderInput'
  | 'openPicker'
  | 'InputProps'
  | 'InputAdornmentProps'
  | 'openPickerIcon'
  | 'disableOpenPicker'
  | 'getOpenDialogAriaText'
  | 'OpenPickerButtonProps'
> & { inputProps?: Partial<React.HTMLProps<HTMLInputElement>> }

export function useMaskedInput({
  // acceptRegex = /[\d]/gi,
  disabled,
  // disableMaskedInput,
  ignoreInvalidInputs,
  inputFormat,
  inputProps,
  label,
  // mask,
  onChange,
  rawValue, // 大元の props.value
  readOnly,
  rifmFormatter,
  TextFieldProps,
  validationError,
}: MaskedInputProps): MuiTextFieldProps {
  const utils = useUtils()

  const getInputValue = React.useCallback(
    () => getDisplayDate(utils, rawValue, inputFormat),
    [inputFormat, rawValue, utils]
  )

  const handleChange = (textFromRifm: string) => {
    let date =
      textFromRifm === null || textFromRifm === '' ? null : utils.parse(textFromRifm, inputFormat)

    if (date !== null && !utils.isValid(date)) {
      date = undefined
      if (ignoreInvalidInputs) {
        return
      }
    }

    onChange(date, textFromRifm || undefined)
  }

  const rifmProps = useRifm({
    value: getInputValue(),
    passValue: true,
    onChange: handleChange,
    format: rifmFormatter,
  })

  const inputStateArgs = rifmProps

  return {
    label,
    disabled,
    error: validationError,
    inputProps: {
      ...inputStateArgs,
      disabled, // make spreading in custom input easier
      readOnly,
      type: 'tel',
      ...inputProps,
    },
    ...TextFieldProps,
  }
}
