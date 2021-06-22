import * as _ from './date'
import { getUTCDate } from 'src/utils/fp/common' // FIXME

xtest('normalizeGengou 0', (): void => {
  expect(_.normalizeJpEra('')).toBe('')
  expect(_.normalizeJpEra('1')).toBe('')
  expect(_.normalizeJpEra('a')).toBe('')
  expect(_.normalizeJpEra('A')).toBe('')
  expect(_.normalizeJpEra('h')).toBe('H')
  expect(_.normalizeJpEra('H')).toBe('H')
  expect(_.normalizeJpEra('ｈ')).toBe('')
  expect(_.normalizeJpEra('a', '_')).toBe('_')
})

// const dateTimeFormat = new Intl.DateTimeFormat(['ja-JP-u-ca-japanese'], { era: 'long' })
test('parse', (): void => {
  expect(_.jpDateTimeFormat.format(getUTCDate(1991, 10, 6)).slice(0, 1)).toBe('H')
  // 慶 と M の境界が不明 c.f. https://qiita.com/nue_of_k/items/ea3dae4a1be9ad6ac953
  expect(_.jpDateTimeFormat.format(getUTCDate(1900, 10, 24)).slice(0, 1)).toBe('M')
  expect(_.jpDateTimeFormat.format(getUTCDate(1912, 7, 29)).slice(0, 1)).toBe('M')
  expect(_.jpDateTimeFormat.format(getUTCDate(1912, 7, 30)).slice(0, 1)).toBe('T')
  expect(_.jpDateTimeFormat.format(getUTCDate(1926, 12, 24)).slice(0, 1)).toBe('T')
  expect(_.jpDateTimeFormat.format(getUTCDate(1926, 12, 25)).slice(0, 1)).toBe('S')
  expect(_.jpDateTimeFormat.format(getUTCDate(1989, 1, 7)).slice(0, 1)).toBe('S')
  expect(_.jpDateTimeFormat.format(getUTCDate(1989, 1, 8)).slice(0, 1)).toBe('H')
  expect(_.jpDateTimeFormat.format(getUTCDate(2019, 4, 30)).slice(0, 1)).toBe('H')
  expect(_.jpDateTimeFormat.format(getUTCDate(2019, 5, 1)).slice(0, 1)).toBe('R')
})

test('parse', (): void => {
  expect(_.toJpYear('1900')).toBe('M33')
  expect(_.toJpYear('1912')).toBe('T01')
  expect(_.toJpYear('1926')).toBe('S01')
  expect(_.toJpYear('1989')).toBe('H01')
  expect(_.toJpYear('2019')).toBe('R01')
})
// test('format', (): void => {
//   expect(_.format(new Date(1991, 10, 6), 'bK/MM/DD')).toBe('H03/10/06')
//   expect(_.format(new Date(1989, 1, 1), 'bK/MM/DD')).toBe('H03/01/01')
//   expect(_.format(new Date(1998, 10, 10), 'bK/MM/DD')).toBe('H10/10/10')
// })

// test('parse', (): void => {
//   expect(_.parse('H03/10/06')).toBe(new Date(1991, 10, 6))
// })
