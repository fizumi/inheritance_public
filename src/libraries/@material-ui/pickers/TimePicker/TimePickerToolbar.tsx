import * as React from 'react'
import { useUtils } from '../_shared/hooks/useUtils'
import { PickerOnChangeFn } from '../_shared/hooks/useViews'
import { convertToMeridiem, getMeridiem } from '../_helpers/time-utils'

export function useMeridiemMode<TDate>(
  date: TDate,
  ampm: boolean | undefined,
  onChange: PickerOnChangeFn<TDate>
) {
  const utils = useUtils<TDate>()
  const meridiemMode = getMeridiem(date, utils)

  const handleMeridiemChange = React.useCallback(
    (mode: 'am' | 'pm') => {
      const timeWithMeridiem = convertToMeridiem<TDate>(date, mode, Boolean(ampm), utils)
      onChange(timeWithMeridiem, 'partial')
    },
    [ampm, date, onChange, utils]
  )

  return { meridiemMode, handleMeridiemChange }
}
