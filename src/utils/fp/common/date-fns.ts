// import { flow } from 'fp-ts/lib/function'
import { formatWithOptions, isMatch, parseWithOptions, isValid } from 'date-fns/fp'
import { parseISO } from 'date-fns'
import ja from 'date-fns/locale/ja'
import { nowInJapan } from 'src/utils/common'
import * as R from 'ramda'
import { either as E, function as F } from 'fp-ts'
import { format as formatTZ } from 'date-fns-tz'

export const isISO = F.flow(parseISO, isValid)

// const TIME_ZONE_TOKYO = 'Asia/Tokyo'
export const DATE_FORMAT = 'yyyy/MM/dd'

const format = formatWithOptions({ locale: ja })

export const formatISO8601JST = (d: Date): string =>
  formatTZ(d, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: 'Asia/Tokyo' })

const twoDigit = (s: string | number): string => ('0' + s).slice(-2)
export const getUTCDate = (y: number | string, m: number | string, d: number | string): Date =>
  parseISO(`${y}-${twoDigit(m)}-${twoDigit(d)}T00:00:00.000Z`)

export const getDatePlus9TZ = (y: number | string, m: number | string, d: number | string): Date =>
  parseISO(`${y}-${twoDigit(m)}-${twoDigit(d)}T00:00:00+09:00`)

// https://date-fns.org/v2.16.1/docs/format
export const timestampStr = (): string => format('yyMMddhhmmssSSS', nowInJapan())

// https://github.com/date-fns/date-fns/blob/master/src/fp/formatWithOptions/index.js
/**
 * 動作環境のタイムゾーンを考慮した出力を行う（具体的には以下参照）
 *
 * ```javascript
 * const date = _.getDatePlus9(1991, 10, 6)
 * const uctDate = _.getUTCDate(1991, 10, 6)
 * expect(date.toISOString()).toBe('1991-10-05T15:00:00.000Z')
 * expect(uctDate.toISOString()).toBe('1991-10-06T00:00:00.000Z')
 * expect(_.jsDate2format(date)).toBe('1991/10/06')
 * ```
 */
export const date2string: (date: Date) => string = format(DATE_FORMAT)

// https://github.com/date-fns/date-fns/blob/master/src/fp/isMatch/index.js
export const isValidDateString = isMatch(DATE_FORMAT)

// https://date-fns.org/v2.16.1/docs/parse
export const dateString2jsDate = parseWithOptions({ locale: ja }, 0, DATE_FORMAT)

// narrow, short, long は Intl.DateTimeFormat のマネ
// https://ja.wikipedia.org/wiki/%E5%85%83%E5%8F%B7%E4%B8%80%E8%A6%A7_(%E6%97%A5%E6%9C%AC)
export const eraInfo = [
  {
    era: '令和',
    short: '令',
    narrow: 'R',
    timestamp: getDatePlus9TZ(2019, 5, 1),
    startYear: 2019,
    lastYear: undefined,
    startDay: '05/01',
    lastDay: undefined,
  },
  {
    era: '平成',
    short: '平',
    narrow: 'H',
    timestamp: getDatePlus9TZ(1989, 1, 8),
    startYear: 1989,
    lastYear: '31',
    startDay: '01/08',
    lastDay: '04/30',
  },
  {
    era: '昭和',
    short: '昭',
    narrow: 'S',
    timestamp: getDatePlus9TZ(1926, 12, 25),
    startYear: 1926,
    lastYear: '64',
    startDay: '12/25',
    lastDay: '01/07',
  },
  {
    era: '大正',
    short: '大',
    narrow: 'T',
    timestamp: getDatePlus9TZ(1912, 7, 30),
    startYear: 1912,
    lastYear: '15',
    startDay: '07/30',
    lastDay: '12/24',
  },
  {
    era: '明治',
    short: '明',
    narrow: 'M',
    timestamp: getDatePlus9TZ(1868, 1, 25),
    startYear: 1868,
    lastYear: '45',
    startDay: '01/25',
    lastDay: '07/29',
  },
] as const

const eraLetters = R.pluck('narrow', eraInfo)
type EraLetters = typeof eraLetters[number]

const separator = '[/.]?'
const number = '\\d{1,2}'

/**
 * e.g.) "H01/01/01", "S1/1/1"
 * TODO short も対応させる
 */
const narrowFormatRegExp = new RegExp(
  `^([${eraLetters.join('|')}])(${number})${separator}(${number})${separator}(${number})$`
)

export const findEraInfoByEra = (era: EraLetters) => R.find(R.propEq('narrow', era), eraInfo)
export const findEraInfoByStartYear = (startYear: number) =>
  R.find(R.propEq('startYear', startYear), eraInfo)

/**
 * string( N00/00/00 ) -> Date
 * 修正は行わない
 */
export const parseJpDateString = (s: string): E.Either<string, Date> => {
  const data = s.match(narrowFormatRegExp)
  if (!data) return E.left('形式不一致')

  const [_, era, y_, m_, d_] = data
  const [yy, mm, dd] = [y_, m_, d_].map(twoDigit)

  const i = findEraInfoByEra(era as EraLetters)
  if (i === undefined) return E.left('eraInfo または narrowFormatRegExp の設定ミス')

  if (yy === '01' && `${mm}/${dd}` < i.startDay) return E.left('初日未満')

  if (i.lastYear && yy > i.lastYear) return E.left('年数超過')

  if (i.lastYear && i.lastDay && yy === i.lastYear && `${mm}/${dd}` > i.lastDay)
    return E.left('最終日超過')

  const yyyy = String(i.startYear - 1 + Number(yy))

  return E.right(getDatePlus9TZ(yyyy, mm, dd))
}

/**
 * Date -> string( N00.00.00 )
 */
export const dateToJpStr =
  (format = 'nyy.mm.dd') =>
  (d: Date): string => {
    for (let i = 0; i < eraInfo.length; i++) {
      const info = eraInfo[i]
      if (d.getTime() >= info.timestamp.getTime()) {
        const [y_, m_, d_] = [
          d.getFullYear() - (info.startYear - 1),
          d.getMonth() + 1,
          d.getDate(),
        ].map(String)
        let ret = format
        ret = ret.replace(/n/g, info.narrow)
        ret = ret.replace(/N/g, info.era)
        ret = ret.replace(/yy/g, twoDigit(y_))
        ret = ret.replace(/y/g, y_)
        ret = ret.replace(/mm/g, twoDigit(m_))
        ret = ret.replace(/y/g, m_)
        ret = ret.replace(/dd/g, twoDigit(d_))
        ret = ret.replace(/d/g, d_)
        return ret
      }
    }
    return ''
  }

/*
https://ja.wikipedia.org/wiki/ISO_8601#%E6%97%A5%E6%9C%AC_(JIS_X_0301)
上記URLによれば, メタ文字は「N」
また, セパレータは 「.」 が標準
*/
