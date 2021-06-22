import { readonlyArray as A, function as F, option as O } from 'fp-ts'
import * as _ from './utils'

test('startDateOrd', (): void => {
  F.pipe(
    A.sort(_.startDateOrd)([
      { startDate: '1991' },
      { startDate: '2001' },
      { startDate: null },
      { startDate: '2020' },
    ]),
    (x) =>
      expect(x).toEqual([
        { startDate: '2020' },
        { startDate: '2001' },
        { startDate: '1991' },
        { startDate: null },
      ])
  )

  F.pipe(
    A.sort(_.startDateOrd)([
      { type: '実親子', startDate: null, endDate: null },
      { type: '実親子', startDate: '2020-01-01T00:00:00+09:00', endDate: null },
    ]),
    (x) =>
      expect(x).toEqual([
        { type: '実親子', startDate: '2020-01-01T00:00:00+09:00', endDate: null },
        { type: '実親子', startDate: null, endDate: null },
      ])
  )
})

test('keyAndHasStartDateOrd', (): void => {
  F.pipe(
    A.sort(_.keyAndHasStartDateOrd)([
      ['', { startDate: '1991-' }],
      ['', { startDate: '2001-' }],
      ['', { startDate: null }],
      ['', { startDate: '2020-' }],
    ]),
    (x) =>
      expect(x).toEqual([
        ['', { startDate: '2020-' }],
        ['', { startDate: '2001-' }],
        ['', { startDate: '1991-' }],
        ['', { startDate: null }],
      ])
  )
})

test('getLatestStartDateKVTuple', (): void => {
  F.pipe(
    _.getLatestStartDateKVTuple({
      a: { startDate: '1' },
      b: { startDate: '100' },
      c: { startDate: null },
      d: { startDate: '10' },
    }),
    O.map((x) => expect(x).toEqual(['b', { startDate: '100' }]))
  )
  expect(_.getLatestStartDateKVTuple({})).toEqual(O.none)
})
