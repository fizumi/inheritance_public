import * as _ from './utils'
import * as R from 'ramda'
test('emptyStr2zero', (): void => {
  expect(_.emptyStr2zero('')).toBe(0)
  expect(_.emptyStr2zero(1)).toBe(1)
  expect(_.zero2emptyStr(0)).toBe('')
  expect(_.zero2emptyStr(1)).toBe(1)
})
test('emptyStr2zeroStr', (): void => {
  expect(_.emptyStr2zeroStr('')).toBe('0')
  expect(_.emptyStr2zeroStr('1')).toBe('1')
  expect(_.zeroStr2emptyStr('0')).toBe('')
  expect(_.zeroStr2emptyStr('1')).toBe('1')
})

it('createIdentityOrA2B', (): void => {
  const [a2b, b2a] = _.createIdentityOrA2B('a', 'b')
  expect(a2b('a')).toEqual('b')
  expect(a2b('c')).toEqual('c')
  expect(a2b(null)).toEqual(null)
  expect(b2a('b')).toEqual('a')
  expect(b2a('c')).toEqual('c')
  expect(b2a(null)).toEqual(null)
})

const csv2array = R.split(',')
it('csv2array', (): void => {
  expect(csv2array('')).toEqual([''])
  expect(csv2array('1')).toEqual(['1'])
  expect(csv2array('1,2')).toEqual(['1', '2'])
})

const array2csv = R.join(',')
it('array2csv', (): void => {
  expect(array2csv([])).toEqual('')
  expect(array2csv([''])).toEqual('')
  expect(array2csv(['1'])).toEqual('1')
  expect(array2csv(['1', '2'])).toEqual('1,2')
})
