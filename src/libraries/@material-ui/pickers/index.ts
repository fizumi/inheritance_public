export { Calendar as PickersCalendar } from './views/Calendar/Calendar'

export { CalendarView as PickersCalendarView } from './views/Calendar/CalendarView'

export { Day as PickersDay } from './views/Calendar/Day'

export { default as PickersBasePickers } from './Picker/Picker'

export { useUtils } from './_shared/hooks/useUtils'

export { usePickerState } from './_shared/hooks/usePickerState'

export {
  default as LocalizationProvider,
  MuiPickersAdapterContext as MuiPickersContext,
} from './LocalizationProvider'

// TODO replace the following syntax with new ts export type { } syntax when will be supported by rollup

export type PickersCalendarProps<TDate> = import('./views/Calendar/Calendar').CalendarProps<TDate>
export type PickersCalendarViewProps<TDate> =
  import('./views/Calendar/CalendarView').CalendarViewProps<TDate>
export type PickersDayProps<TDate> = import('./views/Calendar/Day').DayProps<TDate>
