/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React from 'react'
import * as R from 'ramda'
import { defaultMaxDate, defaultMinDate, ParsableDate } from '../constants/prop-types'
import Picker from '../Picker/MyPicker'
import { AllSharedPickerProps, WithViewsProps } from '../Picker/SharedPickerProps'
// import { ResponsiveWrapper } from '../../libraries/my-mui-pickers/wrappers/ResponsiveWrapper'
import { DesktopWrapper, ExtendWrapper, SomeWrapper } from '../wrappers/Wrapper'
import {
  DateValidationError,
  // getFormatAndMaskByViews,
  parsePickerInputValue,
  // validateDate,
} from '../_helpers/date-utils'
import { pick12hOr24hFormat } from '../_helpers/text-field-helper'
import { OverrideParsableDateProps, useParsedDate } from '../_shared/hooks/date-helpers-hooks'
import { PickerStateValueManager, usePickerState } from '../_shared/hooks/usePickerState'
import { MuiPickersAdapter, useUtils } from '../_shared/hooks/useUtils'
import { makeValidationHook, ValidationProps } from '../_shared/hooks/useValidation'
import { KeyboardDateInput } from '../_shared/KeyboardDateInput'
import { DateInputRefs } from '../_shared/PureDateInput'
import { ExportedCalendarViewProps } from '../views/Calendar/CalendarView'
import { setMyDebugMethodToConsole } from 'src/utils/common'

interface BaseDatePickerProps<TDate>
  extends WithViewsProps<'year' | 'date' | 'month' | 'hours' | 'minutes'>,
    ValidationProps<DateValidationError, ParsableDate>,
    OverrideParsableDateProps<TDate, ExportedCalendarViewProps<TDate>, 'minDate' | 'maxDate'> {}

const noValidate = () => null

// src\DateTimePicker\DateTimePicker.tsx も参考にした
const datePickerConfig = {
  // ↓ DateValidationError は props.onError CB で 親コンポーネントが取得する設計になっている.
  // useValidation: makeValidationHook<
  //   DateValidationError,
  //   ParsableDate,
  //   BaseDatePickerProps<unknown>
  // >(validateDate),
  useValidation: makeValidationHook(noValidate),

  // DefaultToolbarComponent: DatePickerToolbar,

  useInterceptProps: ({
    openTo = 'date',
    // views = ['year', 'date'],
    views = ['year', 'month', 'date', 'hours', 'minutes'],
    minDate: __minDate = defaultMinDate,
    maxDate: __maxDate = defaultMaxDate,
    inputFormat,
    ...other
  }: AllPickerProps<BaseDatePickerProps<unknown>>) => {
    const utils = useUtils()
    const minDate = useParsedDate(__minDate)
    const maxDate = useParsedDate(__maxDate)
    const willUseAmPm = true

    return {
      views,
      openTo,
      minDate,
      maxDate,

      ampm: willUseAmPm,
      // ...getFormatAndMaskByViews(views, utils),
      mask: '__/__/____ __:__',

      inputFormat: pick12hOr24hFormat(inputFormat, willUseAmPm, {
        localized: utils.formats.keyboardDateTime,
        '12h': utils.formats.keyboardDateTime12h,
        '24h': utils.formats.keyboardDateTime24h,
      }),
      ...other,
    }
  },
}

type AllPickerProps<T, TWrapper extends SomeWrapper = SomeWrapper> = T &
  AllSharedPickerProps &
  ExtendWrapper<TWrapper>

const valueManager: PickerStateValueManager<unknown, unknown> = {
  emptyValue: null,
  parseInput: parsePickerInputValue,
  areValuesEqual: (utils: MuiPickersAdapter, a: unknown, b: unknown) => utils.isEqual(a, b),
}

type DesktopWrapperType = typeof DesktopWrapper

// makeWrapperComponent のアレンジ
// prettier-ignore
const omitTarget = [ 'disableCloseOnSelect', 'inputFormat', 'onAccept', 'onChange', 'onClose', 'onOpen', 'open', 'value'] as const
// prettier-ignore
const pickTarget = ['cancelText','children','clearable','clearText','DateInputProps','DialogProps','displayStaticWrapperAs','okText','PopperProps','showTabs','todayText','wider','wrapperProps'] as const

// ***************************************************
// ** my-mui-pickers\Picker\makePickerWithState.tsx **
// ***************************************************
// TDate(TDateValue) の型は MuiPickersAdapter に何を使うかにで決まる
// ★ date-fns を使う場合は, Date 型 となる
type Props<TDate> = BaseDatePickerProps<unknown> &
  AllSharedPickerProps<ParsableDate<TDate>, TDate> &
  ExtendWrapper<DesktopWrapperType> &
  Pick<DateInputRefs, 'containerRef' | 'inputRef'>
export type MyDesktopDatePickerProps<TDate> = Props<TDate>

// TODO https://next.material-ui-pickers.dev/demo/datetime-picker のように時分の表示もするか検討する
// TODO もし時分を text field に記載しないなら「分」の入力時に Poppup が閉じないようにする

setMyDebugMethodToConsole()
// console.setKey('date picker')
function PickerWithState<TDate>(__props: Props<TDate>) {
  // console.condlog('date picker', 'props.value@PickerWithState', __props.value)

  const { useInterceptProps, useValidation } = datePickerConfig // ← 様々な DatePicker で共通して使用する。

  //               ↓ __props を用いて新たなpropsを作成・追加する
  const allProps = useInterceptProps(__props) as AllPickerProps<
    BaseDatePickerProps<unknown>,
    DesktopWrapperType
  >

  const validationError =
    useValidation(allProps.value, allProps) !== null || !!__props.validationError

  //                                                ↓ コンポーネント全体で使用する State を取り扱う。
  const { pickerProps, inputProps, wrapperProps } = usePickerState<ParsableDate<TDate>, TDate>(
    allProps,
    valueManager as PickerStateValueManager<ParsableDate<TDate>, TDate>
  )

  // Note that we are passing down all the value without spread.
  // It saves us >1kb gzip and make any prop available automatically on any level down.
  const other = R.omit(['value', 'onChange'], allProps)
  const AllDateInputProps = { ...inputProps, ...other, validationError }

  // ↓ makeWrapperComponent でやることをここでやる。makeWrapperComponent を next.js で普通に使うと壊れる。
  const restPropsForTextField = R.omit([...omitTarget, ...pickTarget], other)
  const wrapperProps2 = {
    ...R.pick(pickTarget, other),
    ...{
      DateInputProps: AllDateInputProps,
      KeyboardDateInputComponent: KeyboardDateInput,
      // PureDateInputComponent: PureDateInput,
    },
    ...wrapperProps,
    ...restPropsForTextField,
  }

  return (
    <DesktopWrapper {...wrapperProps2}>
      <Picker
        {...pickerProps}
        toolbarTitle={allProps.label || allProps.toolbarTitle}
        // ToolbarComponent={other.ToolbarComponent || DefaultToolbarComponent}
        // DateInputProps={AllDateInputProps}
        {...other}
      />
    </DesktopWrapper>
  )
}

// export default PickerWithState
export default React.forwardRef((props, ref) => (
  <PickerWithState {...(props as any)} forwardedRef={ref} />
)) as <TDate>(props: Props<TDate> & React.RefAttributes<HTMLInputElement>) => React.ReactElement

/* [props.value] utils.date で Date に変換後, utils.formatByString で string に変換されてから input element に渡される
  props.value -> (utils.isValid) -> getInputValue = getDisplayDate  => {
  const isEmpty = value === null
  if (isEmpty) {
    return ''
  }
  const date = utils.date(value)
  return utils.isValid(date)
    ? utils.formatByString(date, inputFormat)
    : typeof value === 'string'
    ? value
    : ''
  }
  -> rifm -> inputProps
*/

/* [keyboard]
   keyboard event |> rifm |> rifmFormatter |> (_) => {
    const finalString = textFromRifm

    let date =
      finalString === null || finalString === '' ? null : utils.parse(finalString, inputFormat)
    if (!utils.isValid(date)) {
      date = undefined
      if (ignoreInvalidInputs) {
        return
      }
    }

    onChange(date, finalString || undefined)
  }
*/

/* [picker]

下記の通り, 最終的に uitls のメソッドが適用される
年の選択時: YearSelection: utils.setYear
月の選択時: MonthSelection: utils.setMonth
日付の選択時: Calendar: utils.mergeDateAndTime

uitls のメソッドが適用された結果が onChange(handleChangeAndOpenNext) にわたされ, 最終的に props.onChange にわたされる
CalendarView({onChange: handleChangeAndOpenNext})
props.onChange ∋ acceptDate ∋ onDateChange ∋ handleDateChange ∋ handleChangeAndOpenNext@Picker

そのため date-fns を uitils として使う場合は, TDate型は Date型となる
*/
