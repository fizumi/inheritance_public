import * as _ from './date-fns'
import { isValid, parseISO } from 'date-fns'
import { function as F, either as E } from 'fp-ts'
// import { format, utcToZonedTime } from 'date-fns-tz'

xtest('timestampStr', (): void => {
  console.log(_.timestampStr())
})

test('formatISO8601JST', (): void => {
  expect(_.formatISO8601JST(new Date('2020/07/07 00:00:00'))).toBe('2020-07-07T00:00:00+09:00')
  expect(_.formatISO8601JST(new Date('2020/07/07 23:59:59'))).toBe('2020-07-07T23:59:59+09:00')

  console.log(parseISO('2020-07-07T00:00:00+09:00'))
  console.log(parseISO('2020-07-07T23:59:59+09:00'))
})

test('date2string', (): void => {
  expect(_.date2string(new Date('2020/07/07'))).toBe('2020/07/07')
  expect(_.date2string(new Date('2020/07/07 23:59:59'))).toBe('2020/07/07')
  expect(_.date2string(new Date('2020/07/07 00:00:00'))).toBe('2020/07/07')
})
test('dateString2jsDate', (): void => {
  expect(_.dateString2jsDate('2020/07/07').toISOString()).toEqual('2020-07-06T15:00:00.000Z')
  expect(isValid(_.dateString2jsDate('2020/07/0_'))).toBe(false)
})
test('isValidDateString', (): void => {
  expect(_.isValidDateString('2020/07/07')).toBe(true)
})

test('getDatePlus9 getTokyoDate getUTCDate', (): void => {
  const date = _.getDatePlus9TZ(1991, 10, 6)
  const uctDate = _.getUTCDate(1991, 10, 6)
  expect(date.toISOString()).toBe('1991-10-05T15:00:00.000Z')
  expect(uctDate.toISOString()).toBe('1991-10-06T00:00:00.000Z')
  expect(_.date2string(date)).toBe('1991/10/06')
})

test('parseJpDateString', (): void => {
  expect(F.pipe(_.parseJpDateString('H03.10.06'), E.map(_.date2string))).toEqual(
    E.right('1991/10/06')
  )
  expect(F.pipe(_.parseJpDateString('H03/10/06'), E.map(_.date2string))).toEqual(
    E.right('1991/10/06')
  )
  expect(F.pipe(_.parseJpDateString('H3/10/6'), E.map(_.date2string))).toEqual(
    E.right('1991/10/06')
  )
  expect(F.pipe(_.parseJpDateString('M1/1/25'), E.map(_.date2string))).toEqual(
    E.right('1868/01/25')
  )
  expect(F.pipe(_.parseJpDateString('M45/7/29'), E.map(_.date2string))).toEqual(
    E.right('1912/07/29')
  )
  expect(F.pipe(_.parseJpDateString('T1/7/30'), E.map(_.date2string))).toEqual(
    E.right('1912/07/30')
  )
  expect(F.pipe(_.parseJpDateString('T15/12/24'), E.map(_.date2string))).toEqual(
    E.right('1926/12/24')
  )
  expect(F.pipe(_.parseJpDateString('S1/12/25'), E.map(_.date2string))).toEqual(
    E.right('1926/12/25')
  )
  expect(F.pipe(_.parseJpDateString('S64/01/07'), E.map(_.date2string))).toEqual(
    E.right('1989/01/07')
  )
  expect(F.pipe(_.parseJpDateString('H1/01/08'), E.map(_.date2string))).toEqual(
    E.right('1989/01/08')
  )
  expect(F.pipe(_.parseJpDateString('H31/04/30'), E.map(_.date2string))).toEqual(
    E.right('2019/04/30')
  )
  expect(F.pipe(_.parseJpDateString('R01/05/01'), E.map(_.date2string))).toEqual(
    E.right('2019/05/01')
  )
  expect(F.pipe(_.parseJpDateString('A01/05/01'), E.map(_.date2string))).toEqual(
    E.left('形式不一致')
  )
  expect(F.pipe(_.parseJpDateString('H1/01/07'), E.map(_.date2string))).toEqual(E.left('初日未満'))
  expect(F.pipe(_.parseJpDateString('H32/01/01'), E.map(_.date2string))).toEqual(E.left('年数超過'))
  expect(F.pipe(_.parseJpDateString('H31/05/01'), E.map(_.date2string))).toEqual(
    E.left('最終日超過')
  )
})

test('dateToJpStr', (): void => {
  expect(F.pipe(_.parseJpDateString('M1/01/25'), E.map(_.dateToJpStr('nyy/mm/dd')))).toEqual(
    E.right('M01/01/25')
  )
  expect(F.pipe(_.parseJpDateString('M45/07/29'), E.map(_.dateToJpStr('nyy/mm/dd')))).toEqual(
    E.right('M45/07/29')
  )
  expect(F.pipe(_.parseJpDateString('T01/07/30'), E.map(_.dateToJpStr('nyy/mm/dd')))).toEqual(
    E.right('T01/07/30')
  )
  expect(F.pipe(_.parseJpDateString('T15/12/24'), E.map(_.dateToJpStr('nyy/mm/dd')))).toEqual(
    E.right('T15/12/24')
  )
  expect(F.pipe(_.parseJpDateString('S01/12/25'), E.map(_.dateToJpStr('nyy/mm/dd')))).toEqual(
    E.right('S01/12/25')
  )
  expect(F.pipe(_.parseJpDateString('S64/01/07'), E.map(_.dateToJpStr('nyy/mm/dd')))).toEqual(
    E.right('S64/01/07')
  )
  expect(F.pipe(_.parseJpDateString('H01/01/08'), E.map(_.dateToJpStr('nyy/mm/dd')))).toEqual(
    E.right('H01/01/08')
  )
  expect(F.pipe(_.parseJpDateString('H31/04/30'), E.map(_.dateToJpStr('nyy/mm/dd')))).toEqual(
    E.right('H31/04/30')
  )
  expect(F.pipe(_.parseJpDateString('R01/05/01'), E.map(_.dateToJpStr('nyy/mm/dd')))).toEqual(
    E.right('R01/05/01')
  )
})
