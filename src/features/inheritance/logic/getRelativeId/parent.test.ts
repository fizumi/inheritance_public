import * as _ from './getters'

import * as R from 'ramda'

import { pipe } from 'fp-ts/lib/function'

import data1 from '../../data/parent/実1+実特養2.json'
import data2 from '../../data/parent/実2+特養2.json'
import data3 from '../../data/parent/実2+特養2(E単独離縁).json'
import data4 from '../../data/parent/実2+養1+養1.json'
import data5 from '../../data/parent/実2+養2.json'

import data6 from '../../data/parent/実1+実特養2--養2.json'
import data7 from '../../data/parent/実1+養2--実特養2.json'

import { equalsIDs } from '../../shared/utils'

test('実1+実特養2', (): void => {
  expect(
    pipe(_.getParentIDsAtTheDate(data1, ['A', '2024-01-01T00:00:00+09:00']), equalsIDs(['D', 'C']))
  ).toBe(true)
})
test('実2+特養2', (): void => {
  expect(
    pipe(_.getParentIDsAtTheDate(data2, ['A', '2024-01-01T00:00:00+09:00']), equalsIDs(['D', 'E']))
  ).toBe(true)
})
test('実2+特養2(E単独離縁)', (): void => {
  expect(
    pipe(
      _.getParentIDsAtTheDate(data3, ['A', '2024-01-01T00:00:00+09:00']),
      // R.tap((x) => console.log(x)),
      equalsIDs(['D'])
    )
  ).toBe(true)
})

test('実2+養1+養1', (): void => {
  expect(
    pipe(
      _.getParentIDsAtTheDate(data4, ['A', '2024-01-01T00:00:00+09:00']),
      // R.tap((x) => console.log(x)),
      equalsIDs(['B', 'C', 'D', 'E'])
    )
  ).toBe(true)
})

test('実2+養2', (): void => {
  expect(
    pipe(
      _.getParentIDsAtTheDate(data5, ['A', '2024-01-01T00:00:00+09:00']),
      equalsIDs(['B', 'C', 'D', 'E'])
    )
  ).toBe(true)
})

test('特別養子縁組の後に養子縁組', (): void => {
  expect(
    pipe(
      _.getParentIDsAtTheDate(data6, ['A', '2024-01-01T00:00:00+09:00']),
      equalsIDs(['C', 'D', 'E', 'F'])
    )
  ).toBe(true)
})

test('養子縁組の後に特別養子縁組', (): void => {
  expect(
    pipe(_.getParentIDsAtTheDate(data7, ['A', '2024-01-01T00:00:00+09:00']), equalsIDs(['C', 'D']))
  ).toBe(true)
})
