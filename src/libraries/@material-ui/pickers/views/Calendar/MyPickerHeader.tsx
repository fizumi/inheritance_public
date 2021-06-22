/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as React from 'react'
import * as PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/styles'
import Typography from '@material-ui/core/Typography'
import { DateTimePickerView as DatePickerView } from '@material-ui/pickers/DateTimePicker'
import { SlideDirection } from './SlideTransition'
import { useUtils } from '../../_shared/hooks/useUtils'
import { FadeTransitionGroup } from './FadeTransitionGroup'
import { DateValidationProps } from '../../_helpers/date-utils'
import { ExportedArrowSwitcherProps } from '../../_shared/ArrowSwitcher'
export type ExportedCalendarHeaderProps<TDate> = Pick<
  CalendarHeaderProps<TDate>,
  | 'leftArrowIcon'
  | 'rightArrowIcon'
  | 'leftArrowButtonProps'
  | 'rightArrowButtonProps'
  | 'leftArrowButtonText'
  | 'rightArrowButtonText'
  | 'getViewSwitchingButtonText'
>

export interface CalendarHeaderProps<TDate>
  extends ExportedArrowSwitcherProps,
    Omit<DateValidationProps<TDate>, 'shouldDisableDate'> {
  view: DatePickerView
  views: DatePickerView[]
  currentMonth: TDate
  date: TDate // 追加
  /**
   * Get aria-label text for switching between views button.
   */
  getViewSwitchingButtonText?: (currentView: DatePickerView) => string
  reduceAnimations: boolean
  changeView: (view: DatePickerView) => void
  onMonthChange: (date: TDate, slideDirection: SlideDirection) => void
}

export const useStyles = makeStyles(
  (theme) => ({
    root: {
      // display: 'flex', // 文字にブレが生じるので使用しない
      // alignItems: 'center',
      marginTop: 16,
      marginBottom: 8,
      paddingLeft: 24,
      paddingRight: 12,
      // prevent jumping in safari
      maxHeight: 30,
      minHeight: 30,
    },
    yearSelectionSwitcher: {
      marginRight: 'auto',
    },
    previousMonthButton: {
      marginRight: 24,
    },
    switchViewDropdown: {
      willChange: 'transform',
      transition: theme.transitions.create('transform'),
      transform: 'rotate(0deg)',
    },
    switchViewDropdownDown: {
      transform: 'rotate(180deg)',
    },
    monthTitleContainer: {
      display: 'flex',
      maxHeight: 30,
      overflow: 'hidden',
      cursor: 'pointer',
      marginRight: 'auto',
    },
  }),
  { name: 'MuiPickersCalendarHeader' }
)

function getSwitchingViewAriaText(view: DatePickerView) {
  return view === 'year'
    ? 'year view is open, switch to calendar view'
    : 'calendar view is open, switch to year view'
}

export function CalendarHeader<TDate>(props: CalendarHeaderProps<TDate>) {
  const {
    // view: currentView,
    views: _v,
    currentMonth: month,
    date, // 追加
    changeView,
    reduceAnimations,
    getViewSwitchingButtonText: _g = getSwitchingViewAriaText,
  } = props

  const utils = useUtils<TDate>()
  const classes = useStyles()

  return (
    <React.Fragment>
      <div className={classes.root}>
        <div className={classes.monthTitleContainer}>
          <FadeTransitionGroup
            reduceAnimations={reduceAnimations}
            transKey={utils.format(month, 'year')}
          >
            <div onClick={() => changeView('year')}>
              <Typography
                aria-live="polite"
                data-mui-test="calendar-year-text"
                align="center"
                variant="subtitle1"
              >
                {utils.format(date || month, 'year') + '年'}
              </Typography>
            </div>
          </FadeTransitionGroup>

          <div style={{ width: '10px' }} />

          <div onClick={() => changeView('month')}>
            <FadeTransitionGroup
              reduceAnimations={reduceAnimations}
              transKey={utils.format(month, 'month')}
            >
              <Typography
                aria-live="polite"
                data-mui-test="calendar-month-text"
                align="center"
                variant="subtitle1"
              >
                {utils.format(month, 'month')}
              </Typography>
            </FadeTransitionGroup>
          </div>

          <div style={{ width: '10px' }} />

          <div onClick={() => changeView('date')}>
            <FadeTransitionGroup
              reduceAnimations={reduceAnimations}
              transKey={utils.format(date || month, 'dayOfMonth')}
            >
              <Typography
                aria-live="polite"
                data-mui-test="calendar-day-text"
                align="center"
                variant="subtitle1"
              >
                {utils.format(date || month, 'dayOfMonth') + '日'}
              </Typography>
            </FadeTransitionGroup>
          </div>

          <div style={{ width: '10px' }} />

          <div onClick={() => changeView('hours')}>
            <FadeTransitionGroup
              reduceAnimations={reduceAnimations}
              transKey={utils.formatByString(date || month, 'a')}
            >
              <Typography
                aria-live="polite"
                data-mui-test="calendar-meridiem-text"
                align="center"
                variant="subtitle1"
              >
                {utils.formatByString(date || month, 'a')}
              </Typography>
            </FadeTransitionGroup>
          </div>

          <div style={{ width: '10px' }} />

          <div onClick={() => changeView('hours')}>
            <FadeTransitionGroup
              reduceAnimations={reduceAnimations}
              transKey={utils.formatByString(date || month, 'Ko')}
            >
              <Typography
                aria-live="polite"
                data-mui-test="calendar-hour-text"
                align="center"
                variant="subtitle1"
              >
                {utils.formatByString(date || month, 'Ko') + '時'}
              </Typography>
            </FadeTransitionGroup>
          </div>

          <div style={{ width: '10px' }} />

          <div onClick={() => changeView('minutes')}>
            <FadeTransitionGroup
              reduceAnimations={reduceAnimations}
              transKey={utils.formatByString(date || month, 'mo')}
            >
              <Typography
                aria-live="polite"
                data-mui-test="calendar-munute-text"
                align="center"
                variant="subtitle1"
              >
                {utils.formatByString(date || month, 'mo') + '分'}
              </Typography>
            </FadeTransitionGroup>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

CalendarHeader.displayName = 'PickersCalendarHeader'

CalendarHeader.propTypes = {
  leftArrowButtonText: PropTypes.string,
  leftArrowIcon: PropTypes.node,
  rightArrowButtonText: PropTypes.string,
  rightArrowIcon: PropTypes.node,
}

export default CalendarHeader
