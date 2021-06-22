import * as _ from './fp'
import { option as O } from 'fp-ts'

test('getNumberFromPx', (): void => {
  const getNumberFromPx = _.getNumberFrom('px')
  expect(getNumberFromPx('0px')).toEqual(O.some(0))
  expect(getNumberFromPx('16px')).toEqual(O.some(16))
  expect(getNumberFromPx('16.01px')).toEqual(O.some(16.01))
  expect(getNumberFromPx('hoge16pxhuga')).toEqual(O.some(16))
  expect(getNumberFromPx('hoge 16.2px huga')).toEqual(O.some(16.2))
  expect(getNumberFromPx('')).toEqual(O.none)
  expect(getNumberFromPx('px')).toEqual(O.none)
  expect(getNumberFromPx('2em')).toEqual(O.none)
})
