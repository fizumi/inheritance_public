/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import tb from 'ts-toolbelt'
import * as R from 'ramda'
import React from 'react'
import DesktopDatePicker, {
  MyDesktopDatePickerProps,
} from 'src/libraries/@material-ui/pickers/DesktopDatePicker'
import { MuiPickersAdapterContext } from 'src/libraries/@material-ui/pickers/LocalizationProvider'
import { useDateUtils } from '../redux/hooks'

// eslint-disable-next-line @typescript-eslint/ban-types
const DatePicker = (props: tb.O.Optional<MyDesktopDatePickerProps<Date>, 'rifmFormatter'>) => {
  const { dateAdapter, myDateUtils } = useDateUtils()

  const defaultProps: Partial<MyDesktopDatePickerProps<Date>> = {
    clearable: true,
    openTo: 'year',
    views: ['year', 'month', 'date', 'hours', 'minutes'],
    inputFormat: myDateUtils.inputFormat,
    rifmFormatter: myDateUtils.rifmFormatter,
    allowSameDateSelection: true,
    minDate: new Date('1900-01-01'),
    maxDate: new Date(),
  }

  return (
    <MuiPickersAdapterContext.Provider value={dateAdapter}>
      <DesktopDatePicker {...(R.mergeRight(defaultProps, props) as any)} />
    </MuiPickersAdapterContext.Provider>
  )
}
export default DatePicker
