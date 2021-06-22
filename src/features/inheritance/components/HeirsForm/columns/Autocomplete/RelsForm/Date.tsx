/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { function as F, option as O } from 'fp-ts'
import { pipe } from 'fp-ts/lib/function'
import React from 'react'
import { useDateUtils } from 'src/app'
import DatePicker from 'src/app/components/DatePicker'
import { date2string, DateKeys, Dates } from 'src/features/inheritance/model'
import { useBoolean, usePreventExecutionOnUnmountedComponent } from 'src/utils/react/hooks'
import { makeUseField } from 'src/libraries/formik'
import { MyTextField } from 'src/features/inheritance/components/shared/TextField'

export const makeDateComponent =
  (context: React.Context<{}>) =>
  <K extends DateKeys>({
    field,
    label,
    description,
    disabled,
    required,
  }: {
    field: K
    label: string
    description?: string
    disabled?: boolean
    required?: boolean
  }) => {
    const [useField, useOther] = makeUseField<Dates>(context)
    const [
      { value, onChange: _, ref: inputRef, ...otherInputProps },
      { error, touched },
      { setValue },
      localFormik,
    ] = useField<Dates[K]>(field)
    // const { onKeyDown } = useEnterKeyForChangingFocus(path)
    const { dateAdapter, myDateUtils } = useDateUtils()

    const { pickerOpen: parentPickerOpen, dispatchLoaclFormik } = useOther<{
      pickerOpen: ReturnType<typeof useBoolean>
      dispatchLoaclFormik: (localFormikValue: Dates) => void
    }>()
    const pickerOpen = useBoolean(false)

    const { preventExecutionOnUnmountedComponent: mySetTimeout } =
      usePreventExecutionOnUnmountedComponent()

    const handleChange = (d: Date | null | undefined, keyboardInputValue?: string) => {
      if (dateAdapter.isValid(d) || d === null) {
        pipe(d, O.fromNullable, O.map(date2string), O.toNullable, setValue)
      }
      if (d === undefined && keyboardInputValue) {
        setValue(keyboardInputValue)
      }
    }

    const onClose = F.flow(
      () => console.condlog('date picker', '[RelsForm/Date] onClose'),
      pickerOpen.dispatcher.setFalse,
      parentPickerOpen.dispatcher.setFalse
    )

    React.useEffect(
      function onDateChange() {
        mySetTimeout(() => {
          dispatchLoaclFormik(localFormik.values)
        })
      },
      [localFormik.values[field]] // eslint-disable-line react-hooks/exhaustive-deps
    )

    return (
      <DatePicker
        inputRef={inputRef}
        value={value}
        onChange={handleChange}
        renderInput={(props) => {
          const newProps = {
            ...props,
            inputProps: { ...props.inputProps },
            required,
          }
          return (
            <MyTextField
              {...newProps}
              errorMsg={error}
              touched={!!touched}
              suppressError={pickerOpen.state}
              description={description}
            />
          )
        }}
        label={label}
        InputProps={{ placeholder: myDateUtils.placeholder, ...otherInputProps }}
        open={pickerOpen.state}
        onClose={onClose}
        onOpen={F.flow(pickerOpen.dispatcher.setTrue, parentPickerOpen.dispatcher.setTrue)}
        disabled={disabled}
        PopperProps={{ onBackdropClick: onClose }}
      />
    )
  }
