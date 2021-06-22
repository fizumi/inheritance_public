/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as React from 'react'
// import { css } from '@emotion/react'
// import { useTheme, Theme } from '@material-ui/core'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/styles'
import { useViews } from '../_shared/hooks/useViews'
// import { DateTimePickerView } from '../DateTimePicker';
// import { CalendarView } from '../views/Calendar/MyCalendarView'
import { MyView } from '../views/MyView' //My
import { withDefaultProps } from '../_shared/withDefaultProps'
// import { KeyboardDateInput } from '../_shared/KeyboardDateInput'
import { useIsLandscape } from '../_shared/hooks/useIsLandscape'
import { DIALOG_WIDTH, VIEW_HEIGHT, HEADER_HEIGHT } from '../constants/dimensions'
import { PickerSelectionState } from '../_shared/hooks/usePickerState'
import { WrapperVariantContext } from '../wrappers/WrapperVariantContext'
// import { MobileKeyboardInputView } from '../views/MobileKeyboardInputView'
import { WithViewsProps, AnyPickerView, SharedPickerProps } from './SharedPickerProps'
// import { BasePickerProps, DatePickerView, DateTimePickerView } from '@material-ui/pickers'
import { BasePickerProps, DatePickerView } from '@material-ui/pickers'
import { CalendarAndClockProps } from '@material-ui/pickers/Picker/SharedPickerProps'

export interface ExportedPickerProps<TView extends AnyPickerView>
  extends Omit<BasePickerProps, 'value' | 'onChange'>,
    CalendarAndClockProps<unknown>,
    WithViewsProps<TView> {
  // TODO move out, cause it is DateTimePickerOnly
  hideTabs?: boolean
  dateRangeIcon?: React.ReactNode
  timeIcon?: React.ReactNode
}

export type PickerProps<TView extends AnyPickerView, TInputValue = any, TDateValue = any> = Omit<
  ExportedPickerProps<TView> & SharedPickerProps<TInputValue, TDateValue>,
  'DateInputProps'
>

const muiComponentConfig = { name: 'MuiPickersBasePicker' }

export const useStyles = makeStyles(
  {
    root: {
      display: 'flex',
      flexDirection: 'column',
    },
    landscape: {
      flexDirection: 'row',
    },
    pickerView: {
      overflowX: 'hidden',
      width: DIALOG_WIDTH,
      maxHeight: VIEW_HEIGHT + HEADER_HEIGHT,
      display: 'flex',
      flexDirection: 'column',
      margin: '0 auto',
    },
    pickerViewLandscape: {
      padding: '0 8px',
    },
  },
  muiComponentConfig
)

// const MobileKeyboardTextFieldProps = { fullWidth: true }

function Picker({
  className,
  date,
  // DateInputProps,
  // isMobileKeyboardViewOpen,
  onDateChange,
  openTo = 'date',
  orientation,
  // showToolbar,
  // toggleMobileKeyboardView,
  // ToolbarComponent = () => null,
  // toolbarFormat,
  // toolbarPlaceholder,
  // toolbarTitle,
  views = ['year', 'month', 'date', 'hours', 'minutes', 'seconds'],
  ...other
}: PickerProps<AnyPickerView>) {
  // const theme = useTheme()
  const classes = useStyles()
  const isLandscape = useIsLandscape(views, orientation)
  const wrapperVariant = React.useContext(WrapperVariantContext)

  // const toShowToolbar =
  //   typeof showToolbar === 'undefined' ? wrapperVariant !== 'desktop' : showToolbar

  const handleDateChange = React.useCallback(
    (date: unknown, selectionState?: PickerSelectionState) => {
      onDateChange(date, wrapperVariant, selectionState)
    },
    [onDateChange, wrapperVariant]
  )

  // const { openView, nextView, previousView, setOpenView, handleChangeAndOpenNext } = useViews({
  const { openView, setOpenView, handleChangeAndOpenNext } = useViews({
    views,
    openTo,
    onChange: handleDateChange,
    // isMobileKeyboardViewOpen,
    // toggleMobileKeyboardView,
  })

  return (
    <div
      className={clsx(classes.root, className, {
        [classes.landscape]: isLandscape,
      })}
      // css={overwrite(theme)}
    >
      <div
        className={clsx(classes.pickerView, {
          [classes.pickerViewLandscape]: isLandscape,
        })}
      >
        <React.Fragment>
          <MyView
            date={date}
            changeView={setOpenView}
            // @ts-ignore
            views={views}
            onChange={handleChangeAndOpenNext}
            view={openView as DatePickerView}
            {...(other as any)}
            //
            // for Clock
            onDateChange={handleDateChange}
            // nextView={nextView}
            // previousView={previousView}
          />
        </React.Fragment>
      </div>
    </div>
  )
}

export default withDefaultProps(muiComponentConfig, Picker)

// const overwrite = (theme: Theme) => css`
//   .MuiPickersCalendarHeader-root {
//     margin-top: 0px;
//     margin-bottom: 0px;
//     background-color: ${theme.palette.primary.main};
//     color: white;

//     /* padding-top: 1.3em; */
//     /* padding-bottom: 1.3em; */

//     border-top-left-radius: 4px;
//     border-top-right-radius: 4px;
//   }
// `
