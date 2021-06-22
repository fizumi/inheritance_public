import { ParsableDate } from '../constants/prop-types'
import { WithViewsProps } from '../Picker/SharedPickerProps'
import { ExportedCalendarViewProps } from '../views/Calendar/CalendarView'
import { DateValidationError } from '../_helpers/date-utils'
import { OverrideParsableDateProps } from '../_shared/hooks/date-helpers-hooks'
import { ValidationProps } from '../_shared/hooks/useValidation'

export type DatePickerView = 'year' | 'date' | 'month'

export interface BaseDatePickerProps<TDate>
  extends WithViewsProps<'year' | 'date' | 'month'>,
    ValidationProps<DateValidationError, ParsableDate>,
    OverrideParsableDateProps<TDate, ExportedCalendarViewProps<TDate>, 'minDate' | 'maxDate'> {}
