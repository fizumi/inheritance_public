import * as _ from './getEndDateOfIsParent'

import data1 from '../../../data/parent/実1+実特養2.json'
import data2 from '../../../data/parent/実2+特養2.json'
import data3 from '../../../data/parent/実2+特養2(E単独離縁).json'
import data4 from '../../../data/parent/実2+養1+養1.json'
import data5 from '../../../data/parent/実2+養2.json'

import data6 from '../../../data/parent/実1+実特養2--養2.json'
import data7 from '../../../data/parent/実1+養2--実特養2.json'

test('実1+実特養2', (): void => {
  expect(_.getEndDateOfIsParentForTest(data1, 'B', 'A')).toBe('2020-01-01T00:00:00+09:00')
  expect(_.getEndDateOfIsParentForTest(data1, 'C', 'A')).toBe(null)
  expect(_.getEndDateOfIsParentForTest(data1, 'D', 'A')).toBe(null)
})

test('実2+特養2', (): void => {
  expect(_.getEndDateOfIsParentForTest(data2, 'B', 'A')).toBe('2021-01-01T00:00:00+09:00')
  expect(_.getEndDateOfIsParentForTest(data2, 'C', 'A')).toBe('2021-01-01T00:00:00+09:00')
  expect(_.getEndDateOfIsParentForTest(data2, 'D', 'A')).toBe(null)
  expect(_.getEndDateOfIsParentForTest(data2, 'E', 'A')).toBe(null)
})

test('実2+特養2(E単独離縁)', (): void => {
  expect(_.getEndDateOfIsParentForTest(data3, 'B', 'A')).toBe('2021-01-01T00:00:00+09:00')
  expect(_.getEndDateOfIsParentForTest(data3, 'C', 'A')).toBe('2021-01-01T00:00:00+09:00')
  expect(_.getEndDateOfIsParentForTest(data3, 'D', 'A')).toBe(null)
  expect(_.getEndDateOfIsParentForTest(data3, 'E', 'A')).toBe('2023-01-01T00:00:00+09:00')
})

test('実2+養1+養1', (): void => {
  expect(_.getEndDateOfIsParentForTest(data4, 'B', 'A')).toBe(null)
  expect(_.getEndDateOfIsParentForTest(data4, 'C', 'A')).toBe(null)
  expect(_.getEndDateOfIsParentForTest(data4, 'D', 'A')).toBe(null)
  expect(_.getEndDateOfIsParentForTest(data4, 'E', 'A')).toBe(null)
})

test('実2+養2', (): void => {
  expect(_.getEndDateOfIsParentForTest(data5, 'B', 'A')).toBe(null)
  expect(_.getEndDateOfIsParentForTest(data5, 'C', 'A')).toBe(null)
  expect(_.getEndDateOfIsParentForTest(data5, 'D', 'A')).toBe(null)
  expect(_.getEndDateOfIsParentForTest(data5, 'E', 'A')).toBe(null)
})

test('特別養子縁組の後に養子縁組', (): void => {
  expect(_.getEndDateOfIsParentForTest(data6, 'B', 'A')).toBe('2020-01-01T00:00:00+09:00')
  expect(_.getEndDateOfIsParentForTest(data6, 'C', 'A')).toBe(null)
  expect(_.getEndDateOfIsParentForTest(data6, 'D', 'A')).toBe(null)
  expect(_.getEndDateOfIsParentForTest(data6, 'E', 'A')).toBe(null)
  expect(_.getEndDateOfIsParentForTest(data6, 'F', 'A')).toBe(null)
})

test('養子縁組の後に特別養子縁組', (): void => {
  expect(_.getEndDateOfIsParentForTest(data7, 'B', 'A')).toBe('2023-01-01T00:00:00+09:00')
  expect(_.getEndDateOfIsParentForTest(data7, 'C', 'A')).toBe(null)
  expect(_.getEndDateOfIsParentForTest(data7, 'D', 'A')).toBe(null)
  expect(_.getEndDateOfIsParentForTest(data7, 'E', 'A')).toBe('2023-01-01T00:00:00+09:00')
  expect(_.getEndDateOfIsParentForTest(data7, 'F', 'A')).toBe('2023-01-01T00:00:00+09:00')
})
