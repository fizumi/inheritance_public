import DateFnsUtils from '@date-io/date-fns'
import { addYears, endOfYear, getYear, isBefore, parseISO, startOfYear } from 'date-fns'
import jaLocale from 'date-fns/locale/ja'
import { either as E, function as F } from 'fp-ts'
import { useDispatch, useSelector } from 'react-redux'
import { createSelector } from 'reselect'
import {
  dateToJpStr,
  DATE_FORMAT,
  findEraInfoByStartYear,
  parseJpDateString,
} from 'src/utils/fp/common'
import { dateWithMaskFormatter, japaneseDateWithMaskFormatter } from 'src/utils/react/hooks/useRifm'
import {
  setDateDisplayType,
  dateDisplayTypeDict,
  selectors as settingsSelectors,
} from '../slices/settings'

const parseJpDateString_ = F.flow(
  parseJpDateString,
  E.getOrElseW(() => new Date('Invalid Date'))
)
const originalAdapter = new DateFnsUtils({ locale: jaLocale })

export const useDateAdapter = () => {
  return useSelector(
    createSelector(settingsSelectors.dateDisplayType, (dateDisplayType) => {
      const adapter = new DateFnsUtils({ locale: jaLocale })

      if (dateDisplayType === '西暦') return adapter

      adapter.format = (date, formatKey) => {
        const originalRet = () => originalAdapter.format(date, formatKey)
        if (formatKey === 'year') {
          return dateToJpStr('Ny')(date)
        }
        return originalRet()
      }
      //utils.formatByString(date, inputFormat)
      adapter.formatByString = (date, formatString) => {
        if (formatString === dateDisplayTypeDict.和暦) {
          console.condlog('date picker', 'adapter.formatByString', date, formatString)
          return dateToJpStr('nyy.mm.dd')(date)
        }
        return originalAdapter.formatByString(date, formatString)
      }
      adapter.parse = (value, formatString) => {
        if (formatString === dateDisplayTypeDict.和暦) {
          console.condlog('date picker', 'adapter.parse', value, formatString)
          return parseJpDateString_(value)
        }
        return originalAdapter.parse(value, formatString)
      }
      adapter.date = (value) => {
        if (typeof value === 'undefined') {
          return new Date()
        }

        if (value === null) {
          return null as any
        }

        if (typeof value === 'string') {
          // console.condlog('date picker', 'adapter.date', value)
          return parseISO(value)
        }
        return new Date(value)
      }
      adapter.getYearRange = (start: Date, end: Date) => {
        const startDate = startOfYear(start)
        const endDate = endOfYear(end)
        const years: Date[] = []

        let current = startDate
        while (isBefore(current, endDate)) {
          years.push(current)
          const eraInfo = findEraInfoByStartYear(getYear(current))
          if (eraInfo) {
            years.push(eraInfo.timestamp)
          }
          current = addYears(current, 1)
        }

        return years
      }
      return adapter
    })
  )
}
export const useDateUtils = () => {
  const dispatch = useDispatch()
  return useSelector(
    createSelector(
      settingsSelectors.dateDisplayType,
      useDateAdapter,
      (dateDisplayType, dateAdapter) => {
        const isJp = dateDisplayType === '和暦'
        const myDateUtils = {
          placeholder: isJp ? '例) R01.01.01' : 'yyyy/mm/dd',
          inputFormat: isJp ? dateDisplayType : DATE_FORMAT,
          rifmFormatter: isJp ? japaneseDateWithMaskFormatter : dateWithMaskFormatter,
        }

        return {
          setDateDisplayType: F.flow(setDateDisplayType, dispatch),
          dateDisplayType,
          dateAdapter,
          myDateUtils,
          dateDisplayTypeDict,
        }
      }
    )
  )
}
