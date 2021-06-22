import * as React from 'react'
import { useTheme } from '@material-ui/core/styles'
import { makeStyles } from '@material-ui/styles'
import { Month } from './MyMonth' // My
import { useUtils, useNow } from '../../_shared/hooks/useUtils'
import { PickerOnChangeFn } from '../../_shared/hooks/useViews'
import { useGlobalKeyDown, keycode as keys } from '../../_shared/hooks/useKeyDown'

export interface MonthSelectionProps<TDate> {
  date: TDate | null
  minDate: TDate
  maxDate: TDate
  onChange: PickerOnChangeFn<TDate>
  disablePast?: boolean | null | undefined
  disableFuture?: boolean | null | undefined
  onMonthChange?: (date: TDate) => void | Promise<void>

  // add
  allowKeyboardControl?: boolean
  changeFocusedDay: (day: TDate) => void
}

export const useStyles = makeStyles(
  {
    root: {
      width: 310,
      display: 'flex',
      flexWrap: 'wrap',
      alignContent: 'stretch',
    },
  },
  { name: 'MuiPickersMonthSelection' }
)

export function MonthSelection<TDate>({
  date: __dateOrNull,
  disableFuture,
  disablePast,
  maxDate,
  minDate,
  onChange,
  onMonthChange,

  // add
  allowKeyboardControl,
  changeFocusedDay,
}: MonthSelectionProps<TDate>) {
  const now = useNow<TDate>()
  const theme = useTheme()
  const utils = useUtils<TDate>()
  const classes = useStyles()

  const selectedDate = __dateOrNull || now
  const currentMonth = utils.getMonth(selectedDate)

  const [focusedMonth, setFocusedMonth] = React.useState<number | null>(currentMonth)

  const shouldDisableMonth = (month: TDate) => {
    const firstEnabledMonth = utils.startOfMonth(
      disablePast && utils.isAfter(now, minDate) ? now : minDate
    )

    const lastEnabledMonth = utils.startOfMonth(
      disableFuture && utils.isBefore(now, maxDate) ? now : maxDate
    )

    const isBeforeFirstEnabled = utils.isBefore(month, firstEnabledMonth)
    const isAfterLastEnabled = utils.isAfter(month, lastEnabledMonth)

    return isBeforeFirstEnabled || isAfterLastEnabled
  }

  const onMonthSelect = React.useCallback(
    (month: number) => {
      const newDate = utils.setMonth(selectedDate, month)
      changeFocusedDay(newDate || now)

      onChange(newDate, 'finish')
      if (onMonthChange) {
        onMonthChange(newDate)
      }
    },
    [changeFocusedDay, now, onChange, onMonthChange, selectedDate, utils]
  )

  const focusMonth = React.useCallback((month: number) => {
    if (0 <= month && month < 12) {
      setFocusedMonth(month)
    }
  }, [])

  const monthsInRow = 3
  const nowFocusedMonth = focusedMonth || currentMonth
  useGlobalKeyDown(Boolean(allowKeyboardControl), {
    [keys.ArrowUp]: () => focusMonth(nowFocusedMonth - monthsInRow),
    [keys.ArrowDown]: () => focusMonth(nowFocusedMonth + monthsInRow),
    [keys.ArrowLeft]: () => focusMonth(nowFocusedMonth + (theme.direction === 'ltr' ? -1 : 1)),
    [keys.ArrowRight]: () => focusMonth(nowFocusedMonth + (theme.direction === 'ltr' ? 1 : -1)),
  })

  return (
    <div className={classes.root}>
      {utils.getMonthArray(selectedDate).map((month) => {
        const monthNumber = utils.getMonth(month)
        const monthText = utils.format(month, 'monthShort')

        return (
          <Month
            key={monthText}
            value={monthNumber}
            selected={monthNumber === currentMonth}
            onSelect={onMonthSelect}
            disabled={shouldDisableMonth(month)}
            focused={monthNumber === focusedMonth}
            allowKeyboardControl={allowKeyboardControl}
          >
            {monthText}
          </Month>
        )
      })}
    </div>
  )
}
