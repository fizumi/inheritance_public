import * as React from 'react'
import { makeStyles } from '@material-ui/styles'
import { MonthSelection } from './Calendar/MyMonthSelection'
// import { DatePickerView } from '@material-ui/pickers/DatePicker/DatePicker'
import { DateTimePickerView as DatePickerView } from '@material-ui/pickers/DateTimePicker'
import { useCalendarState } from './Calendar/useCalendarState'
import { useUtils } from '../_shared/hooks/useUtils'
import { FadeTransitionGroup } from './Calendar/FadeTransitionGroup'
import { Calendar, ExportedCalendarProps } from './Calendar/MyCalendar' //My
import { PickerOnChangeFn } from '../_shared/hooks/useViews'
import { useDefaultProps } from '../_shared/withDefaultProps'
import { DAY_SIZE, DAY_MARGIN } from '../constants/dimensions'
import {
  CalendarHeader,
  ExportedCalendarHeaderProps,
  CalendarHeaderProps,
} from './Calendar/MyPickerHeader' //My
import { YearSelection, ExportedYearSelectionProps } from './Calendar/YearSelection'
import { defaultMinDate, defaultMaxDate } from '../constants/prop-types'
import { IsStaticVariantContext } from '../wrappers/WrapperVariantContext'
import { DateValidationProps, findClosestEnabledDate } from '../_helpers/date-utils'
import { usePreviousMonthDisabled, useNextMonthDisabled } from '../_shared/hooks/date-helpers-hooks'
import { ClockView } from './Clock/MyClockView' //My
// import { DateTimePickerView } from '@material-ui/pickers'
import { SharedPickerProps } from '@material-ui/pickers/Picker/SharedPickerProps'

export interface CalendarViewProps<TDate>
  extends DateValidationProps<TDate>,
    ExportedCalendarProps<TDate>,
    ExportedYearSelectionProps,
    ExportedCalendarHeaderProps<TDate> {
  date: TDate
  view: DatePickerView
  views: DatePickerView[]
  changeView: (view: DatePickerView) => void
  onChange: PickerOnChangeFn<TDate>
  /**
   * Disable heavy animations.
   *
   * @default /(android)/i.test(window.navigator.userAgent).
   */
  reduceAnimations?: boolean
  /**
   * Callback firing on month change. @DateIOType
   */
  onMonthChange?: (date: TDate) => void

  // for Clock
  onDateChange: SharedPickerProps<any, TDate>['onDateChange']
  // nextView: DateTimePickerView
  // previousView: DateTimePickerView
}

export type ExportedCalendarViewProps<TDate> = Omit<
  CalendarViewProps<TDate>,
  'date' | 'view' | 'views' | 'onChange' | 'changeView' | 'slideDirection' | 'currentMonth'
>

const muiComponentConfig = { name: 'MuiPickersCalendarView' }

export const useStyles = makeStyles(
  {
    viewTransitionContainer: {
      overflowY: 'auto',
    },
    fullHeightContainer: {
      flex: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: (DAY_SIZE + DAY_MARGIN * 4) * 7,
      height: '100%',
    },
  },
  muiComponentConfig
)

export const defaultReduceAnimations =
  typeof navigator !== 'undefined' && /(android)/i.test(navigator.userAgent)

export function MyView<TDate>(props: CalendarViewProps<TDate>) {
  const {
    allowKeyboardControl: allowKeyboardControlProp,
    changeView,
    date,
    disableFuture,
    disablePast,
    loading,
    maxDate: maxDateProp,
    minDate: minDateProp,
    onChange,
    onMonthChange,
    reduceAnimations = defaultReduceAnimations,
    renderLoading,
    shouldDisableDate,
    shouldDisableYear,
    view,

    // for Clock
    onDateChange,
    // nextView,
    // previousView,

    ...other
  } = useDefaultProps(props, muiComponentConfig)

  const utils = useUtils<TDate>()
  const classes = useStyles()
  const isStatic = React.useContext(IsStaticVariantContext)
  const allowKeyboardControl = allowKeyboardControlProp ?? !isStatic

  const minDate = minDateProp || utils.date(defaultMinDate)!
  const maxDate = maxDateProp || utils.date(defaultMaxDate)!

  const {
    calendarState,
    changeFocusedDay,
    changeMonth,
    isDateDisabled,
    handleChangeMonth,
    onMonthSwitchingAnimationEnd,
  } = useCalendarState({
    date,
    reduceAnimations,
    onMonthChange,
    minDate,
    maxDate,
    shouldDisableDate,
    disablePast,
    disableFuture,
  })

  React.useEffect(() => {
    if (date && isDateDisabled(date)) {
      const closestEnabledDate = findClosestEnabledDate<TDate>({
        utils,
        date,
        minDate,
        maxDate,
        disablePast: Boolean(disablePast),
        disableFuture: Boolean(disableFuture),
        shouldDisableDate: isDateDisabled,
      })

      onChange(closestEnabledDate, 'partial')
    }
    // This call is too expensive to run it on each prop change.
    // So just ensure that we are not rendering disabled as selected on mount.
  }, []) // eslint-disable-line

  React.useEffect(() => {
    changeMonth(date)
  }, [date]) // eslint-disable-line

  // for ArrowSwitcher
  const onMonthChange_: CalendarHeaderProps<TDate>['onMonthChange'] = (newMonth, direction) =>
    handleChangeMonth({ newMonth, direction })
  const month = calendarState.currentMonth
  const selectNextMonth = () => onMonthChange_(utils.getNextMonth(month), 'left')
  const selectPreviousMonth = () => onMonthChange_(utils.getPreviousMonth(month), 'right')
  const isNextMonthDisabled = useNextMonthDisabled(month, { disableFuture, maxDate })
  const isPreviousMonthDisabled = usePreviousMonthDisabled(month, { disablePast, minDate })
  const forArrowSwitcher = {
    onLeftClick: selectPreviousMonth,
    onRightClick: selectNextMonth,
    isLeftDisabled: isPreviousMonthDisabled,
    isRightDisabled: isNextMonthDisabled,
  }

  return (
    <React.Fragment>
      <CalendarHeader
        {...other}
        date={date} // 追加
        view={view}
        currentMonth={calendarState.currentMonth}
        changeView={changeView}
        onMonthChange={(newMonth, direction) => handleChangeMonth({ newMonth, direction })}
        minDate={minDate}
        maxDate={maxDate}
        disablePast={disablePast}
        disableFuture={disableFuture}
        reduceAnimations={reduceAnimations}
      />
      <FadeTransitionGroup
        reduceAnimations={reduceAnimations}
        className={classes.viewTransitionContainer}
        transKey={view}
      >
        <div>
          {view === 'year' && (
            <YearSelection
              {...other}
              date={date}
              onChange={onChange}
              minDate={minDate}
              maxDate={maxDate}
              disableFuture={disableFuture}
              disablePast={disablePast}
              isDateDisabled={isDateDisabled}
              allowKeyboardControl={allowKeyboardControl}
              shouldDisableYear={shouldDisableYear}
              changeFocusedDay={changeFocusedDay}
            />
          )}
          {view === 'month' && (
            <MonthSelection
              {...other}
              date={date}
              onChange={onChange}
              minDate={minDate}
              maxDate={maxDate}
              onMonthChange={onMonthChange}
              //
              allowKeyboardControl={allowKeyboardControl}
              changeFocusedDay={changeFocusedDay}
            />
          )}
          {view === 'date' && (
            <Calendar
              {...other}
              {...calendarState}
              onMonthSwitchingAnimationEnd={onMonthSwitchingAnimationEnd}
              changeFocusedDay={changeFocusedDay}
              reduceAnimations={reduceAnimations}
              date={date}
              onChange={onChange}
              isDateDisabled={isDateDisabled}
              allowKeyboardControl={allowKeyboardControl}
              loading={loading}
              renderLoading={renderLoading}
              {...forArrowSwitcher}
            />
          )}
          {(view === 'hours' || view === 'minutes' || view === 'seconds') && (
            <ClockView
              {...other}
              date={date}
              type={view as 'hours' | 'minutes' | 'seconds'}
              onDateChange={onDateChange as any}
              onChange={onChange as any}
              // openNextView={() => changeView(nextView)}
              // openPreviousView={() => changeView(previousView)}
              // nextViewAvailable={!nextView}
              // previousViewAvailable={!previousView || isDatePickerView(previousView)}
              // showViewSwitcher={wrapperVariant === 'desktop'}
            />
          )}
        </div>
      </FadeTransitionGroup>
    </React.Fragment>
  )
}
